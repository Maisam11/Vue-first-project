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
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="$emit('closeDialog')">Cancel</v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="$emit('save', localItem)"
          :disabled="!localItem.name"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "FileDialog",
  props: {
    dialog: Boolean,
    editedItem: Object,
  },
  data() {
    return {
      localItem: this.editedItem
        ? { ...this.editedItem }
        : {
            id: String(Date.now()),
            name: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addedBy: "Current User", // Replace with actual user data
            sheets: [],
          },
    };
  },
  watch: {
    editedItem(newVal) {
      this.localItem = newVal
        ? { ...newVal }
        : {
            id: String(Date.now()),
            name: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addedBy: "Current User",
            sheets: [],
          };
    },
  },
};
</script>