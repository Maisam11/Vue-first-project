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
              <v-btn color="primary" text block class="mt-2" @click="showResetPasswordDialog = true">Forgot Password?</v-btn>
            </v-form>
            <v-alert
              v-if="resetMessage"
              :type="resetMessageType"
              class="mt-4"
              dismissible
              @input="resetMessage = null"
            >
              {{ resetMessage }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="showResetPasswordDialog" max-width="400px">
      <v-card>
        <v-card-title class="justify-center">Reset Password</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleResetPassword">
            <v-text-field
              v-model="resetUsername"
              label="Username"
              outlined
              dense
              required
              :rules="[v => !!v || 'Username is required']"
              class="mb-2"
              ref="resetUsernameInput"
            ></v-text-field>
            <v-btn color="primary" type="submit" block>Send Reset Email</v-btn>
            <v-btn color="secondary" text block class="mt-2" @click="showResetPasswordDialog = false">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "LoginComp",
  data() {
    return {
      username: '',
      password: '',
      resetUsername: '',
      showResetPasswordDialog: false,
      resetMessage: null,
      resetMessageType: 'success',
    };
  },
  methods: {
    ...mapActions("auth", ["signIn", "resetPassword"]),
    ...mapActions("roles", ["fetchUserRole"]),
    async handleLogin() {
      try {
        const user = await this.signIn({
          username: this.username,
          password: this.password,
        });
        if (user && user.uid) {
          await this.fetchUserRole(user.uid);
        }
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
    async handleResetPassword() {
      try {
        const result = await this.resetPassword({
          username: this.resetUsername,
        });
        this.resetMessage = result.message;
        this.resetMessageType = 'success';
        this.showResetPasswordDialog = false;
        this.resetUsername = '';
      } catch (error) {
        this.resetMessage = `Failed to send password reset email: ${error.message}`;
        this.resetMessageType = 'error';
      }
    },
    focusResetInput() {
      this.$nextTick(() => {
        if (this.$refs.resetUsernameInput) {
          this.$refs.resetUsernameInput.focus();
        }
      });
    },
  },
  watch: {
    showResetPasswordDialog(newVal) {
      if (newVal) {
        this.resetMessage = null;
        this.focusResetInput();
      }
    },
  },
};
</script>