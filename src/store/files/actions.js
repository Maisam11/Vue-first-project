import { collection, query, where, getDocs } from 'firebase/firestore';
const collectionPath = '78910-files';
const subCollectionPath = 'sheets';

export default {
  async fetchFiles({ commit, dispatch, rootGetters }) {
    try {
      const currentRole = rootGetters['roles/getCurrentUserRole'];
      const currentUser = rootGetters['auth/currentUser'];
      console.log('fetchFiles: Current user:', currentUser);
      console.log('fetchFiles: Current role:', currentRole);
      let filesResponse = [];
      if (currentRole === 'admin') {
        console.log('fetchFiles: Admin user, fetching all files');
        filesResponse = await dispatch('firebase/getAll', { collectionPath }, { root: true });
      } else if (currentRole === 'staff') {
        console.log('fetchFiles: Staff user, fetching accessible files');
        const db = rootGetters['firebase/firebaseConnector'];
        const colRef = collection(db, collectionPath);

        const q1 = query(colRef, where('addedBy', '==', currentUser.username));
        const snap1 = await getDocs(q1);
        const ownFiles = snap1.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('fetchFiles: Own files:', ownFiles.length);

        const q2 = query(colRef, where('sharedWith', 'array-contains', currentUser.uid));
        const snap2 = await getDocs(q2);
        const sharedFiles = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('fetchFiles: Shared files (old):', sharedFiles.length);

        const q3 = query(colRef, where('editors', 'array-contains', currentUser.uid));
        const snap3 = await getDocs(q3);
        const editedFiles = snap3.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('fetchFiles: Edited files:', editedFiles.length);

        const q4 = query(colRef, where('viewers', 'array-contains', currentUser.uid));
        const snap4 = await getDocs(q4);
        const viewedFiles = snap4.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('fetchFiles: Viewed files:', viewedFiles.length);
        filesResponse = [...ownFiles, ...sharedFiles, ...editedFiles, ...viewedFiles];

        filesResponse = filesResponse.filter((file, index, self) => 
          index === self.findIndex((f) => f.id === file.id)
        );
        console.log('fetchFiles staff: Total accessible files:', filesResponse.length);
      } else {
        console.log('fetchFiles: No access for role:', currentRole);
        return [];
      }
      console.log('fetchFiles response:', filesResponse.length, 'files');

      const filesWithSheets = await Promise.all(filesResponse.map(async (file) => {
        try {
          const sheets = await dispatch('getSheets', { fileId: file.id });
          return {
            ...file,
            sheets: sheets.map(s => ({ name: s.id, ...s }))
          };
        } catch (sheetError) {
          console.error(`Error fetching sheets for file ${file.id}:`, sheetError);
          return { ...file, sheets: [] };
        }
      }));
      commit('SET_FILES', filesWithSheets);
      commit('SET_FILTERED_FILES', filesWithSheets);
      return filesWithSheets;
    } catch (error) {
      console.error('fetchFiles: Error:', error.code, error.message);
      console.error('fetchFiles: Error details:', error);
      throw error;
    }
  },
  async addFile({ commit, dispatch, state, rootGetters }, file) {
    if (!file.id) throw new Error('File ID must be provided');
    if (state.files.some(f => f.id === file.id)) throw new Error('File with this ID already exists');
    const currentUser = rootGetters['auth/currentUser'];
    try {
      const fileData = {
        name: file.name,
        createdAt: file.createdAt || new Date().toISOString(),
        updatedAt: file.updatedAt || new Date().toISOString(),
        addedBy: file.addedBy || currentUser?.username || 'Unknown',
        sharedWith: file.viewers || [],
        editors: [currentUser?.uid, ...(file.editors || [])].filter(Boolean),
        viewers: file.viewers || [],
        sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : []
      };
      console.log('addFile: Creating file with data:', fileData);
      await dispatch('firebase/create', { collectionPath, id: file.id, data: fileData }, { root: true });
      if (file.sheets && file.sheets.length > 0) {
        for (const sheet of file.sheets) {
          const sheetData = {
            createdAt: sheet.createdAt || new Date().toISOString(),
            updatedAt: sheet.updatedAt || new Date().toISOString(),
            data: sheet.data || []
          };
          await dispatch('setSheet', { fileId: file.id, sheetName: sheet.name, data: sheetData });
        }
      }
      const newFile = { ...file, ...fileData };
      commit('ADD_FILE', newFile);
      return newFile;
    } catch (error) {
      console.error('addFile: Error:', error.code, error.message);
      console.error('addFile: Error details:', error);
      throw error;
    }
  },
  async updateFile({ commit, dispatch }, file) {
    try {
      const currentUser = this.$store?.getters['auth/currentUser'];
      const fileData = {
        name: file.name,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt || new Date().toISOString(),
        addedBy: file.addedBy,
        sharedWith: file.viewers || [],
        editors: file.addedBy === currentUser?.username ? 
          [currentUser?.uid, ...(file.editors || [])].filter(Boolean) : 
          file.editors || [],
        viewers: file.viewers || [],
        sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : []
      };
      console.log('updateFile: Updating file with data:', fileData);
      
      await dispatch('firebase/update', { collectionPath, id: file.id, data: fileData }, { root: true });
   
      const existingSheetNames = fileData.sheetNames || [];
      for (const sheetName of existingSheetNames) {
        await dispatch('deleteSheet', { fileId: file.id, sheetName });
      }
      if (file.sheets && file.sheets.length > 0) {
        for (const sheet of file.sheets) {
          const sheetData = {
            createdAt: sheet.createdAt || new Date().toISOString(),
            updatedAt: sheet.updatedAt || new Date().toISOString(),
            data: sheet.data || []
          };
          await dispatch('setSheet', { fileId: file.id, sheetName: sheet.name, data: sheetData });
        }
      }
      commit('UPDATE_FILE', { ...file, ...fileData });
      return { ...file, ...fileData };
    } catch (error) {
      console.error('updateFile: Error:', error.code, error.message);
      console.error('updateFile: Error details:', error);
      throw error;
    }
  },
  async deleteFile({ commit, dispatch, state }, fileId) {
    try {
      const file = state.files.find(f => f.id === fileId);
      const existingSheetNames = file && file.sheetNames ? file.sheetNames : [];
      for (const sheetName of existingSheetNames) {
        await dispatch('deleteSheet', { fileId, sheetName });
      }
      await dispatch('firebase/delete', { collectionPath, id: fileId }, { root: true });
      commit('DELETE_FILE', fileId);
      return fileId;
    } catch (error) {
      console.error('deleteFile: Error:', error.code, error.message);
      throw error;
    }
  },
  async getFileById({ dispatch, rootGetters }, id) {
    try {
      const currentRole = rootGetters['roles/getCurrentUserRole'];
      const currentUser = rootGetters['auth/currentUser'];
      console.log('getFileById: Fetching file', id, 'for user', currentUser);

      const fileDataResponse = await dispatch('firebase/getById', { collectionPath, id }, { root: true });
      if (!fileDataResponse) {
        console.log('getFileById: File not found');
        return null;
      }
      console.log('getFileById: File data:', fileDataResponse);

      const hasAccess = currentRole === 'admin' || 
        fileDataResponse.addedBy === currentUser?.username || 
        (fileDataResponse.sharedWith || []).includes(currentUser?.uid) ||
        (fileDataResponse.editors || []).includes(currentUser?.uid) ||
        (fileDataResponse.viewers || []).includes(currentUser?.uid);
      console.log('getFileById: User has access:', hasAccess);
      if (!hasAccess) {
        throw new Error('You do not have permission to access this file');
      }
      console.log('getFileById response:', fileDataResponse);
      const sheets = await dispatch('getSheets', { fileId: id });
      const fileWithSheets = { ...fileDataResponse, sheets: sheets.map(s => ({ name: s.id, ...s })) };
      return fileWithSheets;
    } catch (error) {
      console.error('getFileById: Error:', error.code, error.message);
      console.error('getFileById: Error details:', error);
      throw error;
    }
  },
  async getSheets({ dispatch }, { fileId }) {
    try {
      const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
      const sheetsResponse = await dispatch('firebase/getAll', { collectionPath: sheetsPath }, { root: true });
      return sheetsResponse;
    } catch (error) {
      console.error('getSheets: Error:', error.code, error.message);
      return [];
    }
  },
  async setSheet({ dispatch }, { fileId, sheetName, data }) {
    try {
      const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
      await dispatch('firebase/create', { collectionPath: sheetsPath, id: sheetName, data }, { root: true });
      return { name: sheetName, ...data };
    } catch (error) {
      console.error('setSheet: Error:', error.code, error.message);
      throw error;
    }
  },
  async deleteSheet({ dispatch }, { fileId, sheetName }) {
    try {
      const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
      await dispatch('firebase/delete', { collectionPath: sheetsPath, id: sheetName }, { root: true });
      return sheetName;
    } catch (error) {
      console.error('deleteSheet: Error:', error.code, error.message);
      throw error;
    }
  },
};