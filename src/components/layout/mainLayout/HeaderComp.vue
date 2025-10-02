<template>
  <div class="header">
    <v-app-bar fixed color="rgba(255, 255, 255, 0.3)" style="backdrop-filter: blur(10px); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <v-toolbar-title>
        <h3>Phofix.</h3>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items class="custom-hide-menu">
        <v-btn text to="/">Home</v-btn>
        <v-btn text to="/RepairComp">Repair</v-btn>
        <v-btn text to="/WorksComp">Works</v-btn>
        <v-btn text to="/AboutComp">About</v-btn>
        <v-btn text to="/ServicesComp">Services</v-btn>
        <v-btn text to="/WhyUsComp">Why Us</v-btn>
        <v-btn text to="/FeedbackComp">Feedback</v-btn>
        <v-btn text to="/FAQComp">FAQ</v-btn>
        <v-btn text to="/BlogComp">Blog</v-btn>
        <!-- <v-btn text to="/UserPage">Users</v-btn> -->
        <v-btn text to="/VueStepper">Stepper</v-btn>
        <v-btn text to="/UserDashboard">View Dashboard</v-btn>
      </v-toolbar-items>

      <v-app-bar-nav-icon class="custom-show-hamburger" @click="toggleMenu"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary right fixed>
      <v-list>
        <v-list-item to="/">Home</v-list-item>
        <v-list-item to="/RepairComp">Repair</v-list-item>
        <v-list-item to="/WorksComp">How It Works</v-list-item>
        <v-list-item to="/AboutComp">About Us</v-list-item>
        <v-list-item to="/ServicesComp">Services</v-list-item>
        <v-list-item to="/WhyUsComp">Why Us</v-list-item>
        <v-list-item to="/FeedbackComp">Feedback</v-list-item>
        <v-list-item to="/FAQComp">FAQ</v-list-item>
        <v-list-item to="/BlogComp">Blog</v-list-item>
        <!-- <v-list-item to="/UserPage">Users</v-list-item> -->
        <v-list-item to="/VueStepper">Stepper</v-list-item>
        <v-list-item to="/UserDashboard">View Dashboard</v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
export default {
  name: "HeaderComp",
  data() {
    return {
      drawer: false,
    };
  },
  methods: {
    toggleMenu() {
      this.drawer = !this.drawer;
    },
  },
};
</script>

<style scoped>
.header {
  height: 57px;
}

.logo {
  cursor: pointer;
}

.logo h3 {
  font-size: 1.5rem;
}

.v-btn:hover {
  color: blue;
}

@media (max-width: 1024px) {
  .custom-hide-menu {
    display: none !important;
  }
  .custom-show-hamburger {
    display: block !important;
  }
}

@media (min-width: 1025px) {
  .custom-hide-menu {
    display: flex !important;
  }
  .custom-show-hamburger {
    display: none !important;
  }
}
</style>
