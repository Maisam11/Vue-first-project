export default {
  getFiles: (state) => state.files,
  getFileById: (state) => (id) => state.files.find((file) => file.id === id),
  getFilteredFiles: (state) => state.filteredFiles,
};