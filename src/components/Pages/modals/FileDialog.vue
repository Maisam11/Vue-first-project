<template>
  <v-dialog :value="dialog" max-width="500px" @input="$emit('update:dialog', $event)">
    <v-card>
      <v-card-title>
        <span class="headline">{{ localItem && localItem.id ? 'Edit File' : 'Add New File' }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                :value="localItem.name"
                @input="$emit('update:editedItem', { ...localItem, name: $event })"
                label="File Name"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="$emit('closeDialog')">Cancel</v-btn>
        <v-btn color="blue darken-1" text @click="$emit('save', localItem)" id="save-btn-dialog">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "FileDialog",
  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
    editedItem: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localItem: { ...this.editedItem },
    };
  },
  watch: {
    editedItem(newVal) {
      this.localItem = { ...newVal };
    },
  },
};
</script>