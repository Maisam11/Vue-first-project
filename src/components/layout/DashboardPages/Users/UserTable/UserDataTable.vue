<template>
  <div>
    <GenericDataTable
      :headers="headers"
      :items="getAllUsers"
      title="Users Table"
      :footerProps="footerProps"
      :showExpand="true"
      :loading="loading"
    >
      <template v-slot:toolbar-actions>
        <GenericButton
          color="primary"
          background
          @click="openDialog(null)"
          id="add-new-record-btn"
          v-if="isAdmin"
        >
          Add New User
        </GenericButton>
      </template>

      <template v-slot:column-actions="{ item }">
        <TableActions :item="item" :onEdit="openDialog" :onView="openDialog" :onDelete="canDeleteUser(item) ? openDeleteDialog : null" />
      </template>
    </GenericDataTable>

    <UserDialog :dialog="dialog" :editedItem="editedItem" @save="saveItem" @closeDialog="closeDialog" />
    <DeleteDialog :dialog="dialogDelete" @confirm="deleteItemConfirm" @closeDialog="closeDialog" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import GenericButton from "../../../../common/GenericButton.vue";
import GenericDataTable from "../../../../common/GenericDataTable.vue"
import TableActions from "../../../../custom-columns/TableActions.vue"
import UserDialog from "../../modals/UserDialog.vue";
import DeleteDialog from "../../modals/DeleteDialog.vue";

export default {
  name: "UserDataTable",
  components: { GenericButton, GenericDataTable, TableActions, UserDialog, DeleteDialog },
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      editedItem: null,
      loading: false,
      footerProps: {
        showFirstLastPage: true,
        itemsPerPageOptions: [5, 10, 25],
      },
      headers: [
        {
          text: "Username", value: "username", width: "200px", class: "font-weight-bold", filterable: true,
        },
        {
          text: "Role", value: "role", width: "150px", filterable: true,
        },
        {
          text: "Actions", value: "actions", sortable: false, align: "center", width: "150px",
        },
      ],
    };
  },
  computed: {
    ...mapGetters("roles", ["getAllUsers", "getCurrentUserRole", "canUserPerformAction"]),
    ...mapGetters("auth", ["currentUser"]),
    isAdmin() {
      return this.getCurrentUserRole === 'admin';
    },
  },
  methods: {
    ...mapActions("roles", ["createUser", "updateUserRole", "deleteUser", "fetchAllUsers"]),
    openDialog(item) {
      this.dialogDelete = false;
      this.editedItem = item
        ? { ...item }
        : { username: "", password: "", role: "staff" };
      this.dialog = true;
    },
    openDeleteDialog(item) {
      if (!this.canDeleteUser(item)) return;
      this.dialog = false;
      this.editedItem = { ...item };
      this.dialogDelete = true;
    },
    async saveItem(editedItem) {
      try {
        if (editedItem.id) {

          await this.updateUserRole({ userId: editedItem.id, role: editedItem.role });
          this.showNotification('User updated successfully');

          await this.fetchAllUsers();
        } else {

          await this.createUser(editedItem);
          this.showNotification('User created successfully');
          

          setTimeout(async () => {
            await this.fetchAllUsers();
          }, 100);
        }
        this.dialog = false;
      } catch (error) {
        console.error('Error saving user:', error);
        this.showNotification('Error saving user: ' + error.message, 'error');
      }
    },
    async deleteItemConfirm() {
      try {
        await this.deleteUser(this.editedItem.id);
        this.showNotification('User deleted successfully');
        this.dialogDelete = false;

        await this.fetchAllUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        this.showNotification('Error deleting user: ' + error.message, 'error');
      }
    },
    closeDialog() {
      this.dialog = false;
      this.dialogDelete = false;
    },
    canDeleteUser(item) {
      return this.isAdmin && !item.isDefault;
    },
    showNotification(message, type = 'success') {

      if (type === 'success') {
        this.$toast.success(message);
      } else if (type === 'error') {
        this.$toast.error(message);
      } else {
        this.$toast.info(message);
      }
    },
  },
  async mounted() {
    if (this.isAdmin) {
      this.loading = true;
      try {
        await this.fetchAllUsers();
      } catch (error) {
        console.error('Error fetching users:', error);
        this.showNotification('Error fetching users: ' + error.message, 'error');
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>