import { collection, doc, setDoc, deleteDoc, getDocs, getDoc, query, limit, startAt } from 'firebase/firestore';

export default {
  async create({ state }, { collectionPath, id, data }) {
    await setDoc(doc(state.firebaseConnector, collectionPath, id), data);
  },
  async update({ state }, { collectionPath, id, data }) {
    await setDoc(doc(state.firebaseConnector, collectionPath, id), data, { merge: true });
  },
  async delete({ state }, { collectionPath, id }) {
      await deleteDoc(doc(state.firebaseConnector, collectionPath, id));
  },
    async getAll({ state }, { collectionPath }) {
    const q = query(collection(state.firebaseConnector, collectionPath));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  },
  async getById({ state }, { collectionPath, id }) {
    const docRef = doc(state.firebaseConnector, collectionPath, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },
  async paginated({ state }, { collectionPath, page, limit: limitCount }) {
    const q = query(
      collection(state.firebaseConnector, collectionPath),
      startAt((page - 1) * limitCount),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  },
};