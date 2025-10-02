<template>
  <v-container class="mt-2">
    <v-tabs v-model="activeTab" class="mb-4">
      <v-tab>Table View</v-tab>
      <v-tab>Excel View</v-tab>
    </v-tabs>

    <v-tabs-items v-model="activeTab">
      <v-tab-item>
        <UserDataTable />
      </v-tab-item>

      <v-tab-item>
        <ExcelView />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import ExcelView from "../Excel/ExcelView.vue";
import UserDataTable from "../Users/UserTable/UserDataTable.vue";

export default {
  name: "UserPage",
  components: { ExcelView, UserDataTable },
  data() {
    return {
      activeTab: 0,
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    ...mapActions("users", ["fetchUsers"]),
  },
};
</script>