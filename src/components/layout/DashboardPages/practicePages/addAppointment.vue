<template>
  <v-container>
    <v-card class="pa-5">
      <v-card-title> addAppointment </v-card-title>
      <v-card-text>
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Date of Birth:</strong> {{ user.dob }}</p>
        <p><strong>Age:</strong> {{ user.age }}</p>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <GenericButton color="primary" background id="add-appointment-btn" @click="openDialog">Add Appointment</GenericButton
        >
      </v-card-actions>
    </v-card>

    <v-list class="mt-4">
      <v-subheader>Appointments</v-subheader>
      <v-list-item
        v-for="(appointment, index) in user.appointments"
        :key="index"
      >
        <v-list-item-content>
          <v-list-item-title>{{ appointment.date }}</v-list-item-title>
          <v-list-item-subtitle>{{
            appointment.description
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title> Add Appointment </v-card-title>
        <v-card-text>
          <GenericTextField
            v-model="appointment.date"
            label="Date"
            type="date"
            filled
          />
          <v-textarea
            v-model="appointment.description"
            label="Description"
            filled
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <GenericButton color="primary" background @click="dialog = false"
            >Cancel</GenericButton
          >
          <GenericButton color="success" id="save-appointment-btn" background @click="saveAppointment" :loading="isLoading"
            >Save</GenericButton
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import GenericButton from "@/components/common/GenericButton.vue";
import GenericTextField from "@/components/common/GenericTextField.vue";

export default {
  components: { GenericButton, GenericTextField },
  data() {
    return {
      dialog: false,
      isLoading: false,
      appointment: {
        date: "",
        description: "",
      },
    };
  },
  computed: {
    user() {
      const userId = this.$route.params.id;
      return (
        this.$store.getters.getUsers.find((user) => user.id == userId) || {}
      );
    },
  },
  methods: {
    openDialog() {
      this.dialog = true;
    },
    saveAppointment() {
    if (this.appointment.date && this.appointment.description) {
      this.isLoading = true;

      setTimeout(() => {
        this.$store.dispatch("addAppointment", {
          userId: this.user.id,
          appointment: { ...this.appointment },
        });

        this.dialog = false;
        this.appointment = { date: "", description: "" };
        this.isLoading = false;
      }, 500);
          
      }

    },
  },
};
</script>