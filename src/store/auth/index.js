import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from '../../firebase';

export default {
  namespaced: true,
  state: {
    user: null,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
  },
  actions: {
    async signIn({ commit, dispatch }, { username, password }) {
      const email = `${username}@gmail.com`;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = { uid: userCredential.user.uid, username };
        commit('SET_USER', user);
        console.log('signIn: User logged in', user);
        await dispatch('roles/fetchUserRole', user.uid, { root: true });
        
        return user;
      } catch (error) {

        if (username === 'admin' && error.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, email, 'admin123');
            if (password !== 'admin123') {
              throw new Error('Default admin password is "admin123"');
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = { uid: userCredential.user.uid, username };
            commit('SET_USER', user);

            await dispatch('roles/setUserRole', { 
              userId: user.uid, 
              role: 'admin', 
              username,
              isDefault: true 
            }, { root: true });
            console.log('signIn: Default admin AUTO-CREATED & logged in!');
            return user;
          } catch (createError) {
            if (createError.code === 'auth/email-already-in-use') {
              throw error;
            }
            console.error('Auto-create failed:', createError);
            throw createError;
          }
        }
        console.log('signIn: Error:', error.code, error.message);
        throw error;
      }
    },
    async signOut({ commit }) {
      try {
        await signOut(auth);
        commit('SET_USER', null);
        console.log('signOut: User logged out');
      } catch (error) {
        console.log('signOut: Error:', error.code, error.message);
        throw error;
      }
    },
    async resetPassword(_, { username }) {
      try {
        const email = `${username}@gmail.com`;
        await sendPasswordResetEmail(auth, email);
        console.log('resetPassword: Password reset email sent to', email);
        return { success: true, message: `Password reset email sent to ${email}. Please check your inbox.` };
      } catch (error) {
        console.log('resetPassword: Error:', error.code, error.message);
        throw new Error(error.message);
      }
    },
  },
  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
  },
};