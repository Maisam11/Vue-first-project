import { getAuth, createUserWithEmailAndPassword, } from 'firebase/auth';
import { adminAuth } from '@/firebase.js';
getAuth();
export default {
  async createUser({ dispatch }, { username, password, role }) {
    try {
      const email = `${username}@gmail.com`; 
      const userCredential = await createUserWithEmailAndPassword(adminAuth, email, password);
      const userId = userCredential.user.uid;

      await dispatch('setUserRole', { userId, role, username });
      console.log('createUser: User created successfully without affecting current session', username);

      await dispatch('fetchAllUsers');
      return { id: userId, username, role };
    } catch (error) {
      console.error('createUser: Error:', error.code, error.message);
      throw error;
    }
  },
  async fetchAllUsers({ commit, dispatch, rootGetters }) {
    try {
      const currentRole = rootGetters['roles/getCurrentUserRole'];
      const currentUser = rootGetters['auth/currentUser'];
      
      if (currentRole !== 'admin' && currentRole !== 'staff') {
        console.log('fetchAllUsers: Non-admin/staff user attempted to fetch all users');
        return [];
      }
      const users = await dispatch('firebase/getAll', { collectionPath: 'users' }, { root: true });
      if (currentRole === 'staff') {
        const filteredUsers = users.filter(user => 
          user.role === 'staff' && user.id !== currentUser?.uid
        );
        console.log('fetchAllUsers: Filtered staff users for sharing:', filteredUsers);
        commit('SET_ALL_USERS', filteredUsers);
        return filteredUsers;
      }
      console.log('fetchAllUsers: Fetched users from Firebase:', users);
      commit('SET_ALL_USERS', users);
      return users;
    } catch (error) {
      console.error('fetchAllUsers: Error:', error.code, error.message);
      return [];
    }
  },
  async setUserRole({ dispatch }, { userId, role, username, isDefault = false }) {
    try {
      const userDoc = {
        role,
        username,
        isDefault,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await dispatch('firebase/create', {
        collectionPath: 'users',
        id: userId,
        data: userDoc 
      }, { root: true });
      
      console.log('setUserRole: Role set to', role, 'for user', username);
    } catch (error) {
      console.error('setUserRole error:', error);
      throw error;
    }
  },
  async updateUserRole({ dispatch }, { userId, role }) {
    try {
      await dispatch('firebase/update', { 
        collectionPath: 'users', 
        id: userId, 
        data: { role, updatedAt: new Date().toISOString() } 
      }, { root: true });
      console.log('updateUserRole: Updated role for user', userId);

      await dispatch('fetchAllUsers');
    } catch (error) {
      console.error('updateUserRole error:', error);
      throw error;
    }
  },

  async deleteUser({ dispatch}, userId) {
    try {
      await dispatch('firebase/delete', { 
        collectionPath: 'users', 
        id: userId 
      }, { root: true });
      console.log('deleteUser: Deleted Firestore user doc', userId);

      await dispatch('fetchAllUsers');
    } catch (error) {
      console.error('deleteUser error:', error);
      throw error;
    }
  },
  async fetchUserRole({ commit, dispatch, rootGetters }) {
    try {
      const currentUser = rootGetters['auth/currentUser'];
      if (!currentUser || !currentUser.uid) {
        console.log('fetchUserRole: Skipping - currentUser or uid undefined');
        return null;
      }
      const userDoc = await dispatch('firebase/getById', { 
        collectionPath: 'users', 
        id: currentUser.uid 
      }, { root: true });
      if (userDoc) {
        console.log('fetchUserRole: User document from Firestore:', userDoc);
        commit('SET_CURRENT_USER_ROLE', userDoc.role);
        console.log('fetchUserRole: Role set to', userDoc.role);
        return userDoc.role;
      } else {
        console.log('fetchUserRole: No user doc found');
 
        await dispatch('setUserRole', { 
          userId: currentUser.uid, 
          role: 'staff', 
          username: currentUser.username 
        });
        return 'staff';
      }
    } catch (error) {
      console.error('fetchUserRole error:', error);
      return null;
    }
  }
};