import { collection, query, where, getDocs } from 'firebase/firestore';
import { MODULE_NAMES } from '../moduleConfig.js';
const documentCollectionPath = MODULE_NAMES.DOCUMENTS;
const documentHistoryCollectionPath = MODULE_NAMES.DOCUMENT_HISTORIES;
export default {
  async fetchDocuments({ commit, dispatch, rootGetters }, { startDate = null, endDate = null, selectedUser = null } = {}) {
    try {
      const currentRole = rootGetters['roles/getCurrentUserRole'];
      const currentUser = rootGetters['auth/currentUser'];
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      let documentsResponse = [];
      if (currentRole === 'admin') {
        documentsResponse = await dispatch('firebase/getAll', { 
          collectionPath: documentCollectionPath 
        }, { root: true });
        if (selectedUser) {
          documentsResponse = documentsResponse.filter(doc => doc.addedBy === selectedUser);
        }
        if (startDate || endDate) {
          documentsResponse = documentsResponse.filter(doc => {
            const docDate = new Date(doc.createdAt);
            let isInRange = true;
            if (startDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              isInRange = isInRange && docDate >= start;
            }
            if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              isInRange = isInRange && docDate <= end;
            }
            return isInRange;
          });
        }
      } else if (currentRole === 'staff') {
        const db = rootGetters['firebase/firebaseConnector'];
        const ownDocsQuery = query(collection(db, documentCollectionPath),
          where('addedBy', '==', currentUser.username));
        const sharedWithQuery = query(collection(db, documentCollectionPath), 
          where('sharedWith', 'array-contains', currentUser.uid));
        const editorsQuery = query(collection(db, documentCollectionPath), 
          where('editors', 'array-contains', currentUser.uid));
        const viewersQuery = query(collection(db, documentCollectionPath), 
          where('viewers', 'array-contains', currentUser.uid));
        const queries = [ownDocsQuery, sharedWithQuery, editorsQuery, viewersQuery];
        const queryResults = await Promise.all(queries.map(q => getDocs(q)));
        documentsResponse = queryResults.flatMap(snapshot => 
          snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        documentsResponse = documentsResponse.filter((doc, index, self) => 
          index === self.findIndex((d) => d.id === doc.id)
        );
        if (startDate || endDate || selectedUser) {
          documentsResponse = documentsResponse.filter(doc => {
            const docDate = new Date(doc.createdAt);
            let isInRange = true;
            if (startDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              isInRange = isInRange && docDate >= start;
            }
            if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              isInRange = isInRange && docDate <= end;
            }
            if (selectedUser) {
              isInRange = isInRange && doc.addedBy === selectedUser;
            }
            return isInRange;
          });
        }
      } else {
        return [];
      }
      documentsResponse.sort((a, b) => {
        const orderA = a.menu_order || 9999;
        const orderB = b.menu_order || 9999;
        return orderA - orderB;
      });
      commit('SET_DOCUMENTS', documentsResponse);
      commit('SET_FILTERED_DOCUMENTS', documentsResponse);
      return documentsResponse;
    } catch (error) {
      console.error('fetchDocuments: Error:', error);
      throw error;
    }
  },
  async addDocument({ commit, dispatch, rootGetters }, document) {
    try {
      const currentUser = rootGetters['auth/currentUser'];
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const contentToSave = document.content || ['<p><br></p>'];
      const documentData = {
        name: document.name,
        type: 'document',
        content: contentToSave,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addedBy: currentUser.username,
        sharedWith: document.viewers || [],
        editors: [currentUser.uid, ...(document.editors || [])].filter(Boolean),
        viewers: document.viewers || [],
        currentVersion: 1,
        menu_order: document.menu_order || 9999,
        lastSaved: new Date().toISOString()
      };
      await dispatch('firebase/create', { 
        collectionPath: documentCollectionPath, 
        id: document.id, 
        data: documentData 
      }, { root: true });
      await dispatch('createDocumentHistory', {
        documentId: document.id,
        data: { content: contentToSave },
        version: 1,
        changeType: 'created',
        changedBy: currentUser.username
      });
      const newDocument = { ...document, ...documentData };
      commit('ADD_DOCUMENT', newDocument);
      return newDocument;
    } catch (error) {
      console.error('addDocument: Error:', error);
      throw error;
    }
  },
  async updateDocument({ commit, dispatch, rootGetters }, document) {
    try {
      const currentUser = rootGetters['auth/currentUser'];
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const contentToSave = document.content || ['<p><br></p>'];
      const documentData = {
        name: document.name,
        type: 'document',
        content: contentToSave,
        updatedAt: new Date().toISOString(),
        addedBy: document.addedBy,
        sharedWith: document.viewers || [],
        editors: document.editors || [],
        viewers: document.viewers || [],
        currentVersion: document.currentVersion || 1,
        menu_order: document.menu_order || 9999,
        lastSaved: new Date().toISOString()
      };
      await dispatch('firebase/update', { 
        collectionPath: documentCollectionPath, 
        id: document.id, 
        data: documentData 
      }, { root: true });
      const updatedDocument = { ...document, ...documentData };
      commit('UPDATE_DOCUMENT', updatedDocument);
      return updatedDocument;
    } catch (error) {
      console.error('updateDocument: Error:', error);
      throw error;
    }
  },
  async getDocumentById({ commit, dispatch, getters, rootGetters }, id) {
  try {
    const currentRole = rootGetters['roles/getCurrentUserRole'];
    const currentUser = rootGetters['auth/currentUser'];
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    const documentData = await dispatch('firebase/getById', { 
      collectionPath: documentCollectionPath, 
      id 
    }, { root: true });
    if (!documentData) {
      return null;
    }
    const hasAccess = currentRole === 'admin' || 
      documentData.addedBy === currentUser.username || 
      (documentData.sharedWith || []).includes(currentUser.uid) ||
      (documentData.editors || []).includes(currentUser.uid) ||
      (documentData.viewers || []).includes(currentUser.uid);
    if (!hasAccess) {
      throw new Error('You do not have permission to access this document');
    }
    if (!documentData.content || !Array.isArray(documentData.content)) {
      documentData.content = ['<p><br></p>'];
    }
    commit('ADD_DOCUMENT', documentData);
    return documentData;
  } catch (error) {
    console.error('getDocumentById: Error:', error);
    const localDocument = getters.getDocumentById(id);
    if (localDocument) {
      return localDocument;
    }
    throw error;
  }
},
  async deleteDocument({ commit, dispatch }, documentId) {
    try {
      await dispatch('firebase/delete', { 
        collectionPath: documentCollectionPath, 
        id: documentId 
      }, { root: true });
      commit('DELETE_DOCUMENT', documentId);
      return documentId;
    } catch (error) {
      console.error('deleteDocument: Error:', error);
      throw error;
    }
  },
  async createDocumentHistory({ commit, dispatch }, { documentId, data, version, changeType, changedBy }) {
    try {
      const historyId = `${Math.random().toString(36).substr(2, 9)}`;
      const historyData = {
        id: historyId,
        documentId,
        data: JSON.parse(JSON.stringify(data)),
        version,
        timestamp: new Date().toISOString(),
        changedBy,
        changeType
      };
      await dispatch('firebase/create', { 
        collectionPath: documentHistoryCollectionPath, 
        id: historyId, 
        data: historyData 
      }, { root: true });
      commit('ADD_DOCUMENT_HISTORY', historyData);
      return historyData;
    } catch (error) {
      console.error('createDocumentHistory: Error:', error);
      throw error;
    }
  },
  async fetchDocumentHistories({ commit, dispatch }, documentId) {
    try {
      const histories = await dispatch('firebase/getAll', { 
        collectionPath: documentHistoryCollectionPath 
      }, { root: true });
      const documentHistories = histories.filter(history => history.documentId === documentId);
      commit('SET_DOCUMENT_HISTORIES', documentHistories);
      return documentHistories;
    } catch (error) {
      console.error('fetchDocumentHistories: Error:', error);
      return [];
    }
  },
  async revertToHistory({ dispatch, commit }, { documentId, historyId }) {
  try {
    console.log('=== STARTING DOCUMENT REVERT PROCESS ===');
    console.log('Document ID:', documentId);
    console.log('History ID:', historyId);
    if (!documentId || !historyId) {
      throw new Error('Document ID and History ID are required');
    }
    const history = await dispatch('firebase/getById', { 
      collectionPath: documentHistoryCollectionPath, 
      id: historyId 
    }, { root: true });
    if (!history) {
      throw new Error('History not found');
    }
    console.log('History record found:', history);
    const currentDocument = await dispatch('firebase/getById', { 
      collectionPath: documentCollectionPath, 
      id: documentId 
    }, { root: true });
    if (!currentDocument) {
      throw new Error('Document not found');
    }
    console.log('Current document found:', currentDocument);
    let historicalDocumentData = {};
    if (history.data && history.data.content) {
      historicalDocumentData = {
        content: history.data.content,
        name: currentDocument.name,
        addedBy: currentDocument.addedBy,
        sharedWith: currentDocument.sharedWith || [],
        editors: currentDocument.editors || [],
        viewers: currentDocument.viewers || []
      };
    } else {
      throw new Error('Invalid history data structure');
    }
    console.log('Historical data extracted:', historicalDocumentData);
    const updatedDocumentData = {
      ...currentDocument,
      ...historicalDocumentData,
      updatedAt: new Date().toISOString(),
      activeHistoryVersion: history.version,
      lastSaved: new Date().toISOString()
    };
    console.log('Updating document metadata:', updatedDocumentData);
    await dispatch('firebase/update', { 
      collectionPath: documentCollectionPath,
      id: documentId, 
      data: updatedDocumentData 
    }, { root: true });
    const refreshedDocument = await dispatch('getDocumentById', documentId);
    if (refreshedDocument) {
      commit('UPDATE_DOCUMENT', refreshedDocument);
      console.log('Document updated in local state');
    }
    console.log('=== DOCUMENT REVERT COMPLETED - ACTIVE VERSION:', history.version, 'LATEST VERSION:', currentDocument.currentVersion, '===');
    return history;
  } catch (error) {
    console.error('revertToHistory: Error:', error);
    throw error;
  }
},
};