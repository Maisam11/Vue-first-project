import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import state from './state';
import mutations from './mutations';
import actions from './actions';
import createPersistedState from 'vuex-persistedstate';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

Vue.use(Vuex);

const createModuleId = (accountId, moduleName) => {
  return `${accountId}-${moduleName}`;
};

const CURRENT_MODULE = {
  accountId: '78910',
  moduleName: 'files',
  fullId: createModuleId('78910', 'files')
};

const firebaseSyncPlugin = (store) => {
  let isSyncing = false;

  const filesCol = collection(db, CURRENT_MODULE.fullId);
  onSnapshot(filesCol, (snapshot) => {
    const files = [];
    snapshot.docs.forEach((docSnap) => {
      const fileData = { id: docSnap.id, ...docSnap.data() };
      fileData.sheets = docSnap.data().sheets || [];
      files.push(fileData);
    });
    
    // Only update if files are different
    const currentFiles = store.state.files;
    const filesChanged = JSON.stringify(files) !== JSON.stringify(currentFiles);
    
    if (filesChanged) {
      isSyncing = true;
      store.commit('SET_FILES', files);
      isSyncing = false;
    }
  }, (error) => {
    console.error(`[Firestore] Error fetching files from ${CURRENT_MODULE.fullId}:`, error);
  });

  store.subscribe((mutation) => {
    if (isSyncing) {
      console.log(`[Firestore] Skipped sync for ${mutation.type} as it was triggered by Firestore`);
      return;
    }

    if (['ADD_FILE', 'UPDATE_FILE', 'DELETE_FILE'].includes(mutation.type)) {
      switch (mutation.type) {
        case 'ADD_FILE':
        case 'UPDATE_FILE': {
          const file = mutation.payload;
          const fileId = file.id;
          const fileData = { ...file };
          delete fileData.id;
          
          // Store file metadata in module collection
          setDoc(doc(db, CURRENT_MODULE.fullId, fileId), fileData).catch((error) => {
            console.error(`[Firestore] Failed to set file ${fileId} in ${CURRENT_MODULE.fullId}:`, error);
          });
          break;
        }
        case 'DELETE_FILE': {
          const fileId = mutation.payload;
          
          // Delete file metadata from module collection
          deleteDoc(doc(db, CURRENT_MODULE.fullId, fileId)).catch((error) => {
            console.error(`[Firestore] Failed to delete file ${fileId} from ${CURRENT_MODULE.fullId}:`, error);
          });
          
          // Delete all sheet data in the subcollection
          const sheetsCol = collection(db, CURRENT_MODULE.fullId, fileId, 'sheets');
          getDocs(sheetsCol).then((snapshot) => {
            snapshot.docs.forEach((d) => {
              deleteDoc(doc(db, CURRENT_MODULE.fullId, fileId, 'sheets', d.id)).catch((error) => {
                console.error(`[Firestore] Failed to delete sheet data ${d.id}:`, error);
              });
            });
          }).catch((error) => {
            console.error(`[Firestore] Failed to fetch sheet data for deletion:`, error);
          });
          break;
        }
      }
    }
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

// Export the module system for use in components
export { createModuleId, CURRENT_MODULE };