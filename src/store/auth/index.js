import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '../../firebase';

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
    async signUp({ commit }, { username, password }) {
      try {
        const email = `${username}@example.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = { uid: userCredential.user.uid, username };
        commit('SET_USER', user);
        console.log('signUp: User registered', user);
        return user;
      } catch (error) {
        console.log('signUp: Error:', error.code, error.message);
        throw error;
      }
    },
    async signIn({ commit }, { username, password }) {
      try {
        const email = `${username}@example.com`;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = { uid: userCredential.user.uid, username };
        commit('SET_USER', user);
        console.log('signIn: User logged in', user);
        return user;
      } catch (error) {
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
  },
  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
  },
};