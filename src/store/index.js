import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import filesModule from './files';
import firebaseModule from './firebase';
import usersModule from './users';
import excelModule from './excel';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    files: filesModule,
    firebase: firebaseModule,
    users: usersModule,
    excel: excelModule,
  },
  plugins: [
    createPersistedState({
      key: 'my-app',
      paths: ['users', 'excel', 'files'],
    }),
  ],
});