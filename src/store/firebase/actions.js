import { collection, doc, setDoc, deleteDoc, getDocs, getDoc, query, limit, startAt } from 'firebase/firestore';
import { DEFAULT_ACCOUNT_ID } from '@/firebase.js';
const getCollectionPath = (collectionPath) => {
  if (collectionPath.startsWith('accounts/')) {
    return collectionPath;
  }
  return `accounts/${DEFAULT_ACCOUNT_ID}/${collectionPath}`;
};

export default {
  async create({ state }, { collectionPath, id, data }) {
    const fullPath = getCollectionPath(collectionPath);
    await setDoc(doc(state.firebaseConnector, fullPath, id), data);
  },
  async update({ state }, { collectionPath, id, data }) {
    const fullPath = getCollectionPath(collectionPath);
    await setDoc(doc(state.firebaseConnector, fullPath, id), data, { merge: true });
  },
  async delete({ state }, { collectionPath, id }) {
    const fullPath = getCollectionPath(collectionPath);
    await deleteDoc(doc(state.firebaseConnector, fullPath, id));
  },
    async getAll({ state }, { collectionPath }) {
    const fullPath = getCollectionPath(collectionPath);
    const q = query(collection(state.firebaseConnector, fullPath));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  },
  async getById({ state }, { collectionPath, id }) {
    const fullPath = getCollectionPath(collectionPath);
    const docRef = doc(state.firebaseConnector, fullPath, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },
  async paginated({ state }, { collectionPath, page, limit: limitCount }) {
    const fullPath = getCollectionPath(collectionPath);
    const q = query(
      collection(state.firebaseConnector, fullPath),
      startAt((page - 1) * limitCount),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  },
};