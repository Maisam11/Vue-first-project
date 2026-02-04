import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { MODULE_NAMES } from '../moduleConfig.js';
const collectionPath = MODULE_NAMES.FILES;
const subCollectionPath = MODULE_NAMES.SHEETS;
const historyCollectionPath = MODULE_NAMES.FILE_HISTORIES;
export default {
  async fetchFiles({ commit, dispatch, rootGetters }, { startDate = null, endDate = null, selectedUser = null } = {}) {
    try {
      const currentRole = rootGetters['roles/getCurrentUserRole'];
      const currentUser = rootGetters['auth/currentUser'];
      console.log('fetchFiles: Current user:', currentUser);
      console.log('fetchFiles: Current role:', currentRole);
    console.log('fetchFiles: Date filter - Start:', startDate, 'End:', endDate);
    console.log('fetchFiles: User filter:', selectedUser);
      let filesResponse = [];
      const db = rootGetters['firebase/firebaseConnector'];
      if (currentRole === 'admin') {
        console.log('fetchFiles: Admin user, fetching all files');
        const queries = [];
        const sharedWithQuery = query(collection(db, collectionPath), 
          where('sharedWith', 'array-contains', currentUser.uid));
        const editorsQuery = query(collection(db, collectionPath), 
          where('editors', 'array-contains', currentUser.uid));
        const viewersQuery = query(collection(db, collectionPath), 
          where('viewers', 'array-contains', currentUser.uid));
        queries.push(sharedWithQuery, editorsQuery, viewersQuery);
        const queryResults = await Promise.all(queries.map(q => getDocs(q)));
        filesResponse = queryResults.flatMap(snapshot => 
          snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        filesResponse = filesResponse.filter((file, index, self) => 
          index === self.findIndex((f) => f.id === file.id)
        );
        console.log('fetchFiles admin: Total accessible files:', filesResponse.length);
      if (selectedUser) {
        const allUsers = rootGetters['roles/getAllUsers'] || [];
        const targetUser = allUsers.find(user => user.username === selectedUser);
        if (targetUser) {
          filesResponse = filesResponse.filter(file => file.addedBy === selectedUser);
          console.log(`fetchFiles: Filtered files for user ${selectedUser}:`, filesResponse.length);
        }
      }

      if (startDate || endDate) {
        filesResponse = filesResponse.filter(file => {
          const fileDate = new Date(file.createdAt);
          let isInRange = true;
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            isInRange = isInRange && fileDate >= start;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            isInRange = isInRange && fileDate <= end;
          }
          return isInRange;
        });
      }
      } else if (currentRole === 'staff') {
        console.log('fetchFiles: Staff user, fetching accessible files');
        const queries = [];
       let ownFilesQuery = query(collection(db, collectionPath),
       where('addedBy', '==', currentUser.username));
      const sharedWithQuery = query(collection(db, collectionPath), where('sharedWith', 'array-contains', currentUser.uid));
      const editorsQuery = query(collection(db, collectionPath), where('editors', 'array-contains', currentUser.uid));
        const viewersQuery = query(collection(db, collectionPath), where('viewers', 'array-contains', currentUser.uid));
      queries.push(ownFilesQuery, sharedWithQuery, editorsQuery, viewersQuery);
        const queryResults = await Promise.all(queries.map(q => getDocs(q)));
        filesResponse = queryResults.flatMap(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        filesResponse = filesResponse.filter((file, index, self) => 
          index === self.findIndex((f) => f.id === file.id)
        );

      if (startDate || endDate || selectedUser) {
        filesResponse = filesResponse.filter(file => {
          const fileDate = new Date(file.createdAt);
          let isInRange = true;
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            isInRange = isInRange && fileDate >= start;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            isInRange = isInRange && fileDate <= end;
          }
          if (selectedUser) {
            isInRange = isInRange && file.addedBy === selectedUser;
          }
          return isInRange;
        });
      }
        console.log('fetchFiles staff: Total accessible files:', filesResponse.length);
      } else {
        console.log('fetchFiles: No access for role:', currentRole);
        return [];
      }
      console.log('fetchFiles response:', filesResponse.length, 'files');
      filesResponse.sort((a, b) => {
        const orderA = a.menu_order || 9999;
        const orderB = b.menu_order || 9999;
        return orderA - orderB;
      });

      const filesWithSheets = await Promise.all(filesResponse.map(async (file) => {
        if (file.type === 'excel') {
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
        } else {
          return file;
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
  async updateFilesOrder({ dispatch, rootGetters }, filesWithNewOrder) {
    try {
      const db = rootGetters['firebase/firebaseConnector'];
      const batch = writeBatch(db);
      filesWithNewOrder.forEach((file, index) => {
        const fileRef = doc(db, collectionPath, file.id);
        batch.update(fileRef, { 
          menu_order: index + 1,
          updatedAt: new Date().toISOString() 
        });
      });
      await batch.commit();
      filesWithNewOrder.forEach(file => {
        dispatch('updateFileInState', file);
      });
      return filesWithNewOrder;
    } catch (error) {
      console.error('updateFilesOrder: Error:', error);
      throw error;
    }
  },
  updateFileInState({ commit }, file) {
    commit('UPDATE_FILE', file);
  },
  async addFile({ commit, dispatch, state, rootGetters }, file) {
    if (!file.id) throw new Error('File ID must be provided');
    if (state.files.some(f => f.id === file.id)) throw new Error('File with this ID already exists');
    const currentUser = rootGetters['auth/currentUser'];
    const currentFilesCount = state.files.length;
    try {
      const fileData = {
        name: file.name,
        type: file.type || 'excel',
        createdAt: file.createdAt || new Date().toISOString(),
        updatedAt: file.updatedAt || new Date().toISOString(),
        addedBy: file.addedBy || currentUser?.username || 'Unknown',
        sharedWith: file.viewers || [],
        editors: [currentUser?.uid, ...(file.editors || [])].filter(Boolean),
        viewers: file.viewers || [],
        sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : [],
        currentVersion: 1,
        menu_order: currentFilesCount + 1,
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
        type: file.type || 'excel',
        createdAt: file.createdAt,
        updatedAt: new Date().toISOString(),
        addedBy: file.addedBy,
        sharedWith: file.viewers || [],
        editors: file.editors || [],
        viewers: file.viewers || [],
        sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : [],
        currentVersion: file.currentVersion || 1,
        menu_order: file.menu_order || 9999,
        lastSaved: new Date().toISOString()
      };
      console.log('updateFile: Updating file with data:', fileData);
      console.log('updateFile: Current user:', currentUser);
      console.log('updateFile: User in editors array?', fileData.editors.includes(currentUser?.uid));  
      await dispatch('firebase/update', { collectionPath, id: file.id, data: fileData }, { root: true });

      if (file.sheets && file.sheets.length > 0) {
        for (const sheet of file.sheets) {
          const sheetData = {
          name: sheet.name,
            createdAt: sheet.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            menu_order: sheet.menu_order || 9999,
            data: sheet.data || []
          };
          await dispatch('setSheet', { fileId: file.id, sheetName: sheet.name, data: sheetData });
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
      if (fileDataResponse.type === 'excel') {
      const sheets = await dispatch('getSheets', { fileId: id });
        return { ...fileDataResponse, sheets: sheets.map(s => ({ name: s.id, ...s })) };
      }
      return fileDataResponse;
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
  async createFileHistory({ commit, dispatch }, { fileId, data, version, changeType, changedBy }) {
    try {
      const historyId = `${Math.random().toString(36).substr(2, 9)}`;
    const sheetsChanged = data.sheets ? data.sheets.map(sheet => ({
      name: sheet.name,
      changeType: 'updated',
      rowsChanged: sheet.data ? sheet.data.length : 0
    })) : [];
      const historyData = {
        id: historyId,
        fileId,
        data: JSON.parse(JSON.stringify(data)), 
        version,
        timestamp: new Date().toISOString(),
        changedBy,
        sheetsChanged,
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
  async revertToHistory({ dispatch, commit }, { fileId, historyId }) {
    try {
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
    let historicalFileData = {};
    if (history.data && history.data.sheets) {
      historicalFileData = {
        sheets: history.data.sheets,
        name: currentFile.name,
        createdAt: currentFile.createdAt,
        addedBy: currentFile.addedBy,
        sharedWith: currentFile.sharedWith || [],
        editors: currentFile.editors || [],
        viewers: currentFile.viewers || []
      };
    } else {
      throw new Error('Invalid history data structure');
    }
      console.log('Historical data extracted:', historicalFileData);
    if (historicalFileData.sheets && historicalFileData.sheets.length > 0) {
      for (const sheet of historicalFileData.sheets) {
        const sheetData = {
          createdAt: sheet.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          data: sheet.data || []
        };
      console.log('Updating sheet:', sheet.name, 'with data:', sheetData);
      await dispatch('setSheet', {
        fileId,
        sheetName: sheet.name,
        data: sheetData
      });
      }
    }
      const updatedFileData = {
        ...currentFile,
        ...historicalFileData,
        updatedAt: new Date().toISOString(),
        activeHistoryVersion: history.version,
        sheetNames: historicalFileData.sheets ? historicalFileData.sheets.map(sheet => sheet.name) : [],
        lastSaved: new Date().toISOString()
      };
      console.log('Updating file metadata:', updatedFileData);
      await dispatch('firebase/update', { 
        collectionPath,
        id: fileId, 
        data: updatedFileData 
      }, { root: true });
      console.log('Refreshing file data...');
      const refreshedFile = await dispatch('getFileById', fileId);
      if (refreshedFile) {
        commit('UPDATE_FILE', refreshedFile);
        console.log('File updated in local state');
      }
      console.log('=== REVERT COMPLETED - ACTIVE VERSION:', history.version, 'LATEST VERSION:', currentFile.currentVersion, '===');
      return history;
    } catch (error) {
      console.error('revertToHistory: Error:', error);
      throw error;
    }
  },
};