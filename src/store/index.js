import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import filesModule from './files';
import firebaseModule from './firebase';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    files: filesModule,
    firebase: firebaseModule,
  },
  plugins: [
    createPersistedState({
      key: 'my-app',
      paths: ['users', 'formSubmissions', 'customData', 'customColumns', 'steps', 'selectedRows', 'combinedUsers', 'files'],
    }),
  ],
});