import { auth } from '../../firebase';
const collectionPath = '78910-files';
const subCollectionPath = 'sheets';

export default {
  async fetchFiles({ commit, dispatch, rootGetters }) {
    if (!rootGetters['auth/isAuthenticated']) {
      console.log('fetchFiles: User not authenticated, skipping data retrieval');
      return [];
    }
    try {
      const token = await auth.currentUser.getIdToken();
      console.log('fetchFiles: Token validated', token.slice(0, 10) + '...');
      const filesResponse = await dispatch('firebase/getAll', { collectionPath }, { root: true });
      console.log('fetchFiles response:', filesResponse);
      const filesWithSheets = await Promise.all(filesResponse.map(async (file) => {
        const sheets = await dispatch('getSheets', { fileId: file.id });
        return {
          ...file,
          sheets: sheets.map(s => ({ name: s.id, ...s }))
        };
      }));
      commit('SET_FILES', filesWithSheets);
      commit('SET_FILTERED_FILES', filesWithSheets);
      return filesWithSheets;
    } catch (error) {
      console.log('fetchFiles: Error:', error.code, error.message);
      throw error;
    }
  },
  async addFile({ commit, dispatch, state, rootGetters }, file) {
    if (!rootGetters['auth/isAuthenticated']) {
      console.log('addFile: User not authenticated, cannot add file');
      throw new Error('User not authenticated');
    }
    if (!file.id) throw new Error('File ID must be provided');
    if (state.files.some(f => f.id === file.id)) throw new Error('File with this ID already exists');
    try {
      const token = await auth.currentUser.getIdToken();
      console.log('addFile: Token validated', token.slice(0, 10) + '...');
      const fileData = {
        name: file.name,
        createdAt: file.createdAt || new Date().toISOString(),
        updatedAt: file.updatedAt || new Date().toISOString(),
        addedBy: rootGetters['auth/currentUser']?.username || 'Unknown',
        sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : []
      };
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
      commit('ADD_FILE', file);
      return file;
    } catch (error) {
      console.log('addFile: Error:', error.code, error.message);
      throw error;
    }
  },
  async updateFile({ commit, dispatch, rootGetters }, file) {
    if (!rootGetters['auth/isAuthenticated']) {
      console.log('updateFile: User not authenticated, cannot update file');
      throw new Error('User not authenticated');
    }
    try {
      const token = await auth.currentUser.getIdToken();
      console.log('updateFile: Token validated', token.slice(0, 10) + '...');
      const fileData = {
        name: file.name,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt || new Date().toISOString(),
        addedBy: file.addedBy,
        sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : []
      };
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
      commit('UPDATE_FILE', file);
      return file;
    } catch (error) {
      console.log('updateFile: Error:', error.code, error.message);
      throw error;
    }
  },
  async deleteFile({ commit, dispatch, state, rootGetters }, fileId) {
    if (!rootGetters['auth/isAuthenticated']) {
      console.log('deleteFile: User not authenticated, cannot delete file');
      throw new Error('User not authenticated');
    }
    try {
      const token = await auth.currentUser.getIdToken();
      console.log('deleteFile: Token validated', token.slice(0, 10) + '...');
      const file = state.files.find(f => f.id === fileId);
      const existingSheetNames = file && file.sheetNames ? file.sheetNames : [];
      for (const sheetName of existingSheetNames) {
        await dispatch('deleteSheet', { fileId, sheetName });
      }
      await dispatch('firebase/delete', { collectionPath, id: fileId }, { root: true });
      commit('DELETE_FILE', fileId);
      return fileId;
    } catch (error) {
      console.log('deleteFile: Error:', error.code, error.message);
      throw error;
    }
  },
  async getFileById({ dispatch, rootGetters }, id) {
    if (!rootGetters['auth/isAuthenticated']) {
      console.log('getFileById: User not authenticated, skipping data retrieval');
      return null;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      console.log('getFileById: Token validated', token.slice(0, 10) + '...');
      const fileDataResponse = await dispatch('firebase/getById', { collectionPath, id }, { root: true });
      console.log('getFileById response:', fileDataResponse);
      if (!fileDataResponse) return null;
      const sheets = await dispatch('getSheets', { fileId: id });
      const fileWithSheets = { ...fileDataResponse, sheets: sheets.map(s => ({ name: s.id, ...s })) };
      return fileWithSheets;
    } catch (error) {
      console.log('getFileById: Error:', error.code, error.message);
      throw error;
    }
  },
  async getSheets({ dispatch}, { fileId }) {
    try {
      const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
      const sheetsResponse = await dispatch('firebase/getAll', { collectionPath: sheetsPath }, { root: true });
      return sheetsResponse;
    } catch (error) {
      console.log('getSheets: Error:', error.code, error.message);
      throw error;
    }
  },
  async setSheet({ dispatch, rootGetters }, { fileId, sheetName, data }) {
    if (!rootGetters['auth/isAuthenticated']) {
      console.log('setSheet: User not authenticated, cannot set sheet');
      throw new Error('User not authenticated');
    }
    try {
      const token = await auth.currentUser.getIdToken();
      console.log('setSheet: Token validated', token.slice(0, 10) + '...');
      const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
      await dispatch('firebase/create', { collectionPath: sheetsPath, id: sheetName, data }, { root: true });
      return { name: sheetName, ...data };
    } catch (error) {
      console.log('setSheet: Error:', error.code, error.message);
      throw error;
    }
  },
  async deleteSheet({ dispatch}, { fileId, sheetName }) {
    try {
      const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
      await dispatch('firebase/delete', { collectionPath: sheetsPath, id: sheetName }, { root: true });
      return sheetName;
    } catch (error) {
      console.log('deleteSheet: Error:', error.code, error.message);
      throw error;
    }
  },
};