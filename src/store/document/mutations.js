import Vue from 'vue';
export default {
  ADD_DOCUMENT(state, document) {
  const existingIndex = state.documents.findIndex(d => d.id === document.id);
  if (existingIndex !== -1) {
    Vue.set(state.documents, existingIndex, document);
  } else {
    state.documents.push({ ...document });
  }
  state.filteredDocuments = [...state.documents];
},
  UPDATE_DOCUMENT(state, updatedDocument) {
    const index = state.documents.findIndex((d) => d.id === updatedDocument.id);
    if (index !== -1) {
      Vue.set(state.documents, index, updatedDocument);
      state.filteredDocuments = [...state.documents];
    }
  },
  DELETE_DOCUMENT(state, documentId) {
    state.documents = state.documents.filter((doc) => doc.id !== documentId);
    state.filteredDocuments = [...state.documents];
  },
  SET_DOCUMENTS(state, documents) {
    state.documents = documents;
  },
  SET_FILTERED_DOCUMENTS(state, documents) {
    state.filteredDocuments = documents;
  },
  ADD_DOCUMENT_HISTORY(state, history) {
    state.documentHistories.push({ ...history });
  },
  SET_DOCUMENT_HISTORIES(state, histories) {
    state.documentHistories = histories;
  },
  DELETE_DOCUMENT_HISTORY(state, historyId) {
    state.documentHistories = state.documentHistories.filter(history => history.id !== historyId);
  },
};