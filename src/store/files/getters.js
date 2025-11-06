export default {
  getFiles: (state) => {
    return state.files.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getFileById: (state) => (id) => state.files.find((file) => file.id === id),
  getFilteredFiles: (state) => {
    return state.filteredFiles.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getFileHistories: (state) => (fileId) => 
    state.fileHistories.filter(history => history.fileId === fileId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  getHistoryById: (state) => (historyId) => 
    state.fileHistories.find(history => history.id === historyId),
};