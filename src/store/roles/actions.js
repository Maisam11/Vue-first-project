export default {
  async setUserRole({ commit, dispatch }, { userId, role }) {
    try {
      await dispatch('firebase/create', {
        collectionPath: 'users',
        id: userId,
        data: {
          role: role,
          updatedAt: new Date().toISOString()
        }
      }, { root: true });
      
      commit('SET_CURRENT_USER_ROLE', role);
      console.log('setUserRole: Role set to', role);
    } catch (error) {
      console.error('Error setting user role:', error);
      throw error;
    }
  },

  async fetchUserRole({ commit, dispatch }, userId) {
    try {
      const userDoc = await dispatch('firebase/getById', {
        collectionPath: 'users',
        id: userId
      }, { root: true });
      
      console.log('fetchUserRole: User document from Firestore:', userDoc);
      
      const role = userDoc?.role || 'user';
      commit('SET_CURRENT_USER_ROLE', role);
      console.log('fetchUserRole: Role set to', role);
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      commit('SET_CURRENT_USER_ROLE', 'user');
      return 'user';
    }
  },
};