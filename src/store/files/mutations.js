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
    state.filteredFiles = [...files];
  },
  SET_FILTERED_FILES(state, files) {
    state.filteredFiles = files;
  },
};