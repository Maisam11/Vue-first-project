<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4">
          <v-card-title class="justify-center">Register</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
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
              <v-btn color="primary" type="submit" block>Register</v-btn>
              <v-btn color="secondary" to="/login" block class="mt-2">Login</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "RegisterComp",
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async handleRegister() {
      try {
        await this.$store.dispatch('auth/signUp', {
          username: this.username,
          password: this.password,
        });
        await this.$nextTick();
        if (this.$store.getters['auth/isAuthenticated']) {
          const redirect = this.$route.query.redirect || '/UserDashboard/Files';
          console.log('RegisterComp: Redirecting to', redirect);
          this.$router.push(redirect);
        } else {
          console.log('RegisterComp: Authentication state not updated');
        }
      } catch (error) {
        console.log('RegisterComp: Registration failed:', error.code, error.message);
      }
    },
  },
};
</script>