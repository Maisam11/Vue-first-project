<template>
  <div style="margin: 0 1.4rem 0 0;">
    <v-container v-if="loading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-container>
    <v-container v-else-if="localFile">
      <h2>File Details: {{ localFile.name }}</h2>
      <v-card>
        <v-card-text>
          <p><strong>File ID:</strong> {{ localFile.id }}</p>
          <p><strong>File Name:</strong> {{ localFile.name }}</p>
          <p><strong>Created At:</strong> {{ localFile.createdAt }}</p>
          <p><strong>Updated At:</strong> {{ localFile.updatedAt }}</p>
          <p><strong>Added By:</strong> {{ localFile.addedBy }}</p>
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
              v-for="(sheet, index) in localFile.sheets || []"
              :key="index"
              @dblclick="startEditingSheetName(index)"
              @contextmenu.prevent="openDeleteSheetDialog(index)"
            >
              <template v-if="editingSheetIndex === index">
                <v-text-field
                  v-model="editingSheetName" dense hide-details
                  :rules="[v => !!v || 'Sheet name is required']"
                  @blur="saveSheetName(index)"
                  @keyup.enter="saveSheetName(index)"
                  @keyup.esc="cancelEditingSheetName"
                  ref="sheetNameInput" autofocus
                ></v-text-field>
              </template>
              <template v-else>
                {{ sheet }}
              </template>
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="activeSheetTab">
            <v-tab-item v-for="(sheet, index) in localFile.sheets || []" :key="index">
              <GenericExcelSheet
                :value="sheetData[index] || []"
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
import { mapGetters, mapActions } from "vuex";
import { getDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { CURRENT_MODULE } from '@/store/index';

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
      editingSheetName: '',
      sheetData: [],
      alphabeticalColumns: Array.from({ length: 26 }, (_, i) => ({
        field: String.fromCharCode(65 + i),
        title: String.fromCharCode(65 + i),
        type: "string",
        width: "160px",
      })),
    };
  },
  computed: {
    ...mapGetters(["getFileById"]),
  },
  methods: {
    ...mapActions(["updateFile"]),
    async loadSheetData() {
      this.sheetData = [];
      const promises = this.localFile.sheets.map(async (sheet) => {
        try {
          const snap = await getDoc(doc(db, CURRENT_MODULE.fullId, this.localFile.id, 'sheets', sheet));
          return snap.exists() ? snap.data().data || [] : [];
        } catch (error) {
          console.error(`Error loading sheet ${sheet}:`, error);
          return [];
        }
      });
      this.sheetData = await Promise.all(promises);
    },
    addNewSheet() {
      const sheetsLength = this.localFile.sheets.length;
      const newSheetName = `Sheet ${sheetsLength + 1}`;
      this.localFile.sheets.push(newSheetName);
      this.sheetData.push([]);
      this.activeSheetTab = sheetsLength;
      this.localFile.updatedAt = new Date().toISOString();
    },
    updateSheetData(sheetIndex, newData) {
      this.sheetData[sheetIndex] = newData.map(row => ({
        ...row,
        _rowKey: row._rowKey || String(Date.now() + Math.random()),
      }));
      this.localFile.updatedAt = new Date().toISOString();
    },
    addRow() {
      const newRow = {
        _rowKey: String(Date.now() + Math.random()),
      };
      this.alphabeticalColumns.forEach((col) => {
        newRow[col.field] = "";
      });
      this.sheetData[this.activeSheetTab].push(newRow);
      this.localFile.updatedAt = new Date().toISOString();
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
      const currentData = this.sheetData[this.activeSheetTab] || [];
      const selectedIndices = this.selectedRows
        .map(rowKey => currentData.findIndex(row => row._rowKey === rowKey))
        .filter(index => index !== -1)
        .sort((a, b) => a - b);
      const insertIndex = selectedIndices[0];
      currentData.splice(insertIndex, 0, newRow);
      this.localFile.updatedAt = new Date().toISOString();
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
      const currentData = this.sheetData[this.activeSheetTab] || [];
      const selectedIndices = this.selectedRows
        .map(rowKey => currentData.findIndex(row => row._rowKey === rowKey))
        .filter(index => index !== -1)
        .sort((a, b) => a - b);
      const insertIndex = selectedIndices[selectedIndices.length - 1] + 1;
      currentData.splice(insertIndex, 0, newRow);
      this.localFile.updatedAt = new Date().toISOString();
      this.selectedRows = [];
      if (this.$refs[`sheetEditor${this.activeSheetTab}`]) {
        this.$refs[`sheetEditor${this.activeSheetTab}`].setSelectedRows([]);
      }
    },
    handleRowSelection(sheetIndex, selected) {
      const currentData = this.sheetData[sheetIndex] || [];
      this.selectedRows = selected
        .filter(index => index >= 0 && index < currentData.length)
        .map(index => currentData[index]._rowKey);
    },
    deleteSelectedRows() {
      if (this.selectedRows.length === 0) return;
      const currentData = this.sheetData[this.activeSheetTab] || [];
      const newData = currentData.filter(
        row => !this.selectedRows.includes(row._rowKey)
      );
      this.sheetData[this.activeSheetTab] = newData;
      this.localFile.updatedAt = new Date().toISOString();
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
      const deletedSheetName = this.localFile.sheets[this.sheetToDelete];
      this.localFile.sheets.splice(this.sheetToDelete, 1);
      this.sheetData.splice(this.sheetToDelete, 1);
      
      deleteDoc(doc(db, CURRENT_MODULE.fullId, this.localFile.id, 'sheets', deletedSheetName)).catch((error) => {
        console.error(`[Firestore] Failed to delete sheet data ${deletedSheetName}:`, error);
      });
      
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
      this.editingSheetName = this.localFile.sheets[index];
      this.$nextTick(() => {
        if (this.$refs.sheetNameInput) {
          this.$refs.sheetNameInput.focus();
        }
      });
    },
    saveSheetName(index) {
      if (this.editingSheetName.trim()) {
        const oldName = this.localFile.sheets[index];
        this.localFile.sheets[index] = this.editingSheetName.trim();
        this.localFile.updatedAt = new Date().toISOString();
        
        const oldDoc = doc(db, CURRENT_MODULE.fullId, this.localFile.id, 'sheets', oldName);
        const newDoc = doc(db, CURRENT_MODULE.fullId, this.localFile.id, 'sheets', this.editingSheetName.trim());
        
        getDoc(oldDoc).then((snap) => {
          if (snap.exists()) {
            setDoc(newDoc, snap.data()).then(() => {
              deleteDoc(oldDoc);
            });
          }
        }).catch((error) => {
          console.error(`[Firestore] Failed to rename sheet from ${oldName} to ${this.editingSheetName.trim()}:`, error);
        });
      }
      this.editingSheetIndex = null;
      this.editingSheetName = '';
    },
    cancelEditingSheetName() {
      this.editingSheetIndex = null;
      this.editingSheetName = '';
    },
    async saveChanges() {
      const metadata = {
        ...this.localFile,
        sheets: this.localFile.sheets,
      };
      this.updateFile(metadata);
      
      for (let i = 0; i < this.localFile.sheets.length; i++) {
        const sheetName = this.localFile.sheets[i];
        const data = this.sheetData[i];
        if (data && data.length) {
          await setDoc(doc(db, CURRENT_MODULE.fullId, this.localFile.id, 'sheets', sheetName), { data: data }).catch((error) => {
            console.error(`[Firestore] Failed to set sheet data ${sheetName}:`, error);
          });
        }
      }
    },
  },
  async mounted() {
    this.loading = true;
    this.localFile = this.getFileById(this.$route.params.id) || null;
    if (this.localFile) {
      this.localFile = {
        ...this.localFile,
        sheets: this.localFile.sheets || [],
      };
      await this.loadSheetData();
    }
    this.loading = false;
  },
};
</script>