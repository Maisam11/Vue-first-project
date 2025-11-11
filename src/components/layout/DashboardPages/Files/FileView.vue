<template>
  <div style="margin: 0 1.4rem 0 0;">
    <v-container v-if="loading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-container>
    <v-container v-else-if="localFile">
      <div class="d-flex justify-space-between align-center mb-4">
      <h2>File Details: {{ localFile.name }}</h2>
        <div class="d-flex align-center">
          <span class="last-saved mr-3" v-if="localFile.lastSaved">
            Last saved: {{ formatTime(localFile.lastSaved) }}
          </span>
          <GenericButton icon="mdi-history" @click="openHistoryDialog" title="View History" class="mr-2"> History </GenericButton>
        </div>
      </div>
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <ul style="list-style: none; margin-left: -1.2rem;">
                <li><strong>File ID:</strong> {{ localFile.id }}</li>                
                <li><strong>Current Version:</strong> {{ localFile.currentVersion || 1 }}</li>
                <li><strong>Your Access:</strong> 
                <v-chip x-small v-if="isViewerOnly" color="info">View Only</v-chip>
                <v-chip x-small v-else color="success">Can Edit</v-chip></li>
              </ul>
            </v-col>
            <v-col cols="12" md="6" v-if="localFile.sheets && localFile.sheets.length">
              <ul style="list-style: none; margin-left: -1.2rem">
                <li><strong>Sheet Name:</strong> {{ localFile.sheets[activeSheetTab]?.name || 'N/A' }}</li>
                <li><strong>Created At:</strong> {{ formatDate(localFile.sheets[activeSheetTab]?.createdAt) || 'N/A' }}</li>
                <li><strong>Updated At:</strong> {{ formatDate(localFile.sheets[activeSheetTab]?.updatedAt) || 'N/A' }}</li>
              </ul>
            </v-col>
          </v-row>
          <h3>Sheets</h3>
          <div class="d-flex justify-content-between">
          <div class="d-flex mb-4" v-if="canEdit">
            <GenericButton color="primary" icon="mdi-plus" class="mr-2" @click="addNewSheet"> Sheet</GenericButton>
            <GenericButton icon="mdi-plus" @click="addRow" :disabled="!localFile.sheets || !localFile.sheets.length"> Row</GenericButton>
            <div v-if="selectedRows.length && localFile.sheets && localFile.sheets.length">
              <GenericButton icon="mdi-arrow-up" @click="addRowAbove"> Row</GenericButton>
              <GenericButton icon="mdi-arrow-down" @click="addRowBelow">Row</GenericButton>
              <GenericButton icon="mdi-delete" color="error" @click="deleteSelectedRows"> Row</GenericButton>
              </div>
            </div>
            <div>
              <v-card-actions>
                <GenericButton color="primary" @click="manualSave" v-if="canEdit">Save Version</GenericButton>
                <GenericButton @click="$router.push('/UserDashboard/Files')">Back</GenericButton>
              </v-card-actions>
            </div>
          </div>
          <v-tabs v-model="activeSheetTab" class="mb-4">
            <v-tab
              v-for="(sheet, index) in localFile.sheets"
              :key="sheet.name"
              @dblclick="canEdit ? startEditingSheetName(index) : null"
              @contextmenu.prevent="canEdit ? openDeleteSheetDialog(index) : null"
            >
              <template v-if="editingSheetIndex === index">
                <v-text-field
                  v-model="newSheetName" dense hide-details
                  :rules="[v => !!v || 'Sheet name is required']"
                  @blur="saveSheetName(index)"
                  @keyup.enter="saveSheetName(index)"
                  @keyup.esc="cancelEditingSheetName"
                  :ref="`sheetNameInput-${index}`" autofocus
                ></v-text-field>
              </template>
              <template v-else>
                {{ sheet.name }}
              </template>
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="activeSheetTab">
            <v-tab-item v-for="(sheet, index) in localFile.sheets" :key="sheet.name">
              <GenericExcelSheet
                :value="sheet.data || []"
                :columns="alphabeticalColumns"
                :editorRef="`sheetEditor${index}`"
                :type="`sheet${index}`"
                @input="handleSheetDataUpdate(index, $event)"
                @select="handleRowSelection(index, $event)"
                :enable-select="canEdit"
                :allow-add-col="canEdit"
                :readonly="!canEdit"
              />
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>
      </v-card>
      <FileHistoryDialog v-model="historyDialog" :file="localFile" @reverted="handleHistoryReverted" />
      <DeleteDialog :dialog="dialogDeleteSheet" @confirm="deleteSheetConfirm" @closeDialog="closeDeleteSheetDialog" title="Delete Sheet"
        message="Are you sure you want to delete this sheet? This action cannot be undone." />
    </v-container>
    <v-container v-else>
      <p>File not found.</p>
    </v-container>
  </div>
</template>

<script>
import GenericButton from "../../../common/GenericButton.vue"
import GenericExcelSheet from "../../../common/GenericExcelSheet.vue";
import DeleteDialog from "../modals/DeleteDialog.vue";
import FileHistoryDialog from "../modals/FileHistoryDialog.vue";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "FileView",
  components: { GenericExcelSheet, DeleteDialog, GenericButton, FileHistoryDialog },
  data() {
    return {
      activeSheetTab: 0,
      dialogDeleteSheet: false,
      sheetToDelete: null,
      selectedRows: [],
      localFile: null,
      loading: true,
      editingSheetIndex: null,
      newSheetName: '',
      historyDialog: false,
      hasUnsavedChanges: false,
      sessionStartData: null,
      isNewSession: true,
      hasRealChanges: false,
      isSavingFinalVersion: false,
      alphabeticalColumns: Array.from({ length: 7 }, (_, i) => ({
        field: String.fromCharCode(65 + i),
        title: String.fromCharCode(65 + i),
        type: "string",
        width: "169px",
      })),
    };
  },
  computed: {
    ...mapGetters("auth", ["currentUser"]),
    ...mapGetters("roles", ["getCurrentUserRole"]),
    isAdmin() {
      return this.getCurrentUserRole === 'admin';
    },
    isOwner() {
      return this.localFile?.addedBy === this.currentUser?.username;
    },
    isEditor() {
      return this.isAdmin || 
             this.isOwner || 
             (this.localFile?.editors || []).includes(this.currentUser?.uid);
    },
    isViewerOnly() {
      return !this.isEditor && (this.localFile?.viewers || []).includes(this.currentUser?.uid);
    },
    canEdit() {
      return this.isEditor && !this.isViewerOnly;
    },
  },
  methods: {
    ...mapActions("files", ["updateFile", "getFileById", "createFileHistory"]),
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    },
    handleUserChange() {
      this.hasUnsavedChanges = true;
      this.hasRealChanges = true;
      if (this.isNewSession) {
        this.startNewSession();
      }
    },
    addNewSheet() {
      if (!this.canEdit) return;
      const sheets = this.localFile.sheets || [];
      const sheetsLength = sheets.length;
      const newSheetName = `Sheet ${sheetsLength + 1}`;
      const newSheet = {
        name: newSheetName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: []
      };
      this.localFile.sheets.push(newSheet);
      this.activeSheetTab = sheetsLength;
      this.localFile.updatedAt = new Date().toISOString();
      this.handleUserChange();
    },
    handleSheetDataUpdate(index, newData) {
      if (!this.canEdit) return;
      console.log('Sheet data updated - processing:', newData);
      const sheet = this.localFile.sheets[index];
      if (sheet) {
        const clonedData = JSON.parse(JSON.stringify(newData));       
        sheet.data = clonedData.map(row => ({
          ...row,
          _rowKey: row._rowKey || String(Date.now() + Math.random()),
        }));
        sheet.updatedAt = new Date().toISOString();
        this.localFile.updatedAt = new Date().toISOString();
        this.handleUserChange();
      }
    },
    startNewSession() {
      if (this.localFile?.sheets && this.localFile.sheets[this.activeSheetTab]) {
        const currentSheet = this.localFile.sheets[this.activeSheetTab];
        this.sessionStartData = JSON.parse(JSON.stringify(currentSheet.data || []));
        this.isNewSession = false;
        this.hasRealChanges = false;
        console.log('New editing session started with initial data:', this.sessionStartData);
      }
    },
    async manualSave() {
      await this.performFinalSave(true);
    },
    async performFinalSave(showNotification = false) {
      if (!this.canEdit || this.isSavingFinalVersion) return;
      try {
        this.isSavingFinalVersion = true;
        
        console.log('Performing FINAL save with HISTORY...');
          const newVersion = (this.localFile.currentVersion || 0) + 1;
          await this.createFileHistory({
            fileId: this.localFile.id,
          data: {
            sheets: JSON.parse(JSON.stringify(this.localFile.sheets)),
            fileName: this.localFile.name,
            fileMetadata: {
              createdAt: this.localFile.createdAt,
              addedBy: this.localFile.addedBy
            }
          },
            version: newVersion,
            changeType: 'updated',
            changedBy: this.currentUser?.username || 'Unknown'
          });
          console.log('History version created:', newVersion);
          const fileToUpdate = {
            ...this.localFile,
            currentVersion: newVersion,
            updatedAt: new Date().toISOString(),
            lastSaved: new Date().toISOString()
          };
          const updatedFile = await this.updateFile(fileToUpdate);
          this.localFile = updatedFile;
        
        this.hasUnsavedChanges = false;
        this.isNewSession = true;
        this.sessionStartData = null;
        this.hasRealChanges = false;
        this.isSavingFinalVersion = false;
        
        if (showNotification) {
          this.$toast.success('New version saved successfully');
        }
        console.log('Final save with history completed');
      } catch (error) {
        console.error('Error in final save:', error);
        this.isSavingFinalVersion = false;
        this.$toast.error('Error saving file: ' + error.message);
      }
    },
    addRow() {
      if (!this.canEdit) return;
      const sheet = this.localFile.sheets[this.activeSheetTab];
      if (!sheet) return;
      const newRow = {
        _rowKey: String(Date.now() + Math.random()),
      };
      this.alphabeticalColumns.forEach((col) => {
        newRow[col.field] = "";
      });
      if (!sheet.data) sheet.data = [];
      sheet.data.push(newRow);
      sheet.updatedAt = new Date().toISOString();
      this.localFile.updatedAt = new Date().toISOString();
      this.selectedRows = [];
      this.handleUserChange();
    },
    addRowAbove() {
      if (!this.canEdit || this.selectedRows.length === 0) return;
      const sheet = this.localFile.sheets[this.activeSheetTab];
      if (!sheet) return;
      const newRow = {
        _rowKey: String(Date.now() + Math.random()),
      };
      this.alphabeticalColumns.forEach((col) => {
        newRow[col.field] = "";
      });
      const currentData = sheet.data || [];
      const selectedIndices = this.selectedRows
        .map(rowKey => currentData.findIndex(row => row._rowKey === rowKey))
        .filter(index => index !== -1)
        .sort((a, b) => a - b);
      const insertIndex = selectedIndices[0];
      currentData.splice(insertIndex, 0, newRow);
      sheet.updatedAt = new Date().toISOString();
      this.localFile.updatedAt = new Date().toISOString();
      this.selectedRows = [];
      if (this.$refs[`sheetEditor${this.activeSheetTab}`]) {
        this.$refs[`sheetEditor${this.activeSheetTab}`].setSelectedRows([]);
      }
      this.handleUserChange();
    },
    addRowBelow() {
      if (!this.canEdit || this.selectedRows.length === 0) return;
      const sheet = this.localFile.sheets[this.activeSheetTab];
      if (!sheet) return;
      const newRow = {
        _rowKey: String(Date.now() + Math.random()),
      };
      this.alphabeticalColumns.forEach((col) => {
        newRow[col.field] = "";
      });
      const currentData = sheet.data || [];
      const selectedIndices = this.selectedRows
        .map(rowKey => currentData.findIndex(row => row._rowKey === rowKey))
        .filter(index => index !== -1)
        .sort((a, b) => a - b);
      const insertIndex = selectedIndices[selectedIndices.length - 1] + 1;
      currentData.splice(insertIndex, 0, newRow);
      sheet.updatedAt = new Date().toISOString();
      this.localFile.updatedAt = new Date().toISOString();
      this.selectedRows = [];
      if (this.$refs[`sheetEditor${this.activeSheetTab}`]) {
        this.$refs[`sheetEditor${this.activeSheetTab}`].setSelectedRows([]);
      }
      this.handleUserChange();
    },
    handleRowSelection(index, selected) {
      const sheet = this.localFile.sheets[index];
      const currentData = sheet.data || [];
      this.selectedRows = selected
        .filter(idx => idx >= 0 && idx < currentData.length)
        .map(idx => currentData[idx]._rowKey);
    },
    deleteSelectedRows() {
      if (!this.canEdit || this.selectedRows.length === 0) return;
      const sheet = this.localFile.sheets[this.activeSheetTab];
      if (!sheet) return;
      const currentData = sheet.data || [];
      const newData = currentData.filter(
        row => !this.selectedRows.includes(row._rowKey)
      );
      sheet.data = newData;
      sheet.updatedAt = new Date().toISOString();
      this.localFile.updatedAt = new Date().toISOString();
      this.selectedRows = [];
      if (this.$refs[`sheetEditor${this.activeSheetTab}`]) {
        this.$refs[`sheetEditor${this.activeSheetTab}`].setSelectedRows([]);
      }
      this.handleUserChange();
    },
    openDeleteSheetDialog(index) {
      this.sheetToDelete = index;
      this.dialogDeleteSheet = true;
    },
    async deleteSheetConfirm() {
      if (!this.canEdit) return;
      try {
        console.log('Deleting sheet at index:', this.sheetToDelete);
      this.localFile.sheets.splice(this.sheetToDelete, 1);
      if (this.activeSheetTab >= this.localFile.sheets.length && this.localFile.sheets.length > 0) {
        this.activeSheetTab = this.localFile.sheets.length - 1;
      } else if (this.localFile.sheets.length === 0) {
        this.activeSheetTab = 0;
      }
      this.localFile.updatedAt = new Date().toISOString();
        this.hasUnsavedChanges = true;
        this.hasRealChanges = true;
        
        console.log('Saving file after sheet deletion...');
        const fileToUpdate = {
          ...this.localFile,
          lastSaved: new Date().toISOString()
        };
        const updatedFile = await this.updateFile(fileToUpdate);
        this.localFile = updatedFile;
        this.hasUnsavedChanges = false;
        this.closeDeleteSheetDialog();
        this.$toast.success('Sheet deleted successfully');
        console.log('Sheet deletion completed and persisted');
      } catch (error) {
        console.error('Error deleting sheet:', error);
        this.$toast.error('Error deleting sheet: ' + error.message);
      this.closeDeleteSheetDialog();
      }
    },
    closeDeleteSheetDialog() {
      this.dialogDeleteSheet = false;
      this.sheetToDelete = null;
    },
    startEditingSheetName(index) {
      this.editingSheetIndex = index;
      this.newSheetName = this.localFile.sheets[index].name;
      this.$nextTick(() => {
        if (this.$refs[`sheetNameInput-${index}`]) {
          this.$refs[`sheetNameInput-${index}`][0].focus();
        }
      });
    },
    saveSheetName(index) {
      if (this.newSheetName.trim()) {
        this.localFile.sheets[index].name = this.newSheetName.trim();
        this.localFile.sheets[index].updatedAt = new Date().toISOString();
        this.localFile.updatedAt = new Date().toISOString();
        this.handleUserChange();
      }
      this.editingSheetIndex = null;
      this.newSheetName = '';
    },
    cancelEditingSheetName() {
      this.editingSheetIndex = null;
      this.newSheetName = '';
    },
    openHistoryDialog() {
      this.historyDialog = true;
    },
    async handleHistoryReverted() {
      await this.loadFileData();
      this.historyDialog = false;
      this.hasUnsavedChanges = false;
      this.isNewSession = true;
      this.sessionStartData = null;
      this.hasRealChanges = false;
      this.$toast.success('File reverted successfully');
    },
    async loadFileData() {
      try {
        const fileData = await this.getFileById(this.$route.params.id);
        if (fileData) {
          this.localFile = fileData;
          this.isNewSession = true;
          this.sessionStartData = null;
          this.hasRealChanges = false;
          this.isSavingFinalVersion = false;
        } else {
          this.localFile = null;
        }
      } catch (error) {
        console.log('Error fetching file:', error.message);
        this.localFile = null;
      }
    }
  },
  async mounted() {
    if (!this.$store.getters['auth/isAuthenticated']) {
      console.log('mounted: User not authenticated, redirecting to login');
      this.$router.push({ name: 'login', query: { redirect: this.$route.fullPath } });
      return;
    }
    this.loading = true;
    await this.loadFileData();
      this.loading = false;
  },
  beforeDestroy() {
    if (this.hasUnsavedChanges && this.hasRealChanges && !this.isSavingFinalVersion) {
      console.log('Component destroying - performing final save');
      this.performFinalSave(false);
    }
  },
};
</script>