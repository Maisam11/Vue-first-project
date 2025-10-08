<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4">
          <v-card-title class="justify-center">Login</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="Username"
                outlined
                dense
                required
                class="mb-2"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                outlined
                dense
                required
                class="mb-2"
              ></v-text-field>
              <v-btn color="primary" type="submit" block>Login</v-btn>
              <v-btn color="secondary" to="/register" block class="mt-2">Register</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "LoginComp",
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async handleLogin() {
      try {
        await this.$store.dispatch('auth/signIn', {
          username: this.username,
          password: this.password,
        });
        await this.$nextTick();
        if (this.$store.getters['auth/isAuthenticated']) {
          const redirect = this.$route.query.redirect || '/UserDashboard/Files';
          console.log('LoginComp: Redirecting to', redirect);
          this.$router.push(redirect);
        } else {
          console.log('LoginComp: Authentication state not updated');
        }
      } catch (error) {
        console.log('LoginComp: Login failed:', error.code, error.message);
      }
    },
  },
};
</script>