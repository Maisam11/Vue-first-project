<template>
  <div style="margin: 1rem 2.1rem 5rem 1rem;">
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
          </div>
          <div class="d-flex">
            <GenericButton color="primary" icon="mdi-plus" background @click="openDialog(null)" id="add-new-file-btn"> 
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
        <TableActions :item="item" :onEdit="openDialog" :onView="viewFile" :onDelete="openDeleteDialog" />
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
      @save="saveFile" @closeDialog="closeDialog" />
    <DeleteDialog :dialog="dialogDelete" @confirm="deleteFileConfirm" @closeDialog="closeDialog" />
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
      pagination: {
        currentPage: 1, itemsPerPage: 10, totalPages: 1, startIndex: 0, endIndex: 0
      },
      itemsPerPageOptions: [5, 10],
      headers: [
        { text: "", value: "data-table-expand", width: "50px" },
        { text: "File Name", value: "name", width: "200px", class: "font-weight-bold", filterable: true },
        { text: "Created At", value: "createdAt", width: "200px", filterable: true, sortable: true },
        { text: "Updated At", value: "updatedAt", width: "200px", filterable: true, sortable: true },
        { text: "Added By", value: "addedBy", width: "200px", filterable: true },
        { text: "Actions", value: "actions", sortable: false, align: "center", width: "150px" },
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
    paginatedFiles() {
      const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;
      return this.getFilteredFiles.slice(start, end);
    },
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
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    applyDateFilter() {
      let filteredFiles = this.getFiles;
      if (this.startDate || this.endDate) {
        filteredFiles = this.getFiles.filter(file => {
          const fileDate = new Date(file.createdAt);
          let isInRange = true;
          if (this.startDate) {
            const start = new Date(this.startDate);
            start.setHours(0, 0, 0, 0);
            isInRange = isInRange && fileDate >= start;
          }
          if (this.endDate) {
            const end = new Date(this.endDate);
            end.setHours(23, 59, 59, 999);
            isInRange = isInRange && fileDate <= end;
          }
          return isInRange;
        });
        console.log('applyDateFilter: Filtered files', filteredFiles);
      }
      this.$store.commit('files/SET_FILTERED_FILES', filteredFiles);
      this.resetPagination();
    },
    clearDateFilter() {
      this.startDate = null;
      this.endDate = null;
      this.$store.commit('files/SET_FILTERED_FILES', this.getFiles);
      this.resetPagination();
      console.log('clearDateFilter: Reset to all files', this.getFiles);
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
      this.dialogDelete = false;
      this.editedItem = item
        ? { ...item, sheets: item.sheets || [] }
        : {
            id: this.generateRandomId(),
            name: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addedBy: this.$store.getters['auth/currentUser']?.username || 'Unknown',
            sheets: []
          };
      this.dialog = true;
    },
    generateRandomId() {
      return Math.random().toString(36).substring(2, 10);
    },
    openDeleteDialog(item) {
      this.dialog = false;
      this.editedItem = { ...item };
      this.dialogDelete = true;
    },
    async saveFile(file) {
      let response;
      if (this.getFiles.find((f) => f.id === file.id)) {
        response = await this.updateFile({ ...file, updatedAt: new Date().toISOString() });
        console.log('saveFile: Updated file', response);
      } else {
        response = await this.addFile(file);
        console.log('saveFile: Added file', response);
      }
      this.dialog = false;
    },
    async deleteFileConfirm() {
      const response = await this.deleteFile(this.editedItem.id);
      console.log('deleteFileConfirm: Deleted file ID', response);
      this.dialogDelete = false;
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
        console.log('downloadAllFiles: No files available to download');
        return;
      }
      const wb = XLSX.utils.book_new();
      let hasData = false;
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
        console.log('downloadAllFiles: No data available to download');
        return;
      }
      XLSX.writeFile(wb, 'AllFiles.xlsx');
      console.log('downloadAllFiles: Files downloaded successfully');
    },
  },
  async mounted() {
    if (!this.$store.getters['auth/isAuthenticated']) {
      console.log('mounted: User not authenticated, redirecting to login');
      this.$router.push({ name: 'login', query: { redirect: this.$route.fullPath } });
      return;
    }
    this.loading = true;
    try {
      await this.fetchFiles();
      this.$store.commit('files/SET_FILTERED_FILES', this.getFiles);
      this.resetPagination();
    } catch (error) {
      console.log('mounted: Error fetching files:', error.message);
    } finally {
      this.loading = false;
    }
  },
};
</script>