<template>
  <div style="margin-top: 1rem; margin-inline: 2.4rem;">
    <GenericDataTable
      :headers="headers"
      :items="files"
      title="Files Table"
      :footerProps="footerProps"
      :showExpand="false"
    >
      <template v-slot:toolbar-actions>
        <GenericButton color="primary" background @click="openDialog(null)" id="add-new-file-btn" > Add New File </GenericButton>
      </template>

      <template v-slot:column-actions="{ item }">
        <TableActions :item="item" :onEdit="openDialog" :onView="viewFile" :onDelete="openDeleteDialog" />
      </template>

      <template v-slot:header-name="{ header }">
        <div class="d-flex align-center">
          <span>{{ header.text }}</span>
          <v-icon small class="ml-1">mdi-file</v-icon>
        </div>
      </template>
    </GenericDataTable>

    <FileDialog
      :dialog="dialog"
      :editedItem="editedItem"
      @update:dialog="dialog = $event"
      @update:editedItem="editedItem = $event"
      @save="saveFile"
      @closeDialog="closeDialog"
    />
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
        { text: "File Name", value: "name", width: "200px", class: "font-weight-bold", filterable: true, },
        { text: "Created At", value: "createdAt", width: "200px", filterable: true, },
        { text: "Updated At", value: "updatedAt", width: "200px", filterable: true, },
        { text: "Added By", value: "addedBy", width: "200px", filterable: true, },
        { text: "Actions", value: "actions", sortable: false, align: "center", width: "150px", },
      ],
    };
  },
  computed: {
    ...mapGetters(["getFiles"]),
    files() {
      return this.getFiles;
    },
  },
  methods: {
    ...mapActions(["addFile", "updateFile", "deleteFile", "fetchFiles"]),
    openDialog(item) {
      this.dialogDelete = false;
      this.editedItem = item
        ? { ...item }
        : {
            id: String(Date.now()),
            name: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addedBy: "Current User",
            sheets: [],
          };
      this.dialog = true;
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
  },
  mounted() {
    this.fetchFiles();
  },
};
</script>