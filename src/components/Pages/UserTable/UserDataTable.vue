<template>
  <div>
    <GenericDataTable
      :headers="headers"
      :items="combinedUsers"
      title="Users Table"
      :footerProps="footerProps"
      :showExpand="true"
    >
      <template v-slot:toolbar-actions>
        <GenericButton
          color="primary"
          background
          @click="openDialog(null)"
          id="add-new-record-btn"
        >
          Add New Record
        </GenericButton>
      </template>

      <template v-slot:column-actions="{ item }">
        <TableActions :item="item" :onEdit="openDialog" :onView="openDialog" :onDelete="openDeleteDialog" />
      </template>

      <template v-slot:header-name="{ header }">
        <div class="d-flex align-center">
          <span>{{ header.text }}</span>
          <v-icon small class="ml-1">mdi-account</v-icon>
        </div>
      </template>

      <template v-slot:header-email="{ header }">
        <div class="d-flex align-center">
          <span>{{ header.text }}</span>
          <v-icon small class="ml-1">mdi-email</v-icon>
        </div>
      </template>
    </GenericDataTable>

    <UserDialog :dialog="dialog" :editedItem="editedItem" @save="saveItem" @closeDialog="closeDialog" />
    <DeleteDialog :dialog="dialogDelete" @confirm="deleteItemConfirm" @closeDialog="closeDialog" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import GenericButton from "@/components/common/GenericButton.vue";
import GenericDataTable from "@/components/common/GenericDataTable.vue";
import TableActions from "@/components/custom-columns/TableActions.vue";
import UserDialog from "@/components/Pages/modals/UserDialog.vue";
import DeleteDialog from "@/components/Pages/modals/DeleteDialog.vue";

export default {
  name: "UserDataTable",
  components: { GenericButton, GenericDataTable, TableActions, UserDialog, DeleteDialog },
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
        {
          text: "Name", value: "name", width: "200px", class: "font-weight-bold", filterable: true,
        },
        {
          text: "Email", value: "email", width: "250px", filterable: true,
        },
        {
          text: "Date of Birth", value: "dob", align: "center", width: "150px",
        },
        {
          text: "Age", value: "age", align: "center", width: "100px",
        },
        {
          text: "Actions", value: "actions", sortable: false, align: "center", width: "150px",
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["getCombinedUserData"]),
    combinedUsers() {
      return this.getCombinedUserData;
    },
  },
  methods: {
    ...mapActions(["addUser", "updateUser", "updateFormSubmission", "deleteUser", "deleteFormSubmission"]),
    openDialog(item) {
      this.dialogDelete = false;
      this.editedItem = item
        ? { ...item }
        : { id: Date.now(), name: "", email: "", dob: "", age: "", addresses: [], };
      this.dialog = true;
    },
    openDeleteDialog(item) {
      this.dialog = false;
      this.editedItem = { ...item };
      this.dialogDelete = true;
    },
    saveItem(editedItem) {
      if (this.combinedUsers.find((u) => u.id === editedItem.id)) {
        if (editedItem.isFormSubmission) {
          this.updateFormSubmission(editedItem);
        } else {
          this.updateUser(editedItem);
        }
      } else {
        this.addUser(editedItem);
      }
      this.dialog = false;
    },
    deleteItemConfirm() {
      if (this.editedItem.isFormSubmission) {
        this.deleteFormSubmission(this.editedItem.id);
      } else {
        this.deleteUser(this.editedItem.id);
      }
      this.dialogDelete = false;
    },
    closeDialog() {
      this.dialog = false;
      this.dialogDelete = false;
    },
  },
};
</script>