import Vue from 'vue';

export default {
  ADD_FILE(state, file) {
    state.files.push({ ...file });
    state.filteredFiles = [...state.files];
  },
  UPDATE_FILE(state, updatedFile) {
    const index = state.files.findIndex((f) => f.id === updatedFile.id);
    if (index !== -1) {
      Vue.set(state.files, index, updatedFile);
      state.filteredFiles = [...state.files];
    }
  },
  DELETE_FILE(state, fileId) {
    state.files = state.files.filter((file) => file.id !== fileId);
    state.filteredFiles = [...state.files];
  },
  SET_FILES(state, files) {
    state.files = files;
  },
  SET_FILTERED_FILES(state, files) {
    state.filteredFiles = files;
  },
  SET_SYNCED(state, val) {
    state.synced = val;
  },
  ADD_FILE_HISTORY(state, history) {
    state.fileHistories.push({ ...history });
  },
  SET_FILE_HISTORIES(state, histories) {
    state.fileHistories = histories;
  },
  DELETE_FILE_HISTORY(state, historyId) {
    state.fileHistories = state.fileHistories.filter(history => history.id !== historyId);
  },
};