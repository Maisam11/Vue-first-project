<template>
  <div style="margin: 0 1.4rem 0 0;">
    <v-container v-if="loading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-container>
    <v-container v-else-if="localFile">
      <h2>File Details: {{ localFile.name }}</h2>
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <h3>File Metadata</h3>
              <p><strong>File ID:</strong> {{ localFile.id }}</p>
              <p><strong>File Name:</strong> {{ localFile.name }}</p>
              <p><strong>Created At:</strong> {{ formatDate(localFile.createdAt) }}</p>
              <p><strong>Updated At:</strong> {{ formatDate(localFile.updatedAt) }}</p>
              <p><strong>Added By:</strong> {{ localFile.addedBy }}</p>
            </v-col>
            <v-col cols="12" md="6" v-if="localFile.sheets && localFile.sheets.length">
              <h3>Selected Sheet Metadata</h3>
              <p><strong>Sheet Name:</strong> {{ localFile.sheets[activeSheetTab]?.name || 'N/A' }}</p>
              <p><strong>Created At:</strong> {{ formatDate(localFile.sheets[activeSheetTab]?.createdAt) || 'N/A' }}</p>
              <p><strong>Updated At:</strong> {{ formatDate(localFile.sheets[activeSheetTab]?.updatedAt) || 'N/A' }}</p>
            </v-col>
          </v-row>
          <h3>Sheets</h3>
          <div class="d-flex mb-4">
            <GenericButton color="primary" icon="mdi-plus" class="mr-2" @click="addNewSheet"> Sheet</GenericButton>
            <GenericButton icon="mdi-plus" @click="addRow" :disabled="!localFile.sheets || !localFile.sheets.length"> Row</GenericButton>
            <div v-if="selectedRows.length && localFile.sheets && localFile.sheets.length">
              <GenericButton icon="mdi-arrow-up" @click="addRowAbove"> Row</GenericButton>
              <GenericButton icon="mdi-arrow-down" @click="addRowBelow">Row</GenericButton>
              <GenericButton icon="mdi-delete" color="error" @click="deleteSelectedRows"> Row</GenericButton>
            </div>
          </div>
          <v-tabs v-model="activeSheetTab" class="mb-4">
            <v-tab
              v-for="(sheet, index) in localFile.sheets"
              :key="sheet.name"
              @dblclick="startEditingSheetName(index)"
              @contextmenu.prevent="openDeleteSheetDialog(index)"
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
                @update:value="updateSheetData(index, $event)"
                @select="handleRowSelection(index, $event)"
                :enable-select="true"
                :allow-add-col="true"
              />
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>
        <v-card-actions>
          <GenericButton @click="$router.push('/UserDashboard/Files')">Back</GenericButton>
          <GenericButton color="primary" @click="saveChanges">Save</GenericButton>
        </v-card-actions>
      </v-card>
      <DeleteDialog :dialog="dialogDeleteSheet" @confirm="deleteSheetConfirm" @closeDialog="closeDeleteSheetDialog" />
    </v-container>
    <v-container v-else>
      <p>File not found.</p>
    </v-container>
  </div>
</template>

<script>
import GenericButton from "@/components/common/GenericButton.vue";
import GenericExcelSheet from "@/components/common/GenericExcelSheet.vue";
import DeleteDialog from "@/components/Pages/modals/DeleteDialog.vue";
import { mapActions } from "vuex";

export default {
  name: "FileView",
  components: { GenericExcelSheet, DeleteDialog, GenericButton },
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
      alphabeticalColumns: Array.from({ length: 7 }, (_, i) => ({
        field: String.fromCharCode(65 + i),
        title: String.fromCharCode(65 + i),
        type: "string",
        width: "169px",
      })),
    };
  },
  methods: {
    ...mapActions("files", ["updateFile", "getFileById"]),
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    addNewSheet() {
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
    },
    updateSheetData(index, newData) {
      const sheet = this.localFile.sheets[index];
      if (sheet) {
        sheet.data = newData.map(row => ({
          ...row,
          _rowKey: row._rowKey || String(Date.now() + Math.random()),
        }));
        sheet.updatedAt = new Date().toISOString();
        this.localFile.updatedAt = new Date().toISOString();
      }
    },
    addRow() {
      const sheet = this.localFile.sheets[this.activeSheetTab];
      if (!sheet) return;
      const newRow = {
        _rowKey: String(Date.now() + Math.random()),
      };
      this.alphabeticalColumns.forEach((col) => {
        newRow[col.field] = "";
      });
      sheet.data.push(newRow);
      sheet.updatedAt = new Date().toISOString();
      this.localFile.updatedAt = new Date().toISOString();
      this.selectedRows = [];
    },
    addRowAbove() {
      if (this.selectedRows.length === 0) return;
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
      this.$refs[`sheetEditor${this.activeSheetTab}`].setSelectedRows([]);
    },
    addRowBelow() {
      if (this.selectedRows.length === 0) return;
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
      this.$refs[`sheetEditor${this.activeSheetTab}`].setSelectedRows([]);
    },
    handleRowSelection(index, selected) {
      const sheet = this.localFile.sheets[index];
      const currentData = sheet.data || [];
      this.selectedRows = selected
        .filter(idx => idx >= 0 && idx < currentData.length)
        .map(idx => currentData[idx]._rowKey);
    },
    deleteSelectedRows() {
      if (this.selectedRows.length === 0) return;
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
      this.$refs[`sheetEditor${this.activeSheetTab}`].setSelectedRows([]);
    },
    openDeleteSheetDialog(index) {
      this.sheetToDelete = index;
      this.dialogDeleteSheet = true;
    },
    deleteSheetConfirm() {
      this.localFile.sheets.splice(this.sheetToDelete, 1);
      if (this.activeSheetTab >= this.localFile.sheets.length && this.localFile.sheets.length > 0) {
        this.activeSheetTab = this.localFile.sheets.length - 1;
      } else if (this.localFile.sheets.length === 0) {
        this.activeSheetTab = 0;
      }
      this.localFile.updatedAt = new Date().toISOString();
      this.closeDeleteSheetDialog();
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
      }
      this.editingSheetIndex = null;
      this.newSheetName = '';
    },
    cancelEditingSheetName() {
      this.editingSheetIndex = null;
      this.newSheetName = '';
    },
    async saveChanges() {
      await this.updateFile({ ...this.localFile });
    },
    generateRandomId() {
      return Math.random().toString(36).substring(2, 10);
    },
  },
  async mounted() {
    this.loading = true;
    try {
      this.localFile = await this.getFileById(this.$route.params.id);
      if (!this.localFile) {
        this.localFile = null;
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      this.localFile = null;
    } finally {
      this.loading = false;
    }
  },
};
</script>