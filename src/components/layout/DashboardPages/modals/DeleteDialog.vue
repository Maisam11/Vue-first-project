<template>
  <v-dialog v-model="localDialog" @click:outside="closeDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6 text-center">
        Are you sure you want to delete this record?
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <GenericButton color="primary" background id="cancel-btn-dailog" @click="closeDialog">Cancel</GenericButton>
        <GenericButton color="danger" background :loading="isLoading" id="delete-btn-dailog" @click="confirmDelete">Delete</GenericButton>

      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import GenericButton from "@/components/common/GenericButton.vue";

export default {
  components: { GenericButton },
  name: "DeleteDialog",
  props: ["dialog"],
  data() {
    return {
      localDialog: this.dialog,
      isLoading: false,
    };
  },
  watch: {
    dialog(newVal) {
      this.localDialog = newVal;
    },
  },
  methods: {
  closeDialog() {
    this.$emit("closeDialog");
  },
  confirmDelete() {
    this.isLoading = true;

    setTimeout(() => {
      this.$emit("confirm");
      this.isLoading = false; 
      this.localDialog = false;
    }, 1000);
  },
},

};
</script>
