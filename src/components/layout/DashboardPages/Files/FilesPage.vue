<template>
  <div style="margin: 1rem 2.1rem 5rem 1rem;">
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <GenericDataTable 
      :headers="headers" 
      :items="paginatedFiles" 
      title="Files Table" 
      :showExpand="true"
      :loading="loading"
      hide-default-footer
    >
      <template v-slot:toolbar-actions>
        <div class="d-flex mb-4 align-center flex-wrap">
          <div class="d-flex align-center">
            <v-menu v-model="startDateMenu" offset-y >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="startDate" placeholder="Start Date" readonly v-bind="attrs" v-on="on" dense outlined
                  style="max-width: 110px; height: 35px; margin-right: 0.3rem;" ></v-text-field>
              </template>
              <v-date-picker v-model="startDate" @input="startDateMenu = false" ></v-date-picker>
            </v-menu>
            <v-menu v-model="endDateMenu" offset-y >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="endDate" placeholder="End Date" readonly v-bind="attrs" v-on="on" dense outlined
                   style="max-width: 110px; height: 35px; margin-right: 0.3rem;" ></v-text-field>
              </template>
              <v-date-picker v-model="endDate" @input="endDateMenu = false" ></v-date-picker>
            </v-menu>
            <GenericButton color="primary" @click="applyDateFilter" style="margin-right: 0.3rem;"> Filter </GenericButton>
            <GenericButton color="secondary" @click="clearDateFilter" v-if="startDate || endDate" style="margin-right: 0.3rem;">
              Reset </GenericButton>
            <v-select v-if="isAdmin" v-model="selectedUser" :items="userOptions" placeholder="Select User" dense outlined clearable
              style="max-width: 200px; height: 35px; margin-right: 0.3rem;" @change="applyUserFilter" ></v-select>
          </div>
          <div class="d-flex">
            <GenericButton color="primary" icon="mdi-plus" background @click="openDialog(null)" id="add-new-file-btn" v-if="canCreateFiles"> 
              File </GenericButton>
            <GenericButton color="success" background icon="mdi-download" @click="downloadAllFiles" :disabled="getFilteredFiles.length === 0"
              id="download-files-btn"> 
              Excel </GenericButton>
          </div>
        </div>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-list>
            <v-list-item v-for="sheet in item.sheets" :key="sheet.name" @click="viewSheet(item.id, sheet.name)">
              <v-list-item-content>
                <v-list-item-title>{{ sheet.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  Created: {{ formatDate(sheet.createdAt) }} | Updated: {{ formatDate(sheet.updatedAt) }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action v-if="isAdmin">
                <v-icon small @click.stop="openDialog(item)">mdi-cog</v-icon>
              </v-list-item-action>
            </v-list-item>
            </v-list>
          </td>
        </template>
      <template v-slot:column-createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
      <template v-slot:column-updatedAt="{ item }">
        {{ formatDate(item.updatedAt) }}
      </template>
      <template v-slot:column-actions="{ item }">
       <div class="d-flex justify-content-center">
        <div>
          <TableActions :item="item" 
          :onEdit="canEditFile(item) ? openDialog : null" 
          :onView="viewFile" 
          :onDelete="canDeleteFile(item) ? openDeleteDialog : null" />
        </div>
         <!-- share menu -->
         <div>
          <v-btn v-if="isAdmin || isCreator(item)" icon small class="ml-1" @click="openDialog(item)" title="Share File" >
            <v-icon small color="info">mdi-share</v-icon>
          </v-btn>
         </div>
       </div>
      </template>
    </GenericDataTable>
    <v-card>
      <v-card-text class="pa-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-caption">
            Showing {{ pagination.startIndex + 1 }} to {{ pagination.endIndex }} of {{ getFilteredFiles.length }} files
          </span>
          <div class="d-flex align-center">
            <span class="text-caption mr-2">Rows per page:</span>
            <v-select
              v-model="pagination.itemsPerPage"
              :items="itemsPerPageOptions"
              dense outlined hide-details
              style="max-width: 80px;"
              @change="resetPagination"
            ></v-select>
            <v-pagination
              v-model="pagination.currentPage"
              :length="pagination.totalPages"
              :total-visible="10"
              class="ml-4" color="primary"
            ></v-pagination>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <FileDialog :dialog="dialog" :editedItem="editedItem" @update:dialog="dialog = $event" @update:editedItem="editedItem = $event"
      @save="saveFile" @closeDialog="closeDialog" v-if="canCreateFiles || canEditFiles" />
    <DeleteDialog :dialog="dialogDelete" @confirm="deleteFileConfirm" @closeDialog="closeDialog" v-if="canDeleteFiles" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import GenericButton from "../../../common/GenericButton.vue";
import GenericDataTable from "../../../common/GenericDataTable.vue";
import TableActions from "../../../custom-columns/TableActions.vue";
import FileDialog from "../modals/FileDialog.vue";
import DeleteDialog from "../modals/DeleteDialog.vue";
import * as XLSX from "xlsx";

export default {
  name: "FilesPage",
  components: { GenericButton, GenericDataTable, TableActions, FileDialog, DeleteDialog },
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      editedItem: null,
      loading: false,
      startDateMenu: false,
      endDateMenu: false,
      startDate: null,
      endDate: null,
      selectedUser: null,
      snackbar: { show: false, message: '', color: 'success' },
      pagination: {
        currentPage: 1, itemsPerPage: 10, totalPages: 1, startIndex: 0, endIndex: 0
      },
      itemsPerPageOptions: [5, 10],
      headers: [
        { text: "", value: "data-table-expand", width: "50px" },
        { text: "File Name", value: "name", width: "200px", class: "font-weight-bold", filterable: true },
        { text: "Created At", value: "createdAt", width: "200px", filterable: true, sortable: true },
        { text: "Updated At", value: "updatedAt", width: "200px", filterable: true, sortable: true },
        { text: "Added By", value: "addedBy", width: "120px", filterable: true },
        { text: "Actions", value: "actions", sortable: false, align: "center", width: "150px"},
      ],
      alphabeticalColumns: Array.from({ length: 26 }, (_, i) => ({
        field: String.fromCharCode(65 + i),
        title: String.fromCharCode(65 + i),
        type: "string",
      })),
    };
  },
  computed: {
    ...mapGetters("files", ["getFiles", "getFilteredFiles"]),
    ...mapGetters("roles", ["canUserPerformAction", "getCurrentUserRole", "getAllUsers"]),
    ...mapGetters("auth", ["currentUser"]), 
    paginatedFiles() {
      const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;
      return this.getFilteredFiles.slice(start, end);
    },
    isAdmin() {
      return this.getCurrentUserRole === 'admin';
    },

    userOptions() {
      const users = this.getAllUsers || [];
      return [
        { text: 'All Users', value: null },
        ...users.map(user => ({
          text: user.username || user.email || 'Unknown User',
          value: user.username || user.id
        }))
      ];
    },
    canCreateFiles() {
      return this.canUserPerformAction('files', 'create') || this.isAdmin;
    },
    canEditFiles() {
      return this.canUserPerformAction('files', 'update') || this.isAdmin;
    },
    canDeleteFiles() {
      return this.canUserPerformAction('files', 'delete') || this.isAdmin;
    },
    canEditFile() {
      return (item) => {
        return this.isAdmin || 
               (item.addedBy === this.currentUser?.username) || 
               ((item.editors || []).includes(this.currentUser?.uid));
      };
    },
    
    canDeleteFile() {
      return (item) => {
        return this.isAdmin || (item.addedBy === this.currentUser?.username);
      };
    },
    
    isCreator() {
      return (item) => {
        return item.addedBy === this.currentUser?.username;
      };
    },
    
    isViewerOnly() {
      return (item) => {
        if (this.isAdmin) return false;
        if (item.addedBy === this.currentUser?.username) return false;
        if ((item.editors || []).includes(this.currentUser?.uid)) return false;
        return (item.viewers || []).includes(this.currentUser?.uid) || 
               (item.sharedWith || []).includes(this.currentUser?.uid);
      };
    },
    
    isEditor() {
      return (item) => {
        if (this.isAdmin) return true;
        return item.addedBy === this.currentUser?.username || 
               (item.editors || []).includes(this.currentUser?.uid);
      };
    }
  },
  watch: {
    'pagination.currentPage': function() {
      this.updatePaginationIndices();
    },
    'pagination.itemsPerPage': function() {
      this.resetPagination();
    }
  },
  methods: {
    ...mapActions("files", ["addFile", "updateFile", "deleteFile", "fetchFiles"]),
    ...mapActions("roles", ["fetchAllUsers"]),
    showNotification(message, type = 'success') {
      this.snackbar.message = message;
      this.snackbar.color = type;
      this.snackbar.show = true;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    async applyDateFilter() {
      try {
        await this.fetchFiles({ 
          startDate: this.startDate, 
          endDate: this.endDate 
        });
        this.resetPagination();
        this.showNotification('Date filter applied successfully');
      } catch (error) {
        console.error('applyDateFilter: Error:', error);
        this.showNotification('Error applying date filter: ' + error.message, 'error');
      }
    },
    async clearDateFilter() {
      this.startDate = null;
      this.endDate = null;
      try {
        await this.fetchFiles();
        this.resetPagination();
        this.showNotification('Date filter cleared');
      } catch (error) {
        console.error('clearDateFilter: Error:', error);
        this.showNotification('Error clearing date filter: ' + error.message, 'error');
      }
    },

    async applyUserFilter() {
      try {
        await this.fetchFiles({ 
          startDate: this.startDate, 
          endDate: this.endDate,
          selectedUser: this.selectedUser
        });
      this.resetPagination();
        if (this.selectedUser) {
          this.showNotification(`Showing files for selected user`);
        } else {
          this.showNotification('Showing all users files');
        }
      } catch (error) {
        console.error('applyUserFilter: Error:', error);
        this.showNotification('Error applying user filter: ' + error.message, 'error');
      }
    },
    resetPagination() {
      this.pagination.currentPage = 1;
      this.pagination.totalPages = Math.ceil(this.getFilteredFiles.length / this.pagination.itemsPerPage);
      this.updatePaginationIndices();
    },
    updatePaginationIndices() {
      this.pagination.startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
      this.pagination.endIndex = Math.min(
        this.pagination.startIndex + this.pagination.itemsPerPage,
        this.getFilteredFiles.length
      );
    },
    openDialog(item) {
      if (item && !this.canEditFile(item) && !this.isAdmin) {
        this.showNotification('You do not have permission to edit this file', 'error');
        return;
      }
      if (!item && !this.canCreateFiles) {
        this.showNotification('You do not have permission to create files', 'error');
        return;
      }
      this.dialogDelete = false;
      this.editedItem = item
        ? { 
            ...item, 
            sheets: item.sheets || [], 
            editors: item.editors || [],
            viewers: item.viewers || item.sharedWith || []
          }
        : {
            id: this.generateRandomId(),
            name: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addedBy: this.$store.getters['auth/currentUser']?.username || 'Unknown',
            sheets: [],
            editors: [this.$store.getters['auth/currentUser']?.uid].filter(Boolean),
            viewers: []
          };
      this.dialog = true;
    },
    generateRandomId() {
      return Math.random().toString(36).substring(2, 10);
    },
    openDeleteDialog(item) {
      if (!this.canDeleteFile(item)) {
        this.showNotification('You do not have permission to delete files', 'error');
        return;
      }
      this.dialog = false;
      this.editedItem = { ...item };
      this.dialogDelete = true;
    },
    async saveFile(file) {
      try {
        if (this.getFiles.find((f) => f.id === file.id)) {
          await this.updateFile({ ...file, updatedAt: new Date().toISOString() });
          this.showNotification('File updated successfully');
        } else {
          await this.addFile(file);
          this.showNotification('File created successfully');
        }
        this.dialog = false;
      } catch (error) {
        console.error('Error saving file:', error);
        this.showNotification('Error saving file: ' + error.message, 'error');
      }
    },
    async deleteFileConfirm() {
      try {
        await this.deleteFile(this.editedItem.id);
        this.showNotification('File deleted successfully');
        this.dialogDelete = false;
      } catch (error) {
        console.error('Error deleting file:', error);
        this.showNotification('Error deleting file: ' + error.message, 'error');
      }
    },
    closeDialog() {
      this.dialog = false;
      this.dialogDelete = false;
      this.editedItem = null;
    },
    viewFile(item) {
      this.$router.push(`/UserDashboard/Files/${item.id}`);
    },
    viewSheet(fileId, sheetName) {
      this.$router.push(`/UserDashboard/Files/${fileId}/${sheetName}`);
    },
    downloadAllFiles() {
      if (!this.getFilteredFiles.length) {
        this.showNotification('No files available to download', 'warning');
        return;
      }
      const wb = XLSX.utils.book_new();
      let hasData = true;
      for (const file of this.getFilteredFiles) {
        const sheets = file.sheets || [];
        for (const sheet of sheets) {
          if (sheet.data && sheet.data.length > 0) {
            hasData = true;
            const wsData = [
              this.alphabeticalColumns.map(col => col.title),
              ...sheet.data.map(row =>
                this.alphabeticalColumns.map(col => row[col.field] || '')
              ),
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const sheetNameForExcel = `${file.name || `File${file.id}`}_${sheet.name}`.slice(0, 31);
            XLSX.utils.book_append_sheet(wb, ws, sheetNameForExcel);
          }
        }
      }
      if (!hasData) {
        this.showNotification('No data available to download', 'warning');
        return;
      }
      XLSX.writeFile(wb, 'AllFiles.xlsx');
      this.showNotification('Files downloaded successfully');
    },
  },
  async mounted() {
    if (!this.$store.getters['auth/isAuthenticated']) {
      this.$router.push({ name: 'login', query: { redirect: this.$route.fullPath } });
      return;
    }
    const currentUser = this.$store.getters['auth/currentUser'];
    if (currentUser && currentUser.uid) {
      await this.$store.dispatch('roles/fetchUserRole', currentUser.uid);
    }

    if (this.isAdmin) {
      await this.fetchAllUsers();
    }
    
    this.loading = true;
    try {
      await this.fetchFiles();
      this.resetPagination();
    } catch (error) {
      console.error('mounted: Error fetching files:', error.message);
      this.showNotification('Error fetching files: ' + error.message, 'error');
    } finally {
      this.loading = false;
    }
  },
};
</script>