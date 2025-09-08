export default {
  async addFile({ commit, dispatch }, file) {
    if (!file.id) {
      throw new Error("File ID must be provided");
    }
    await dispatch('firebase/create', { data: file }, { root: true });
    commit('ADD_FILE', file);
  },
  async updateFile({ commit, dispatch }, file) {
    await dispatch('firebase/update', { id: file.id, data: file }, { root: true });
    commit('UPDATE_FILE', file);
  },
  async deleteFile({ commit, dispatch }, fileId) {
    await dispatch('firebase/remove', { id: fileId }, { root: true });
    commit('DELETE_FILE', fileId);
  },
  async fetchFilteredFiles({ commit, dispatch }, { startDate, endDate }) {
    const files = await dispatch('firebase/get', {}, { root: true });
    let filteredFiles = files;
    if (startDate || endDate) {
      filteredFiles = files.filter(file => {
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
    commit('SET_FILES', filteredFiles);
    return filteredFiles;
  },
  async getPaginatedFiles({ dispatch }, { page, limit }) {
    return await dispatch('firebase/getPaginated', { page, limit }, { root: true });
  },
  async startFileSync({ dispatch }) {
    await dispatch('firebase/startSync', {}, { root: true });
  },
};