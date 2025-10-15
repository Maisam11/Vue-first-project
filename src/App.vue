<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import { auth, onAuthStateChanged } from './firebase';

export default {
  name: "App",
  created() {
    onAuthStateChanged(auth, async user => {
      if (user) {
        const username = user.email.split('@')[0];
        this.$store.commit('auth/SET_USER', { uid: user.uid, username });
        console.log('App: User authenticated', { uid: user.uid, username });
        try {
          await this.$store.dispatch('roles/fetchUserRole', user.uid);
          const currentRole = this.$store.getters['roles/getCurrentUserRole'];
          console.log('App: User role fetched:', currentRole);
        } catch (error) {
          console.log('App: Error fetching user role:', error.message);
        }
      } else {
        this.$store.commit('auth/SET_USER', null);
        this.$store.commit('roles/SET_CURRENT_USER_ROLE', null);
        console.log('App: No user authenticated');
      }
    }, error => {
      console.log('App: Auth state change error:', error.message);
    });
  },
};
</script>

<style scoped>
* {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>