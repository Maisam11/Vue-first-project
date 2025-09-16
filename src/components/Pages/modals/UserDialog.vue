<template>
  <v-dialog v-model="localDialog" @click:outside="closeDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{
          localEditedItem.id ? "User" : "New User"
        }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <GenericTextField v-model="localEditedItem.name" label="Name" />
            </v-col>
            <v-col cols="12">
              <GenericTextField v-model="localEditedItem.email" label="Email" />
            </v-col>
            <v-col cols="12">
              <GenericTextField v-model="localEditedItem.dob" label="Date of Birth" type="date" />
            </v-col>
            <v-col cols="12">
              <GenericTextField v-model="localEditedItem.age" label="Age" type="number" />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <GenericButton color="primary" background @click="closeDialog">Cancel</GenericButton>
        <GenericButton color="success" background @click="save" id="save-btn-dailog" :loading="isLoading">
          Save
        </GenericButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import GenericButton from "@/components/common/GenericButton.vue";
import GenericTextField from "@/components/common/GenericTextField.vue";

export default {
  components: { GenericButton, GenericTextField },
  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
    editedItem: {
      type: Object,
      default: () => ({
        id: null,
        name: "",
        email: "",
        dob: "",
        age: "",
        addresses: [],
      }),
    },
  },
  data() {
    return {
      localDialog: this.dialog,
      localEditedItem: { ...this.editedItem },
      isLoading: false,
    };
  },
  watch: {
    dialog(newValue) {
      this.localDialog = newValue;
    },
    editedItem: {
      immediate: true,
      handler(newValue) {
        this.localEditedItem = { ...newValue };
      },
    },
  },
  methods: {
    save() {
      this.isLoading = true;
      // Ensure localEditedItem has all required fields
      const userData = {
        id: this.localEditedItem.id || String(Date.now()),
        name: this.localEditedItem.name || "",
        email: this.localEditedItem.email || "",
        dob: this.localEditedItem.dob || "",
        age: this.localEditedItem.age || "",
        addresses: this.localEditedItem.addresses || [],
      };
      setTimeout(() => {
        this.isLoading = false;
        this.$emit("save", userData);
        this.$emit("update:dialog", false);
      }, 1000);
    },
    closeDialog() {
      this.$emit("closeDialog");
    },
  },
};
</script>