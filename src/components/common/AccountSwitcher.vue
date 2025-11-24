<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn text dark v-bind="attrs" v-on="on" class="ml-2">
        <v-icon left>mdi-account-switch</v-icon>
        Account: {{ currentAccountId }}
      </v-btn>
    </template>
    <v-list>
      <v-list-item 
        v-for="account in availableAccounts" 
        :key="account.id"
        @click="switchAccount(account.id)"
        :class="{ 'active-account': account.id === currentAccountId }"
      >
        <v-list-item-icon>
          <v-icon>mdi-account</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ account.name }}</v-list-item-title>
          <v-list-item-subtitle>ID: {{ account.id }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { switchAccount, getCurrentAccountId } from '@/firebase.js';
import { mapActions } from 'vuex';

export default {
  name: 'AccountSwitcher',
  data() {
    return {
      availableAccounts: [
        { id: '12345', name: 'Main Account' },
        { id: '67890', name: 'Secondary Account' },
        // Add more accounts as needed
      ]
    };
  },
  computed: {
    currentAccountId() {
      return getCurrentAccountId();
    }
  },
  methods: {
    ...mapActions('files', ['fetchFiles']),
    ...mapActions('roles', ['fetchAllUsers']),
    async switchAccount(accountId) {
      try {
        switchAccount(accountId);
        
        // Refresh data for the new account
        await this.fetchFiles();
        if (this.$store.getters['roles/getCurrentUserRole'] === 'admin') {
          await this.fetchAllUsers();
        }
        
        this.$toast.success(`Switched to account: ${accountId}`);
      } catch (error) {
        console.error('Error switching account:', error);
        this.$toast.error('Failed to switch account');
      }
    }
  }
};
</script>

<style scoped>
.active-account {
  background-color: #e3f2fd;
}
</style>