const collectionPath = '78910-files';
const subCollectionPath = 'sheets';

export default {
  async fetchFiles({ commit, dispatch }) {
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
  },
  async addFile({ commit, dispatch }, file) {
    if (!file.id) {
      throw new Error("File ID must be provided");
    }
    const fileData = {
      name: file.name,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      addedBy: file.addedBy,
      sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : []
    };
    const createFileResponse = await dispatch('firebase/create', { collectionPath, id: file.id, data: fileData }, { root: true });
    console.log('addFile create response:', createFileResponse);
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
  },
  async updateFile({ commit, dispatch }, file) {
    const fileData = {
      name: file.name,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      addedBy: file.addedBy,
      sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : []
    };
    const updateFileResponse = await dispatch('firebase/update', { collectionPath, id: file.id, data: fileData }, { root: true });
    console.log('updateFile update response:', updateFileResponse);
    const existingSheets = await dispatch('getSheets', { fileId: file.id });
    for (const es of existingSheets) {
      await dispatch('deleteSheet', { fileId: file.id, sheetName: es.id });
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
  },
  async deleteFile({ commit, dispatch }, fileId) {
    const existingSheets = await dispatch('getSheets', { fileId });
    for (const es of existingSheets) {
      await dispatch('deleteSheet', { fileId, sheetName: es.id });
    }
    const deleteFileResponse = await dispatch('firebase/delete', { collectionPath, id: fileId }, { root: true });
    console.log('deleteFile response:', deleteFileResponse);
    commit('DELETE_FILE', fileId);
  },
  async getFileById({ dispatch }, id) {
    const fileDataResponse = await dispatch('firebase/getById', { collectionPath, id }, { root: true });
    console.log('getFileById response:', fileDataResponse);
    if (!fileDataResponse) return null;
    const sheets = await dispatch('getSheets', { fileId: id });
    return { ...fileDataResponse, sheets: sheets.map(s => ({ name: s.id, ...s })) };
  },
    async getSheets({ dispatch }, { fileId }) {
    const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
    const sheetsResponse = await dispatch('firebase/getAll', { collectionPath: sheetsPath }, { root: true });
    // console.log('getSheets response:', sheetsResponse);
    return sheetsResponse;
  },
  async setSheet({ dispatch }, { fileId, sheetName, data }) {
    const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
    await dispatch('firebase/create', { collectionPath: sheetsPath, id: sheetName, data }, { root: true });
    // console.log('setSheet response:', setSheetResponse);
  },
  async deleteSheet({ dispatch }, { fileId, sheetName }) {
    const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
    await dispatch('firebase/delete', { collectionPath: sheetsPath, id: sheetName }, { root: true });
    // console.log('deleteSheet response:', deleteSheetResponse);
  },
};