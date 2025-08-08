<template>
  <div>
    <v-container>
      <h2>File Details: {{ file.name }}</h2>
      <v-card>
        <v-card-text>
          <p><strong>File Name:</strong> {{ file.name }}</p>
          <p><strong>Created At:</strong> {{ file.createdAt }}</p>
          <p><strong>Updated At:</strong> {{ file.updatedAt }}</p>
          <p><strong>Added By:</strong> {{ file.addedBy }}</p>
          <p><strong>Sheets:</strong> {{ file.sheets.length ? file.sheets.join(', ') : 'No sheets' }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="$router.push('/UserDashboard/Files')">Back to Files</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "FileView",
  computed: {
    ...mapGetters(["getFileById"]),
    file() {
      return this.getFileById(this.$route.params.id) || {};
    },
  },
  methods: {
    ...mapActions(["fetchFileById"]),
  },
  mounted() {
    this.fetchFileById(this.$route.params.id);
  },
};
</script>