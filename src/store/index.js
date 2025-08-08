import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import state from './state';
import mutations from './mutations';
import actions from './actions';
import createPersistedState from 'vuex-persistedstate';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const isEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

Vue.use(Vuex);

const firebaseSyncPlugin = (store) => {
  let isSyncing = false;

  const paths = ['customData', 'steps', 'files'];

  paths.forEach((path) => {
    const docRef = doc(collection(db, path), 'data');
    onSnapshot(docRef, (snapshot) => {
      let data = snapshot.exists() ? snapshot.data().value : null;
      console.log(`[Firestore] Received data for ${path}:`, data);
      if (path === 'customData') {
        data = data ? Object.values(data) : [[]];
      } else if (path === 'files') {
        data = data || [];
      }
      const mutationName = path === 'customData' ? 'SET_CUSTOM_DATA' : `SET_${path.toUpperCase()}`;
      if (!isEqual(data, store.state[path])) {
        isSyncing = true;
        store.commit(mutationName, data);
        console.log(`[Firestore] Committed ${mutationName} with data:`, data);
        isSyncing = false;
      } else {
        console.log(`[Firestore] Skipped ${mutationName} as data is unchanged`);
      }
    }, (error) => {
      console.error(`[Firestore] Error fetching ${path}:`, error);
    });
  });

  store.subscribe((mutation, state) => {
    if (isSyncing) {
      console.log(`[Firestore] Skipped sync for ${mutation.type} as it was triggered by Firestore`);
      return;
    }

    paths.forEach((path) => {
      const currentState = state[path];
      const previousState = store._state?.data?.[path] || null;

      const mutationTriggers = {
        customData: ['SET_CUSTOM_DATA'],
        steps: ['SET_STEPS'],
        files: ['ADD_FILE', 'UPDATE_FILE', 'DELETE_FILE'],
      };

      if (mutationTriggers[path]?.includes(mutation.type) || !isEqual(currentState, previousState)) {
        const docRef = doc(collection(db, path), 'data');
        let dataToSync = JSON.parse(JSON.stringify(currentState));
        if (path === 'customData') {
          dataToSync = Object.fromEntries(dataToSync.map((sheet, index) => [index, sheet || []]));
        }
        console.log(`[Firestore] Syncing ${path} to Firestore:`, dataToSync);
        setDoc(docRef, { value: dataToSync }).catch((error) => {
          console.error(`[Firestore] Failed to sync ${path}:`, error);
        });
      } else {
        console.log(`[Firestore] Skipped syncing ${path} as state is unchanged`);
      }
    });
  });
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  plugins: [
    createPersistedState({
      key: 'my-app',
      paths: ['users', 'formSubmissions', 'customData', 'customColumns', 'steps', 'selectedRows', 'combinedUsers', 'files'],
    }),
    firebaseSyncPlugin,
  ],
});