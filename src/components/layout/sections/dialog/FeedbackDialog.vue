<template>
  <V-dialog :value="dialog" width="500" height="100%">
    <v-card flat class="parentCard">
      <v-card class="d-flex px-5">
        <h2>dialog</h2>
        <v-spacer></v-spacer>
        <v-icon color="error" @click="closeDialog">mdi-close</v-icon>
      </v-card>

      <v-card class="pa-5">
        <v-text-field
          class="my-3"
          dense
          outlined
          label="First Name"
          type="text"
          hide-details
          v-model="firstName"
        >
        </v-text-field>

        <v-text-field
          class="my-3"
          dense
          outlined
          type="text"
          label="Last Name"
          hide-details
          v-model="lastName"
        >
        </v-text-field>

        <v-btn @click="save" color="success">save</v-btn>

        <p>{{ fullName }}</p>
      </v-card>
    </v-card>
  </V-dialog>
</template>

<script>
export default {
  name: "FeedbackDialog",

  props: {
    dialog: Boolean,
  },

  data() {
    return {
      firstName: "",
      lastName: "",
      savedfirstName: "",
      savedlastName: "",
    };
  },

  computed :{
    fullName (){
        return this.savedfirstName + " " + this.savedlastName
    }
  },

  methods: {
    closeDialog() {
      this.$emit("closeDialog");
    },

    save() {
      this.savedfirstName = this.firstName;
      this.savedlastName = this.lastName;
      this.firstName = "";
      this.lastName = "";
    },

    childFunc1() {
       this.$toast.success(`child component function 1 hit ho gaya`);
    },

    childFunc2() {
       this.$toast.success(`child component function 2 hit ho gaya`);
    },

  },
};
</script>

<style scoped>
.parentCard {
  overflow: hidden;
}
</style>