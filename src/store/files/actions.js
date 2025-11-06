import { collection, query, where, getDocs } from 'firebase/firestore';
const collectionPath = '78910-files';
const subCollectionPath = 'sheets';
const historyCollectionPath = 'file_histories';

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
        sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : [],
        currentVersion: 1,
        lastSaved: new Date().toISOString()
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
          await dispatch('createFileHistory', {
            fileId: file.id,
            sheetName: sheet.name,
            data: sheet.data || [],
            version: 1,
            changeType: 'created',
            changedBy: currentUser?.username || 'Unknown'
          });
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
  async updateFile({ commit, dispatch, rootGetters }, file) {
    try {
      const currentUser = rootGetters['auth/currentUser'];
      const fileData = {
        name: file.name,
        createdAt: file.createdAt,
        updatedAt: new Date().toISOString(),
        addedBy: file.addedBy,
        sharedWith: file.viewers || [],
        editors: file.editors || [],
        viewers: file.viewers || [],
        sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : [],
        currentVersion: file.currentVersion || 1,
        lastSaved: new Date().toISOString()
      };
      console.log('updateFile: Updating file with data:', fileData);
      console.log('updateFile: Current user:', currentUser);
      console.log('updateFile: User in editors array?', fileData.editors.includes(currentUser?.uid));  
      await dispatch('firebase/update', { collectionPath: '78910-files', id: file.id, data: fileData }, { root: true });

      if (file.sheets && file.sheets.length > 0) {
      const currentSheets = await dispatch('getSheets', { fileId: file.id });
      const currentSheetNames = currentSheets.map(sheet => sheet.id);
      const newSheetNames = file.sheets.map(sheet => sheet.name);
      
      for (const sheetName of currentSheetNames) {
        if (!newSheetNames.includes(sheetName)) {
          console.log('Deleting removed sheet:', sheetName);
        await dispatch('deleteSheet', { fileId: file.id, sheetName });
        }
      }
        for (const sheet of file.sheets) {
          const sheetData = {
            createdAt: sheet.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: sheet.data || []
          };
          await dispatch('setSheet', { fileId: file.id, sheetName: sheet.name, data: sheetData });
        }
    } else {
      const currentSheets = await dispatch('getSheets', { fileId: file.id });
      for (const sheet of currentSheets) {
        console.log('Deleting all sheets:', sheet.id);
        await dispatch('deleteSheet', { fileId: file.id, sheetName: sheet.id });
      }
    }
    const updatedFile = { ...file, ...fileData };
    commit('UPDATE_FILE', updatedFile);
    return updatedFile;
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
    console.log('Sheet deleted successfully:', sheetName);
    return sheetName;
  } catch (error) {
    console.error('deleteSheet: Error:', error.code, error.message);
    if (error.code === 'not-found') {
      console.log('Sheet already deleted:', sheetName);
      return sheetName;
    }
    throw error;
  }
},
  async createFileHistory({ commit, dispatch }, { fileId, sheetName, data, version, changeType, changedBy }) {
    try {
      const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const historyData = {
        id: historyId,
        fileId,
        sheetName,
        data: JSON.parse(JSON.stringify(data)), 
        version,
        timestamp: new Date().toISOString(),
        changedBy,
        changeType
      };
      await dispatch('firebase/create', { 
        collectionPath: historyCollectionPath, 
        id: historyId, 
        data: historyData 
      }, { root: true });
      
      commit('ADD_FILE_HISTORY', historyData);
      return historyData;
    } catch (error) {
      console.error('createFileHistory: Error:', error);
      throw error;
    }
  },
  async fetchFileHistories({ commit, dispatch }, fileId) {
    try {
      const histories = await dispatch('firebase/getAll', { collectionPath: historyCollectionPath }, { root: true });
      const fileHistories = histories.filter(history => history.fileId === fileId);
      commit('SET_FILE_HISTORIES', fileHistories);
      return fileHistories;
    } catch (error) {
      console.error('fetchFileHistories: Error:', error);
      return [];
    }
  },
  async revertToHistory({ dispatch, rootGetters, commit }, { fileId, historyId }) {
    try {
      const currentUser = rootGetters['auth/currentUser'];
      console.log('=== STARTING REVERT PROCESS ===');
      console.log('File ID:', fileId);
      console.log('History ID:', historyId);
      if (!fileId || !historyId) {
        throw new Error('File ID and History ID are required');
      }
      const history = await dispatch('firebase/getById', { 
        collectionPath: historyCollectionPath, 
        id: historyId 
      }, { root: true });
      if (!history) {
        throw new Error('History not found');
      }
      console.log('History record found:', history);
      const currentFile = await dispatch('firebase/getById', { 
        collectionPath, 
        id: fileId 
      }, { root: true });

      if (!currentFile) {
        throw new Error('File not found');
      }
      console.log('Current file found:', currentFile);
      let historicalData = [];
      if (Array.isArray(history.data)) {
        historicalData = history.data;
      } else if (history.data && Array.isArray(history.data.data)) {
        historicalData = history.data.data;
      } else if (history.data && history.data.data) {
        historicalData = history.data.data;
      } else {
        historicalData = history.data || [];
      }
      console.log('Historical data extracted:', historicalData);
      const updatedSheetData = {
        data: historicalData,
        updatedAt: new Date().toISOString()
      };
      if (history.data && history.data.createdAt) {
        updatedSheetData.createdAt = history.data.createdAt;
      }
      console.log('Sheet data to update:', updatedSheetData);
      console.log('Updating sheet in Firebase...');
      await dispatch('setSheet', {
        fileId,
        sheetName: history.sheetName,
        data: updatedSheetData
      });
      const newVersion = (currentFile.currentVersion || 0) + 1;
      const updatedFileData = {
        ...currentFile,
        updatedAt: new Date().toISOString(),
        currentVersion: newVersion,
        lastSaved: new Date().toISOString()
      };
      console.log('Updating file metadata:', updatedFileData);
      await dispatch('firebase/update', { 
        collectionPath, 
        id: fileId, 
        data: updatedFileData 
      }, { root: true });
      console.log('Creating revert history entry...');
      await dispatch('createFileHistory', {
        fileId,
        sheetName: history.sheetName,
        data: historicalData,
        version: newVersion,
        changeType: 'reverted',
        changedBy: currentUser?.username || 'Unknown'
      });
      console.log('Refreshing file data...');
      const refreshedFile = await dispatch('getFileById', fileId);
      if (refreshedFile) {
        commit('UPDATE_FILE', refreshedFile);
        console.log('File updated in local state');
      }
      console.log('=== REVERT COMPLETED SUCCESSFULLY ===');
      return history;
    } catch (error) {
      console.error('revertToHistory: Error:', error);
      throw error;
    }
  },
};