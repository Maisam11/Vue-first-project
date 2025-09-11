const collectionPath = '78910-files';
const subCollectionPath = 'sheets';

export default {
  async getSheets({ dispatch }, { fileId }) {
    const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
    const sheets = await dispatch('firebase/getAll', { collectionPath: sheetsPath }, { root: true });
    return sheets;
  },
  async setSheet({ dispatch }, { fileId, sheetName, data }) {
    const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
    await dispatch('firebase/create', { collectionPath: sheetsPath, id: sheetName, data }, { root: true });
  },
  async deleteSheet({ dispatch }, { fileId, sheetName }) {
    const sheetsPath = `${collectionPath}/${fileId}/${subCollectionPath}`;
    await dispatch('firebase/delete', { collectionPath: sheetsPath, id: sheetName }, { root: true });
  },
  async fetchFiles({ commit, dispatch }) {
    const files = await dispatch('firebase/getAll', { collectionPath }, { root: true });
    const filesWithSheets = await Promise.all(files.map(async (file) => {
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
  },
  async updateFile({ commit, dispatch }, file) {
    const fileData = {
      name: file.name,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      addedBy: file.addedBy,
      sheetNames: file.sheets ? file.sheets.map(sheet => sheet.name) : []
    };
    await dispatch('firebase/update', { collectionPath, id: file.id, data: fileData }, { root: true });
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
    await dispatch('firebase/delete', { collectionPath, id: fileId }, { root: true });
    commit('DELETE_FILE', fileId);
  },
  async getFileById({ dispatch }, id) {
    const fileData = await dispatch('firebase/getById', { collectionPath, id }, { root: true });
    if (!fileData) return null;
    const sheets = await dispatch('getSheets', { fileId: id });
    return { ...fileData, sheets: sheets.map(s => ({ name: s.id, ...s })) };
  },
};