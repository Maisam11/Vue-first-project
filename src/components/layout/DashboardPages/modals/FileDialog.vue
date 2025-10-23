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
          v-if="isAdmin"
          v-model="localItem.viewers"
          :items="staffUsers"
          item-text="username"
          item-value="id"
          label="Share With Staff (View Only)"
          multiple
          outlined
          dense
          chips
          small-chips
          hint="Selected staff users will be able to view but not edit this file"
          persistent-hint
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="$emit('closeDialog')">Cancel</v-btn>
        <v-btn 
          color="blue darken-1" 
          text 
          @click="$emit('save', localItem)" 
          :disabled="!localItem.name"
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
    ...mapGetters("roles", ["getCurrentUserRole"]),
    isAdmin() {
      return this.getCurrentUserRole === 'admin';
    },
  },
  data() {
    return {
      localItem: this.editedItem
        ? { 
            ...this.editedItem, 
            sheets: this.editedItem.sheets || [], 
            editors: this.editedItem.editors || [],
            viewers: this.editedItem.viewers || [] 
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
          },
      staffUsers: [],
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
    async loadStaffUsers() {
      if (this.isAdmin) {
        const users = await this.fetchAllUsers();
        this.staffUsers = users.filter(u => u.role === 'staff');
      }
    },
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.focusInput();
        this.loadStaffUsers();
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
    },
  },
};
</script>