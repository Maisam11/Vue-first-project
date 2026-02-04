export default {
  getDocuments: (state) => {
    return state.documents.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getDocumentById: (state) => (id) => state.documents.find((doc) => doc.id === id),
  getFilteredDocuments: (state) => {
    return state.filteredDocuments.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getDocumentHistories: (state) => (documentId) => 
    state.documentHistories.filter(history => history.documentId === documentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  getDocumentHistoryById: (state) => (historyId) => 
    state.documentHistories.find(history => history.id === historyId),
};