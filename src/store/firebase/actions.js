import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, getDoc, query, limit, startAt } from 'firebase/firestore';

export default {
  startSync({ commit, state }) {
    const filesCol = collection(state.firebaseConnector, state.currentModule.fullId);
    return onSnapshot(filesCol, async (snapshot) => {
      const files = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const sheetsCol = collection(state.firebaseConnector, state.currentModule.fullId, docSnap.id, 'sheets');
        const sheetsSnap = await getDocs(sheetsCol);
        const sheets = sheetsSnap.docs.map(sheetDoc => ({
          name: sheetDoc.id,
          ...sheetDoc.data()
        }));
        return {
          id: docSnap.id,
          ...docSnap.data(),
          sheets
        };
      }));
      commit('SET_MODULE_DATA', { module: state.currentModule.moduleName, data: files });
    }, (error) => {
      console.error(`[Firestore] Error fetching files from ${state.currentModule.fullId}:`, error);
    });
  },
  async get({ commit, state }) {
    const q = query(collection(state.firebaseConnector, state.currentModule.fullId));
    const querySnapshot = await getDocs(q);
    const files = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
      const sheetsCol = collection(state.firebaseConnector, state.currentModule.fullId, docSnap.id, 'sheets');
      const sheetsSnap = await getDocs(sheetsCol);
      const sheets = sheetsSnap.docs.map(sheetDoc => ({
        name: sheetDoc.id,
        ...sheetDoc.data()
      }));
      return {
        id: docSnap.id,
        ...docSnap.data(),
        sheets
      };
    }));
    commit('SET_MODULE_DATA', { module: state.currentModule.moduleName, data: files });
    return files;
  },
  async getById({ state }, { id }) {
    const docRef = doc(state.firebaseConnector, state.currentModule.fullId, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const sheetsCol = collection(state.firebaseConnector, state.currentModule.fullId, id, 'sheets');
    const sheetsSnap = await getDocs(sheetsCol);
    const sheets = sheetsSnap.docs.map(sheetDoc => ({
      name: sheetDoc.id,
      ...sheetDoc.data()
    }));
    return { id: docSnap.id, ...docSnap.data(), sheets };
  },
  async create({ commit, state }, { data }) {
    if (!data.id) {
      throw new Error("File ID must be provided");
    }
    const sheetNames = data.sheets ? data.sheets.map(sheet => sheet.name) : [];
    const fileData = { 
      name: data.name, 
      createdAt: data.createdAt, 
      updatedAt: data.updatedAt, 
      addedBy: data.addedBy,
      sheetNames: sheetNames
    };
    console.log(`[Firestore] Adding file: ${data.name} with metadata:`, fileData);
    await setDoc(doc(state.firebaseConnector, state.currentModule.fullId, data.id), fileData);
    if (data.sheets && data.sheets.length > 0) {
      for (const sheet of data.sheets) {
        console.log(`[Firestore] Adding sheet: ${sheet.name} to file: ${data.name}`);
        await setDoc(doc(state.firebaseConnector, state.currentModule.fullId, data.id, 'sheets', sheet.name), {
          createdAt: sheet.createdAt || new Date().toISOString(),
          updatedAt: sheet.updatedAt || new Date().toISOString(),
          data: sheet.data || []
        });
      }
    }
    commit('ADD_MODULE_ITEM', { module: state.currentModule.moduleName, item: { id: data.id, ...fileData, sheets: data.sheets || [] } });
  },
  async update({ commit, state }, { id, data }) {
    const sheetNames = data.sheets ? data.sheets.map(sheet => sheet.name) : [];
    const fileData = { 
      name: data.name, 
      createdAt: data.createdAt, 
      updatedAt: data.updatedAt, 
      addedBy: data.addedBy,
      sheetNames: sheetNames
    };
    console.log(`[Firestore] Updating file: ${data.name}`);
    await setDoc(doc(state.firebaseConnector, state.currentModule.fullId, id), fileData, { merge: true });
    if (data.sheets) {
      const sheetsCol = collection(state.firebaseConnector, state.currentModule.fullId, id, 'sheets');
      const sheetsSnap = await getDocs(sheetsCol);
      for (const sheetDoc of sheetsSnap.docs) {
        console.log(`[Firestore] Deleting sheet: ${sheetDoc.id} from file: ${data.name}`);
        await deleteDoc(doc(state.firebaseConnector, state.currentModule.fullId, id, 'sheets', sheetDoc.id));
      }
      for (const sheet of data.sheets) {
        console.log(`[Firestore] Adding/Updating sheet: ${sheet.name} to file: ${data.name}`);
        await setDoc(doc(state.firebaseConnector, state.currentModule.fullId, id, 'sheets', sheet.name), {
          createdAt: sheet.createdAt || new Date().toISOString(),
          updatedAt: sheet.updatedAt || new Date().toISOString(),
          data: sheet.data || []
        });
      }
    }
    commit('UPDATE_MODULE_ITEM', { module: state.currentModule.moduleName, id, data: { id, ...fileData, sheets: data.sheets || [] } });
  },
  async remove({ commit, state }, { id }) {
    const sheetsCol = collection(state.firebaseConnector, state.currentModule.fullId, id, 'sheets');
    const sheetsSnap = await getDocs(sheetsCol);
    for (const sheetDoc of sheetsSnap.docs) {
      console.log(`[Firestore] Deleting sheet: ${sheetDoc.id} from file: ${id}`);
      await deleteDoc(doc(state.firebaseConnector, state.currentModule.fullId, id, 'sheets', sheetDoc.id));
    }
    console.log(`[Firestore] Deleting file: ${id}`);
    await deleteDoc(doc(state.firebaseConnector, state.currentModule.fullId, id));
    commit('DELETE_MODULE_ITEM', { module: state.currentModule.moduleName, id });
  },
  async getPaginated({ state }, { page, limit: limitCount }) {
    const q = query(
      collection(state.firebaseConnector, state.currentModule.fullId),
      startAt((page - 1) * limitCount),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const files = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
      const sheetsCol = collection(state.firebaseConnector, state.currentModule.fullId, docSnap.id, 'sheets');
      const sheetsSnap = await getDocs(sheetsCol);
      const sheets = sheetsSnap.docs.map(sheetDoc => ({
        name: sheetDoc.id,
        ...sheetDoc.data()
      }));
      return {
        id: docSnap.id,
        ...docSnap.data(),
        sheets
      };
    }));
    return files;
  },
};