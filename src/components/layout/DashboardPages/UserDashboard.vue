<template>
  <v-container fluid pa-0>
    <!-- App Bar -->
    <v-app-bar app color="#2a2f45" dark>
      <v-toolbar-title>User Dashboard</v-toolbar-title>
      <v-spacer />
      <v-list class="toolbar-menu d-flex bg-transparent">
        <v-list-item v-for="(item, index) in filteredToolbarItems" :key="index">
          <v-list-item-content>
            <router-link
              :id="item.title === 'User Table' ? 'user-table-tab' : null"
              text
              :to="item.to"
              router
              class="text-white fw-bold text-decoration-none"
              style="width: max-content"
            >
              {{ item.title }}
            </router-link>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <div>
       <v-btn @click="logout">Logout</v-btn>
      </div>
      
    </v-app-bar>
    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      :temporary="$vuetify.breakpoint.smAndDown"
      app
      color="#2a2f45"
      dark
    >
      <div class="d-flex flex-column justify-space-between h-100">
        <div>
          <v-list dense>
            <h3 class="m-3">Dashboard</h3>
            <v-list-item
              v-for="(item, index) in filteredDrawerItems"
              :key="index"
              two-line
            >
              <template v-if="!item.children">
                <v-list-item-icon class="icon-tight mt-4">
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content class="title-tight">
                  <router-link
                    :to="item.to"
                    class="text-decoration-none text-white font-weight-bold"
                  >
                    {{ item.title }}
                  </router-link>
                </v-list-item-content>
              </template>
              <template v-else>
                <v-list-group no-action style="margin-left: -1rem">
                  <template v-slot:activator>
                    <v-list-item-icon class="icon-tight">
                      <v-icon class="text-white">{{ item.icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content class="title-tight">
                      <v-list-item-title class="text-white font-weight-bold">
                        {{ item.title }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </template>
                  <v-list-item v-for="(child, i) in item.children" :key="i">
                    <v-list-item-icon class="icon-tight">
                      <v-icon>{{ child.icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content class="title-tight">
                      <router-link
                        :to="child.to"
                        class="text-decoration-none text-white"
                      >
                        {{ child.title }}
                      </router-link>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-group>
              </template>
            </v-list-item>
          </v-list>
        </div>
        <div>
          <v-divider class="my-2" />
          <v-list dense class="bottom-menu">
            <v-list-item
              v-for="(item, index) in bottomDrawerItems"
              :key="index"
            >
              <v-list-item-icon class="icon-tight">
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="title-tight">
                <router-link
                  :to="item.to"
                  class="text-decoration-none text-white font-weight-bold"
                >
                  {{ item.title }}
                </router-link>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Hamburger -->
    <v-btn
      icon
      class="d-md-none ma-2"
      @click="drawer = !drawer"
      style="position: fixed; top: 70px; left: 10px; z-index: 1000"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <!-- Main View Area -->
    <v-main style="padding: 0; margin: 3rem 0 0 9rem; width: 100%;">
      <v-container fluid>
        <div :class="contentClass">
          <router-view />
        </div>
      </v-container>
    </v-main>

    <generic-tour
      :tour-name="'dashboardTour'"
      :helper-title="'Guidance'"
      :helper-items="helperItems"
      :tour-steps="tourSteps"
      :initial-route="'/UserDashboard/UserPage'"
    />
  </v-container>
</template>

<script>
import navigation from "@/components/mixins/navigation.js";
import GenericTour from "@/components/common/GenericTour.vue";
import { mapGetters } from "vuex";

export default {
  name: "UserDashboard",
  components: {
    GenericTour,
  },
  mixins: [navigation],
  data() {
    return {
      drawer: this.$vuetify.breakpoint.mdAndUp,
      dialog: false,
      helperItems: [
        {
          text: "How to Add New Record",
          action: "add-record",
          icon: "mdi-plus-circle-outline",
          color: "blue",
        },
        {
          text: "How to View Records",
          action: "viewTour",
          icon: "mdi-eye",
          color: "#0DCAF0",
        },
        {
          text: "How to Edit Records",
          action: "edit",
          icon: "mdi-rename-outline",
          color: "orange",
        },
        {
          text: "How to Delete Records",
          action: "delete",
          icon: "mdi-delete-forever",
          color: "red",
        },
        {
          text: "How to Download in Excel",
          action: "excel",
          icon: "mdi-download",
          color: "success",
        },
      ],
      tourSteps: {
        "add-record": [
          {
            target: "#user-table-tab",
            content: "First, make sure you are on the User Table section.",
            params: { placement: "bottom" },
          },
          {
            target: "#add-new-record-btn",
            content: "Click Finish button to add a new user record.",
            params: { placement: "left" },
          },
          {
            target: "#save-btn-dailog",
            content: "Click this button to edit user details.",
            params: { placement: "right" },
          },
        ],
        "viewTour": [
          {
            target: "#user-table-tab",
            content: "First, make sure you are on the User Table section.",
            params: { placement: "bottom" },
          },
          {
            target: "#view-action-btn",
            content: "Click Finish button to view user details.",
            params: { placement: "bottom" },
          },
          {
            target: "#save-btn-dailog",
            content: "Click this button to edit user details.",
            params: { placement: "right" },
          },
        ],
        "edit": [
          {
            target: "#user-table-tab",
            content: "First, make sure you are on the User Table section.",
            params: { placement: "bottom" },
          },
          {
            target: "#edit-action-btn",
            content: "Click Finish button to edit user details.",
            params: { placement: "bottom" },
          },
          {
            target: "#save-btn-dailog",
            content: "Click this button to edit user details.",
            params: { placement: "right" },
          },
        ],
        "delete": [
          {
            target: "#user-table-tab",
            content: "First, make sure you are on the User Table section.",
            params: { placement: "bottom" },
          },
          {
            target: "#delete-action-btn",
            content: "Click next button to open delete dailog.",
            params: { placement: "bottom" },
          },
          {
            target: "#delete-btn-dailog",
            content: "Click this button to delete a user.",
            params: {
              placement: "bottom",
            },
          },
        ],
        "excel": [
          {
            target: "#user-table-tab",
            content: "First, make sure you are on the User Table section.",
            params: { placement: "bottom" },
          },
          {
            target: "#excel-btn",
            content: "Click this button to download in Excel.",
            params: { placement: "bottom" },
          },
        ],
      },
    };
  },
methods: {
    async logout() {
      await this.$store.dispatch('auth/signOut');
      this.$router.push('/login');
    },
  },
computed: {
    ...mapGetters("roles", ["getCurrentUserRole"]),
    isAdmin() {
      return this.getCurrentUserRole === 'admin';
    },
    filteredDrawerItems() {
      return this.drawerItems.filter(item => {
        if (item.title === 'User Table') return this.isAdmin;
        return true;
      });
    },
    filteredToolbarItems() {
      return this.toolbarItems.filter(item => {
        if (item.title === 'User Table') return this.isAdmin;
        return true;
      });
    },
    contentClass() {
      return this.$vuetify.breakpoint.mdAndUp ? "ml-64" : "";
    },
  },
};
</script>

<style scoped>
.icon-tight {
  margin-right: 6px !important;
  min-width: 30px;
  display: flex;
  align-items: center;
}
.title-tight {
  margin-left: -6px;
}
</style>