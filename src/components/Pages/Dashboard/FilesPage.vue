<template>
  <div style="margin: 1rem 2.1rem 0 1rem;">
    <GenericDataTable :headers="headers" :items="files" title="Files Table" :footerProps="footerProps" :showExpand="false" >
      <template v-slot:toolbar-actions>
        <div class="d-flex mb-4">
          <GenericButton color="primary" icon="mdi-plus" background @click="openDialog(null)" id="add-new-file-btn" > File</GenericButton>
          <GenericButton color="success" background icon="mdi-download" @click="downloadAllFiles" :disabled="!files.length"
            id="download-files-btn" > Excel</GenericButton>
        </div>
      </template>

      <template v-slot:column-actions="{ item }">
        <TableActions :item="item" :onEdit="openDialog" :onView="viewFile" :onDelete="openDeleteDialog" />
      </template>
    </GenericDataTable>

    <FileDialog :dialog="dialog" :editedItem="editedItem" @update:dialog="dialog = $event" @update:editedItem="editedItem = $event"
      @save="saveFile" @closeDialog="closeDialog" />
    <DeleteDialog :dialog="dialogDelete" @confirm="deleteFileConfirm" @closeDialog="closeDialog" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import GenericButton from "@/components/common/GenericButton.vue";
import GenericDataTable from "@/components/common/GenericDataTable.vue";
import TableActions from "@/components/custom-columns/TableActions.vue";
import FileDialog from "@/components/Pages/modals/FileDialog.vue";
import DeleteDialog from "@/components/Pages/modals/DeleteDialog.vue";
import * as XLSX from "xlsx";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { CURRENT_MODULE } from '@/store/index';

export default {
  name: "FilesPage",
  components: { GenericButton, GenericDataTable, TableActions, FileDialog, DeleteDialog },
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      editedItem: null,
      footerProps: {
        showFirstLastPage: true,
        itemsPerPageOptions: [5, 10, 25],
      },
      headers: [
        { text: "File Name", value: "name", width: "200px", class: "font-weight-bold", filterable: true },
        { text: "Created At", value: "createdAt", width: "200px", filterable: true },
        { text: "Updated At", value: "updatedAt", width: "200px", filterable: true },
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
    ...mapGetters(["getFiles"]),
    files() {
      return this.getFiles;
    },
  },
  methods: {
    ...mapActions(["addFile", "updateFile", "deleteFile"]),
    openDialog(item) {
      this.dialogDelete = false;
      this.editedItem = item
        ? { ...item }
        : {
            id: this.generateRandomId(),
            name: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addedBy: "Maisam Ali",
            sheets: [],
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
    saveFile(file) {
      if (this.files.find((f) => f.id === file.id)) {
        this.updateFile({ ...file, updatedAt: new Date().toISOString() });
      } else {
        this.addFile(file);
      }
      this.dialog = false;
    },
    deleteFileConfirm() {
      this.deleteFile(this.editedItem.id);
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
    async downloadAllFiles() {
      if (!this.files.length) {
        alert("No files available to download.");
        return;
      }

      const wb = XLSX.utils.book_new();
      let hasData = false;

      for (const file of this.files) {
        const sheets = file.sheets || [];
        for (const [sheetIndex, sheetName] of sheets.entries()) {
          try {
            const sheetDocRef = doc(db, CURRENT_MODULE.fullId, file.id, 'sheets', sheetName);
            const sheetDoc = await getDoc(sheetDocRef);
            
            const data = sheetDoc.exists() ? sheetDoc.data().data || [] : [];
            
            if (data.length > 0) {
              hasData = true;
              
              const wsData = [
                this.alphabeticalColumns.map(col => col.title),
                ...data.map(row =>
                  this.alphabeticalColumns.map(col => row[col.field] || "")
                ),
              ];
              
              const ws = XLSX.utils.aoa_to_sheet(wsData);
              
              const sheetNameForExcel = `${file.name || `File${file.id}`}_${sheetName || `Sheet${sheetIndex + 1}`}`.slice(0, 31);
              XLSX.utils.book_append_sheet(wb, ws, sheetNameForExcel);
            }
          } catch (error) {
            console.error(`Error downloading sheet ${sheetName} for file ${file.id}:`, error);
          }
        }
      }

      if (!hasData) {
        alert("No data available to download.");
        return;
      }

      XLSX.writeFile(wb, "AllFiles.xlsx");
    },
  },
  mounted() {
  },
};
</script>