<template>
  <div style="margin: 0 1.4rem 0 0;">
    <v-container v-if="loading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-container>
    <v-container v-else-if="localFile">
      <h2>File Details: {{ localFile.name }}</h2>
      <v-card>
        <v-card-text>
          <p><strong>File Name:</strong> {{ localFile.name }}</p>
          <p><strong>Created At:</strong> {{ localFile.createdAt }}</p>
          <p><strong>Updated At:</strong> {{ localFile.updatedAt }}</p>
          <p><strong>Added By:</strong> {{ localFile.addedBy }}</p>
          <h3>Sheets</h3>
          <div class="d-flex mb-4">
            <GenericButton color="primary" icon="mdi-plus" class="mr-2" @click="addNewSheet"> Sheet</GenericButton>
            <GenericButton icon="mdi-plus" @click="addRow" :disabled="!localFile.sheets || !localFile.sheets.length"> Row</GenericButton>
            <div v-if="selectedRows.length && localFile.sheets && localFile.sheets.length" 
            :disabled="!selectedRows.length || !localFile.sheets || !localFile.sheets.length">
            <GenericButton icon="mdi-arrow-up" @click="addRowAbove" > Row</GenericButton>
            <GenericButton icon="mdi-arrow-down" @click="addRowBelow">Row </GenericButton>
            <GenericButton icon="mdi-delete" color="error" @click="deleteSelectedRows" > Row</GenericButton>
            </div>
          </div>
          <v-tabs v-model="activeSheetTab" class="mb-4">
            <v-tab v-for="(sheet, index) in localFile.sheets || []" :key="index" @contextmenu.prevent="openDeleteSheetDialog(index)" >
              {{ sheet.name }}
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="activeSheetTab">
            <v-tab-item v-for="(sheet, index) in localFile.sheets || []" :key="index">
              <GenericExcelSheet :value="sheet.data || []" :columns="alphabeticalColumns" :editorRef="`sheetEditor${index}`"
                :type="`sheet${index}`" @update:value="updateSheetData(index, $event)" @select="handleRowSelection(index, $event)"
                :enable-select="true" :allow-add-col="true" />
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
import { mapGetters, mapActions } from "vuex";

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
      alphabeticalColumns: Array.from({ length: 26 }, (_, i) => ({
        field: String.fromCharCode(65 + i), title: String.fromCharCode(65 + i), type: "string", width: "160px" })),
    };
  },
  computed: {
    ...mapGetters(["getFileById"]),
  },
  methods: {
    ...mapActions(["fetchFileById", "updateFile"]),
    addNewSheet() {
      const newRow = {
        _rowKey: String(Date.now() + Math.random()),
      };
      this.alphabeticalColumns.forEach((col) => {
        newRow[col.field] = "";
      });
      const newSheet = {
        name: `Sheet ${this.localFile.sheets.length + 1}`,
        data: [newRow],
      };
      const updatedFile = {
        ...this.localFile,
        sheets: [...this.localFile.sheets, newSheet],
        updatedAt: new Date().toISOString(),
      };
      this.localFile = updatedFile;
      this.activeSheetTab = this.localFile.sheets.length - 1;
    },
    updateSheetData(sheetIndex, newData) {
      const updatedSheets = [...this.localFile.sheets];
      updatedSheets[sheetIndex] = {
        ...updatedSheets[sheetIndex],
        data: newData.map(row => ({
          ...row,
          _rowKey: row._rowKey || String(Date.now() + Math.random()),
        })),
      };
      const updatedFile = {
        ...this.localFile,
        sheets: updatedSheets,
        updatedAt: new Date().toISOString(),
      };
      this.localFile = updatedFile;
    },
    addRow() {
      const newRow = {
        _rowKey: String(Date.now() + Math.random()),
      };
      this.alphabeticalColumns.forEach((col) => {
        newRow[col.field] = "";
      });
      const updatedSheets = [...this.localFile.sheets];
      updatedSheets[this.activeSheetTab] = {
        ...updatedSheets[this.activeSheetTab],
        data: [...(updatedSheets[this.activeSheetTab].data || []), newRow],
      };
      const updatedFile = {
        ...this.localFile,
        sheets: updatedSheets,
        updatedAt: new Date().toISOString(),
      };
      this.localFile = updatedFile;
      this.selectedRows = [];
    },
    addRowAbove() {
      if (this.selectedRows.length === 0) return;
      const newRow = {
        _rowKey: String(Date.now() + Math.random()),
      };
      this.alphabeticalColumns.forEach((col) => {
        newRow[col.field] = "";
      });
      const updatedSheets = [...this.localFile.sheets];
      const currentData = updatedSheets[this.activeSheetTab].data || [];
      const selectedIndices = this.selectedRows
        .map(rowKey => currentData.findIndex(row => row._rowKey === rowKey))
        .filter(index => index !== -1)
        .sort((a, b) => a - b);
      const insertIndex = selectedIndices[0];
      const newData = [
        ...currentData.slice(0, insertIndex),
        newRow,
        ...currentData.slice(insertIndex),
      ];
      updatedSheets[this.activeSheetTab] = {
        ...updatedSheets[this.activeSheetTab],
        data: newData,
      };
      const updatedFile = {
        ...this.localFile,
        sheets: updatedSheets,
        updatedAt: new Date().toISOString(),
      };
      this.localFile = updatedFile;
      this.selectedRows = [];
      if (this.$refs[`sheetEditor${this.activeSheetTab}`]) {
        this.$refs[`sheetEditor${this.activeSheetTab}`].setSelectedRows([]);
      }
    },
    addRowBelow() {
      if (this.selectedRows.length === 0) return;
      const newRow = {
        _rowKey: String(Date.now() + Math.random()),
      };
      this.alphabeticalColumns.forEach((col) => {
        newRow[col.field] = "";
      });
      const updatedSheets = [...this.localFile.sheets];
      const currentData = updatedSheets[this.activeSheetTab].data || [];
      const selectedIndices = this.selectedRows
        .map(rowKey => currentData.findIndex(row => row._rowKey === rowKey))
        .filter(index => index !== -1)
        .sort((a, b) => a - b);
      const insertIndex = selectedIndices[selectedIndices.length - 1] + 1;
      const newData = [
        ...currentData.slice(0, insertIndex),
        newRow,
        ...currentData.slice(insertIndex),
      ];
      updatedSheets[this.activeSheetTab] = {
        ...updatedSheets[this.activeSheetTab],
        data: newData,
      };
      const updatedFile = {
        ...this.localFile,
        sheets: updatedSheets,
        updatedAt: new Date().toISOString(),
      };
      this.localFile = updatedFile;
      this.selectedRows = [];
      if (this.$refs[`sheetEditor${this.activeSheetTab}`]) {
        this.$refs[`sheetEditor${this.activeSheetTab}`].setSelectedRows([]);
      }
    },
    handleRowSelection(sheetIndex, selected) {
      const currentData = this.localFile.sheets[sheetIndex]?.data || [];
      this.selectedRows = selected
        .filter(index => index >= 0 && index < currentData.length)
        .map(index => currentData[index]._rowKey);
    },
    deleteSelectedRows() {
      if (this.selectedRows.length === 0) return;
      const updatedSheets = [...this.localFile.sheets];
      const currentData = updatedSheets[this.activeSheetTab].data || [];
      const newData = currentData.filter(
        row => !this.selectedRows.includes(row._rowKey)
      );
      updatedSheets[this.activeSheetTab] = {
        ...updatedSheets[this.activeSheetTab],
        data: newData,
      };
      const updatedFile = {
        ...this.localFile,
        sheets: updatedSheets,
        updatedAt: new Date().toISOString(),
      };
      this.localFile = updatedFile;
      this.selectedRows = [];
      if (this.$refs[`sheetEditor${this.activeSheetTab}`]) {
        this.$refs[`sheetEditor${this.activeSheetTab}`].setSelectedRows([]);
      }
    },
    openDeleteSheetDialog(sheetIndex) {
      this.sheetToDelete = sheetIndex;
      this.dialogDeleteSheet = true;
    },
    deleteSheetConfirm() {
      const updatedSheets = [...this.localFile.sheets];
      updatedSheets.splice(this.sheetToDelete, 1);
      const updatedFile = {
        ...this.localFile,
        sheets: updatedSheets,
        updatedAt: new Date().toISOString(),
      };
      this.localFile = updatedFile;
      if (this.activeSheetTab >= updatedSheets.length && updatedSheets.length > 0) {
        this.activeSheetTab = updatedSheets.length - 1;
      } else if (updatedSheets.length === 0) {
        this.activeSheetTab = 0;
      }
      this.closeDeleteSheetDialog();
    },
    closeDeleteSheetDialog() {
      this.dialogDeleteSheet = false;
      this.sheetToDelete = null;
    },
    saveChanges() {
      this.updateFile(this.localFile);
    },
  },
  async mounted() {
    this.loading = true;
    await this.fetchFileById(this.$route.params.id);
    this.localFile = this.getFileById(this.$route.params.id) || null;
    this.loading = false;
  },
};
</script>