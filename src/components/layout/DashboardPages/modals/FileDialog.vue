<template>
  <v-dialog :value="dialog" @input="$emit('update:dialog', $event)" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ editedItem && editedItem.id ? 'Edit File' : 'Add New File' }}</span>
      </v-card-title>
      <v-card-text>
        <v-text-field 
          v-model="localItem.name" 
          label="File Name" 
          required 
          :rules="[v => !!v || 'File Name is required']"
          ref="fileNameInput"
        ></v-text-field>
        <v-select
          v-model="localItem.type"
          :items="fileTypes"
          label="File Type" dense
          :disabled="!!editedItem?.type"
        ></v-select>
        <v-select
          v-if="canShare"
          v-model="selectedUsers"
          :items="availableUsers"
          item-text="displayName"
          item-value="id"
          label="Share With Users"
          multiple
          dense
          persistent-hint
          @change="handleUserSelection" >
        </v-select>

        <div v-if="canShare && selectedUserDetails.length > 0" >
          <v-list dense class="access-list">
            <v-list-item v-for="user in selectedUserDetails" :key="user.id" class="access-list-item my-2" style=" border-bottom: 1px solid black;">
              <v-icon small color="primary" size="32" class="mr-2">mdi-account</v-icon>
              
              <v-list-item-content class="py-1">
                <v-list-item-title class="text-body-2 font-weight-medium">
                  {{ user.displayName }}
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-action class="mx-1 my-1" style="max-width: 120px;" >
                <v-select v-model="userAccess[user.id]" :items="accessLevels" item-text="text" item-value="value" dense 
                 hide-details class="access-dropdown" @change="updateAccessLevel(user.id, $event)">
                </v-select>
              </v-list-item-action>

              <v-list-item-action class="my-0 ml-1">
                <v-btn icon small @click="removeUser(user.id)" color="error" class="delete-btn" >
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="$emit('closeDialog')">Cancel</v-btn>
        <v-btn 
          color="blue darken-1" 
          text 
          @click="saveFile" 
          :disabled="!localItem.name || !localItem.type"
        >Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "FileDialog",
  props: {
    dialog: Boolean,
    editedItem: Object,
  },
  computed: {
    ...mapGetters("roles", ["getCurrentUserRole", "getAllUsers"]),
    ...mapGetters("auth", ["currentUser"]),
    isAdmin() {
      return this.getCurrentUserRole === 'admin';
    },
    isCreator() {
      return this.editedItem && this.editedItem.addedBy === this.currentUser?.username;
    },
    canShare() {
      return this.isAdmin || this.isCreator;
    },
    availableUsers() {
      if (!this.allUsers || !this.currentUser) return [];
      const filteredUsers = this.allUsers.filter(user => 
        user.id !== this.currentUser?.uid &&
        !this.selectedUsers.includes(user.id)
      );
      return filteredUsers.map(user => ({
        ...user,
        displayName: `${user.username}${user.role === 'admin' ? ' (Admin)' : ''}`
      }));
    },
    selectedUserDetails() {
      if (!this.allUsers || !this.currentUser) return [];
      return this.allUsers.filter(user => 
        this.selectedUsers.includes(user.id)
      )
        .map(user => ({
          ...user,
          displayName: user.username || user.email || 'Unknown User'
        }));
    }
  },
  data() {
    return {
      localItem: this.editedItem
        ? { 
            ...this.editedItem, 
            sheets: this.editedItem.sheets || [], 
            editors: this.editedItem.editors || [],
            type: this.editedItem.type || '',
            viewers: this.editedItem.viewers || [] 
          }
        : {
            id: this.generateRandomId(),
            name: "",
            type: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addedBy: this.$store.getters['auth/currentUser']?.username || 'Unknown',
            sheets: [],
            editors: [this.$store.getters['auth/currentUser']?.uid].filter(Boolean),
            viewers: []
          },
      allUsers: [],
      selectedUsers: [],
      userAccess: {},
      accessLevels: [
        { text: 'View Only', value: 'view' },
        { text: 'Edit Only', value: 'edit' }
      ],
      fileTypes: [
        { text: 'Excel File', value: 'excel' },
        { text: 'Document File', value: 'document' }
      ],
    };
  },
  methods: {
    ...mapActions("roles", ["fetchAllUsers"]),
    generateRandomId() {
      return Math.random().toString(36).substring(2, 10);
    },
    focusInput() {
      this.$nextTick(() => {
        if (this.$refs.fileNameInput) {
          this.$refs.fileNameInput.focus();
        }
      });
    },
    async loadUsers() {
      if (this.canShare) {
        const users = await this.fetchAllUsers();
        this.allUsers = users;

        if (this.editedItem && this.editedItem.id) {
          this.selectedUsers = [
            ...(this.localItem.editors || []),
            ...(this.localItem.viewers || [])
          ].filter((id, index, self) => 
            id !== this.$store.getters['auth/currentUser']?.uid &&
            self.indexOf(id) === index
          );
          this.initializeUserAccess();
        }
      }
    },

    initializeUserAccess() {
      this.userAccess = {};
      (this.localItem.editors || []).forEach(userId => {
        if (userId !== this.$store.getters['auth/currentUser']?.uid) {
          this.userAccess[userId] = 'edit';
        }
      });
 
      (this.localItem.viewers || []).forEach(userId => {
        this.userAccess[userId] = 'view';
      });

      this.selectedUsers.forEach(userId => {
        if (!this.userAccess[userId]) {
          this.userAccess[userId] = 'view';
        }
      });
    },
    handleUserSelection(selectedUserIds) {
      this.selectedUsers = [...selectedUserIds];
      
      selectedUserIds.forEach(userId => {
        if (!this.userAccess[userId]) {
          this.userAccess[userId] = 'view';
        }
      });
    },
    updateAccessLevel(userId, accessLevel) {
      this.userAccess[userId] = accessLevel;
    },
    removeUser(userId) {
      this.selectedUsers = this.selectedUsers.filter(id => id !== userId);
      delete this.userAccess[userId];
    },
    saveFile() {
      const editors = [this.$store.getters['auth/currentUser']?.uid].filter(Boolean);
      const viewers = [];

      Object.keys(this.userAccess).forEach(userId => {
        if (this.userAccess[userId] === 'edit') {
          editors.push(userId);
        } else if (this.userAccess[userId] === 'view') {
          viewers.push(userId);
        }
      });

      this.localItem.editors = [...new Set(editors)];
      this.localItem.viewers = [...new Set(viewers)];

      this.$emit('save', this.localItem);
    },
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.focusInput();
        this.loadUsers();
      }
    },
    editedItem(newVal) {
      this.localItem = newVal
        ? { 
            ...newVal, 
            sheets: newVal.sheets || [], 
            editors: newVal.editors || [],
            viewers: newVal.viewers || [] 
          }
        : {
            id: this.generateRandomId(),
            name: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addedBy: this.$store.getters['auth/currentUser']?.username || 'Unknown',
            sheets: [],
            editors: [this.$store.getters['auth/currentUser']?.uid].filter(Boolean),
            viewers: []
          };

      if (!newVal || !newVal.id) {
        this.selectedUsers = [];
        this.userAccess = {};
      } else {
        this.$nextTick(() => {
          this.loadUsers();
        });
      }
    },
    selectedUsers(newSelectedUsers) {  
      Object.keys(this.userAccess).forEach(userId => {
        if (!newSelectedUsers.includes(userId)) {
          delete this.userAccess[userId];
        }
      });
    },
  },
};
</script>

<style scoped>
.access-dropdown {
  font-size: 0.8rem;
}
</style>