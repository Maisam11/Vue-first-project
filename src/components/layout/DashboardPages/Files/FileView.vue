<template>
  <div style="margin: 0 1.4rem 0 0">
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
          <GenericButton
            icon="mdi-history"
            @click="openHistoryDialog"
            title="View History"
            class="mr-2"
          >
            History
          </GenericButton>
        </div>
      </div>
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <ul style="list-style: none; margin-left: -1.2rem">
                <li><strong>File ID:</strong> {{ localFile.id }}</li>
                <li>
                  <strong>Type:</strong> {{ localFile.type === 'excel' ? 'Excel File' : 'Document File' }}</li>
                <li>
                  <strong>Current Version:</strong>
                  {{ localFile.currentVersion || 1 }}
                </li>
                <li>
                  <strong>Your Access:</strong>
                  <v-chip x-small v-if="isViewerOnly" color="info"
                    >View Only</v-chip
                  >
                  <v-chip x-small v-else color="success">Can Edit</v-chip>
                </li>
              </ul>
            </v-col>
            <v-col
              cols="12"
              md="6"
              v-if="localFile.type === 'excel' && localFile.sheets && localFile.sheets.length"
            >
              <ul style="list-style: none; margin-left: -1.2rem">
                <li>
                  <strong>Sheet Name:</strong>
                  {{ localFile.sheets[activeSheetTab]?.name || "N/A" }}
                </li>
                <li>
                  <strong>Created At:</strong>
                  {{
                    formatDate(localFile.sheets[activeSheetTab]?.createdAt) ||
                    "N/A"
                  }}
                </li>
                <li>
                  <strong>Updated At:</strong>
                  {{
                    formatDate(localFile.sheets[activeSheetTab]?.updatedAt) ||
                    "N/A"
                  }}
                </li>
              </ul>
            </v-col>
          </v-row>
          <template v-if="localFile.type === 'excel'">
          <h3>Sheets</h3>
          <div class="d-flex justify-content-between">
            <div class="d-flex mb-4" v-if="canEdit">
              <GenericButton
                color="primary"
                icon="mdi-plus"
                class="mr-2"
                @click="addNewSheet"
              >
                Sheet</GenericButton
              >
              <GenericButton
                icon="mdi-plus"
                @click="addRow"
                :disabled="!localFile.sheets || !localFile.sheets.length"
              >
                Row</GenericButton
              >
              <div
                v-if="
                  selectedRows.length &&
                  localFile.sheets &&
                  localFile.sheets.length
                "
              >
                <GenericButton icon="mdi-arrow-up" @click="addRowAbove">
                  Row</GenericButton
                >
                <GenericButton icon="mdi-arrow-down" @click="addRowBelow"
                  >Row</GenericButton
                >
                <GenericButton
                  icon="mdi-delete"
                  color="error"
                  @click="deleteSelectedRows"
                >
                  Row</GenericButton
                >
              </div>
            </div>
            <div>
              <v-card-actions>
                <GenericButton
                  color="primary"
                  @click="manualSave"
                  v-if="canEdit"
                  >Save Version</GenericButton
                >
                <GenericButton @click="$router.push('/UserDashboard/Files')"
                  >Back</GenericButton
                >
              </v-card-actions>
            </div>
          </div>
          <div class="draggable-tabs-container mb-4">
            <draggable
              v-model="localFile.sheets"
              tag="div"
              class="d-flex"
              handle=".drag-handle-tab"
              @end="onSheetTabDragEnd"
              :disabled="!canEdit"
            >
              <div
                v-for="(sheet, index) in localFile.sheets"
                :key="sheet.name + index"
                class="sheet-tab"
                :class="{ 'active-tab': activeSheetTab === index }"
                @click="activeSheetTab = index"
              >
                <v-icon
                  v-if="canEdit"
                  small
                  class="drag-handle-tab mr-1"
                  style="cursor: grab"
                >
                  mdi-drag-vertical
                </v-icon>
                <template v-if="editingSheetIndex === index">
                  <v-text-field
                    v-model="newSheetName"
                    dense
                    hide-details
                    :rules="[(v) => !!v || 'Sheet name is required']"
                    @blur="saveSheetName(index)"
                    @keyup.enter="saveSheetName(index)"
                    @keyup.esc="cancelEditingSheetName"
                    :ref="`sheetNameInput-${index}`"
                    autofocus
                  ></v-text-field>
                </template>
                <template v-else>
                  <span
                    @dblclick="canEdit ? startEditingSheetName(index) : null"
                    @contextmenu.prevent="
                      canEdit ? openDeleteSheetDialog(index) : null
                    "
                  >
                    {{ sheet.name }}
                  </span>
                </template>
              </div>
            </draggable>
          </div>
          <v-tabs-items v-model="activeSheetTab">
            <v-tab-item
              v-for="(sheet, index) in localFile.sheets"
              :key="sheet.name"
            >
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
          </template>
          <template v-else-if="localFile.type === 'document'">
            <div class="d-flex justify-content-end">
              <v-card-actions>
                <GenericButton
                  color="primary"
                  @click="saveDocument"
                  v-if="canEdit">
                  Save Document
                </GenericButton>
                <GenericButton @click="$router.push('/UserDashboard/Files')">
                  Back
                </GenericButton>
              </v-card-actions>
            </div>
            <DocumentEditor
              :class="{ readonly: !canEdit }"
              v-model="localFile.content"
              :readonly="!canEdit"
              @input="handleDocumentChange" />
          </template>
        </v-card-text>
      </v-card>
      <FileHistoryDialog
        v-if="localFile.type === 'excel'"
        v-model="historyDialog"
        :file="localFile"
        @reverted="handleHistoryReverted"
      />
      <DocumentHistoryDialog
        v-if="localFile.type === 'document'"
        v-model="historyDialog"
        :file="localFile"
        @reverted="handleDocumentHistoryReverted"
      />
      <DeleteDialog
        :dialog="dialogDeleteSheet"
        @confirm="deleteSheetConfirm"
        @closeDialog="closeDeleteSheetDialog"
        title="Delete Sheet"
        message="Are you sure you want to delete this sheet? This action cannot be undone."
      />
    </v-container>
    <v-container v-else>
      <p>File not found.</p>
    </v-container>
  </div>
</template>

<script>
import GenericButton from "../../../common/GenericButton.vue";
import GenericExcelSheet from "../../../common/GenericExcelSheet.vue";
import DocumentEditor from "../Documents/DocumentEditor.vue";
import DeleteDialog from "../modals/DeleteDialog.vue";
import FileHistoryDialog from "../modals/FileHistoryDialog.vue";
import DocumentHistoryDialog from "../modals/DocumentHistoryDialog.vue";
import { mapActions, mapGetters } from "vuex";
import draggable from "vuedraggable";

export default {
  name: "FileView",
  components: {
    GenericExcelSheet,
    DocumentEditor,
    DeleteDialog,
    GenericButton,
    FileHistoryDialog,
    DocumentHistoryDialog,
    draggable,
  },
  data() {
    return {
      activeSheetTab: 0,
      dialogDeleteSheet: false,
      sheetToDelete: null,
      selectedRows: [],
      localFile: null,
      loading: true,
      editingSheetIndex: null,
      newSheetName: "",
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
    ...mapGetters("document", ["getDocumentById"]),
    ...mapGetters("files", ["getFileById"]),
    isAdmin() {
      return this.getCurrentUserRole === "admin";
    },
    isOwner() {
      return this.localFile?.addedBy === this.currentUser?.username;
    },
    isEditor() {
      return (
        this.isAdmin ||
        this.isOwner ||
        (this.localFile?.editors || []).includes(this.currentUser?.uid)
      );
    },
    isViewerOnly() {
      return (
        !this.isEditor &&
        (this.localFile?.viewers || []).includes(this.currentUser?.uid)
      );
    },
    canEdit() {
      return this.isEditor && !this.isViewerOnly;
    },
  },
  methods: {
    ...mapActions("files", [
      "updateFile",
      "createFileHistory",
      "deleteSheet",
    ]),
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    },
    formatTime(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    },
    handleDocumentChange() {
      if (!this.canEdit) return;
      this.hasUnsavedChanges = true;
      this.hasRealChanges = true;
    },
    async saveDocument() {
      if (!this.canEdit) return;
      try {
        const contentToSave = this.localFile.content || ['<p><br></p>'];
        const newVersion = (this.localFile.currentVersion || 0) + 1;
        await this.$store.dispatch('document/createDocumentHistory', {
          documentId: this.localFile.id,
          data: { content: contentToSave },
          version: newVersion,
          changeType: "updated",
          changedBy: this.currentUser?.username || "Unknown"
        });
        const documentToUpdate = {
          ...this.localFile,
          content: contentToSave,
          updatedAt: new Date().toISOString(),
          lastSaved: new Date().toISOString(),
          currentVersion: newVersion,
          activeHistoryVersion: null
        };
        await this.$store.dispatch('document/updateDocument', documentToUpdate);
        this.localFile = documentToUpdate;
        this.hasUnsavedChanges = false;
        this.$toast.success('Document saved successfully');
      } catch (error) {
        console.error('Error saving document:', error);
        this.$toast.error('Error saving document: ' + error.message);
      }
    },
    handleUserChange() {
      this.hasUnsavedChanges = true;
      this.hasRealChanges = true;
      if (this.isNewSession && this.localFile.type === 'excel') {
        this.startNewSession();
      }
    },
    async onSheetTabDragEnd() {
      this.handleUserChange();
      await this.saveSheetOrder();
    },
    async saveSheetOrder() {
      if (!this.canEdit || this.localFile.type !== 'excel') return;
      try {
        this.localFile.sheets.forEach((sheet, index) => {
          sheet.menu_order = index + 1;
        });
        this.localFile.updatedAt = new Date().toISOString();
        this.hasUnsavedChanges = true;
      } catch (error) {
        this.$toast.error("Error saving sheet order: " + error.message);
      }
    },
    addNewSheet() {
      if (!this.canEdit || this.localFile.type !== 'excel') return;
      const sheets = this.localFile.sheets || [];
      const sheetsLength = sheets.length;
      const newSheetName = `Sheet ${sheetsLength + 1}`;
      const newSheet = {
        name: newSheetName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        menu_order: sheetsLength + 1,
        data: [],
      };
      this.localFile.sheets.push(newSheet);
      this.activeSheetTab = sheetsLength;
      this.localFile.updatedAt = new Date().toISOString();
      this.handleUserChange();
    },
    handleSheetDataUpdate(index, newData) {
      if (!this.canEdit || this.localFile.type !== 'excel') return;
      console.log("Sheet data updated - processing:", newData);
      const sheet = this.localFile.sheets[index];
      if (sheet) {
        const clonedData = JSON.parse(JSON.stringify(newData));
        sheet.data = clonedData.map((row) => ({
          ...row,
          _rowKey: row._rowKey || String(Date.now() + Math.random()),
        }));
        sheet.updatedAt = new Date().toISOString();
        this.localFile.updatedAt = new Date().toISOString();
        this.handleUserChange();
      }
    },
    startNewSession() {
      if (this.localFile.type !== 'excel') return;
      if (
        this.localFile?.sheets &&
        this.localFile.sheets[this.activeSheetTab]
      ) {
        const currentSheet = this.localFile.sheets[this.activeSheetTab];
        this.sessionStartData = JSON.parse(
          JSON.stringify(currentSheet.data || [])
        );
        this.isNewSession = false;
        this.hasRealChanges = false;
        console.log(
          "New editing session started with initial data:",
          this.sessionStartData
        );
      }
    },
    async manualSave() {
      if (this.localFile.type === 'excel') {
      await this.performFinalSave(true);
      } else {
        await this.saveDocument();
      }
    },
    async performFinalSave(showNotification = false) {
      if (!this.canEdit || this.isSavingFinalVersion || this.localFile.type !== 'excel') return;
      try {
        this.isSavingFinalVersion = true;

        console.log("Performing FINAL save with HISTORY...");
        this.localFile.sheets.forEach((sheet, index) => {
          sheet.menu_order = index + 1;
        });
        const newVersion = (this.localFile.currentVersion || 0) + 1;
        await this.createFileHistory({
          fileId: this.localFile.id,
          data: {
            sheets: JSON.parse(JSON.stringify(this.localFile.sheets)),
            fileName: this.localFile.name,
            fileMetadata: {
              createdAt: this.localFile.createdAt,
              addedBy: this.localFile.addedBy,
            },
          },
          version: newVersion,
          changeType: "updated",
          changedBy: this.currentUser?.username || "Unknown",
        });
        console.log("History version created:", newVersion);
        const fileToUpdate = {
          ...this.localFile,
          currentVersion: newVersion,
          activeHistoryVersion: null,
          updatedAt: new Date().toISOString(),
          lastSaved: new Date().toISOString(),
        };
        const updatedFile = await this.updateFile(fileToUpdate);
        this.localFile = updatedFile;

        this.hasUnsavedChanges = false;
        this.isNewSession = true;
        this.sessionStartData = null;
        this.hasRealChanges = false;
        this.isSavingFinalVersion = false;

        if (showNotification) {
          this.$toast.success("New version saved successfully");
        }
        console.log("Final save with history completed");
      } catch (error) {
        console.error("Error in final save:", error);
        this.isSavingFinalVersion = false;
        this.$toast.error("Error saving file: " + error.message);
      }
    },
    addRow() {
      if (!this.canEdit || this.localFile.type !== 'excel') return;
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
      if (!this.canEdit || this.selectedRows.length === 0 || this.localFile.type !== 'excel') return;
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
        .map((rowKey) => currentData.findIndex((row) => row._rowKey === rowKey))
        .filter((index) => index !== -1)
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
      if (!this.canEdit || this.selectedRows.length === 0 || this.localFile.type !== 'excel') return;
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
        .map((rowKey) => currentData.findIndex((row) => row._rowKey === rowKey))
        .filter((index) => index !== -1)
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
      if (this.localFile.type !== 'excel') return;
      const sheet = this.localFile.sheets[index];
      const currentData = sheet.data || [];
      this.selectedRows = selected
        .filter((idx) => idx >= 0 && idx < currentData.length)
        .map((idx) => currentData[idx]._rowKey);
    },
    deleteSelectedRows() {
      if (!this.canEdit || this.selectedRows.length === 0 || this.localFile.type !== 'excel') return;
      const sheet = this.localFile.sheets[this.activeSheetTab];
      if (!sheet) return;
      const currentData = sheet.data || [];
      const newData = currentData.filter(
        (row) => !this.selectedRows.includes(row._rowKey)
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
      if (!this.canEdit || this.localFile.type !== 'excel') return;
      try {
        console.log("Deleting sheet at index:", this.sheetToDelete);
        const sheetToDelete = this.localFile.sheets[this.sheetToDelete];
        const sheetName = sheetToDelete.name;
        this.localFile.sheets.splice(this.sheetToDelete, 1);
        this.localFile.sheets.forEach((sheet, index) => {
          sheet.menu_order = index + 1;
        });
        if (
          this.activeSheetTab >= this.localFile.sheets.length &&
          this.localFile.sheets.length > 0
        ) {
          this.activeSheetTab = this.localFile.sheets.length - 1;
        } else if (this.localFile.sheets.length === 0) {
          this.activeSheetTab = 0;
        }
        this.localFile.updatedAt = new Date().toISOString();
        this.hasUnsavedChanges = true;
        this.hasRealChanges = true;

        console.log("Saving file after sheet deletion...");
        await this.deleteSheet({
          fileId: this.localFile.id,
          sheetName: sheetName,
        });
        const fileToUpdate = {
          ...this.localFile,
          sheetNames: this.localFile.sheets.map((sheet) => sheet.name),
          lastSaved: new Date().toISOString(),
        };
        const updatedFile = await this.updateFile(fileToUpdate);
        this.localFile = updatedFile;
        this.hasUnsavedChanges = false;
        this.closeDeleteSheetDialog();
        this.$toast.success("Sheet deleted successfully");
        console.log("Sheet deletion completed and persisted");
      } catch (error) {
        console.error("Error deleting sheet:", error);
        this.$toast.error("Error deleting sheet: " + error.message);
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
      this.newSheetName = "";
    },
    cancelEditingSheetName() {
      this.editingSheetIndex = null;
      this.newSheetName = "";
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
      this.$toast.success("File reverted successfully");
    },
    async handleDocumentHistoryReverted() {
      await this.loadFileData();
      this.historyDialog = false;
      this.hasUnsavedChanges = false;
      this.isNewSession = true;
      this.hasRealChanges = false;
      this.$toast.success("Document reverted successfully");
    },
    async loadFileData() {
      try {
    const fileId = this.$route.params.id;
    let fileData = null;
    try {
      fileData = await this.$store.dispatch('document/getDocumentById', fileId);
    } catch (docError) {
      try {
        fileData = await this.getFileById(fileId);
      } catch (excelError) {
        console.log("File not found in Firebase");
      }
    }
    if (!fileData) {
      fileData = this.getDocumentById(fileId) || this.getFileById(fileId);
    }
        if (fileData) {
          if (fileData.sheets && fileData.type === 'excel') {
            fileData.sheets.sort((a, b) => {
              const orderA = a.menu_order || 9999;
              const orderB = b.menu_order || 9999;
              return orderA - orderB;
            });
          }
      if (fileData.type === 'document') {
        if (!fileData.content || !Array.isArray(fileData.content)) {
          fileData.content = ['<p><br></p>'];
        }
          }
          this.localFile = fileData;
          this.isNewSession = true;
          this.sessionStartData = null;
          this.hasRealChanges = false;
          this.isSavingFinalVersion = false;
        } else {
          this.localFile = null;
        }
      } catch (error) {
        console.log("Error fetching file:", error.message);
        this.localFile = null;
      }
    },
  },
  async mounted() {
    if (!this.$store.getters["auth/isAuthenticated"]) {
      console.log("mounted: User not authenticated, redirecting to login");
      this.$router.push({
        name: "login",
        query: { redirect: this.$route.fullPath },
      });
      return;
    }
    this.loading = true;
    await this.loadFileData();
    this.loading = false;
  if (this.localFile && this.localFile.type === 'document') {
    this.$nextTick(() => {
      if (!this.localFile.content || !Array.isArray(this.localFile.content)) {
        this.localFile.content = ['<p><br></p>'];
      }
    });
  }
  },
  beforeDestroy() {
    if (
      this.hasUnsavedChanges &&
      this.hasRealChanges &&
      !this.isSavingFinalVersion
       && this.localFile) {
      console.log("Component destroying - performing final save");
      if (this.localFile.type === 'excel') {
      this.performFinalSave(false);
      }
    }
  },
};
</script>
<style scoped>
.sheet-tab {
  padding: 10px 12px;
  cursor: pointer;
  border: 1px dotted;
  margin-right: 2px;
  background-color: #f5f5f5;
}
.sheet-tab.active-tab {
  background-color: white;
  color: #1976d2;
}
</style>
