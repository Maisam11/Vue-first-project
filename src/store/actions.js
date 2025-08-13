import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default {
  addUser({ commit }, user) {
    commit("ADD_USER", user);
  },
  updateUser({ commit }, user) {
    commit("UPDATE_USER", user);
  },
  deleteUser({ commit }, userId) {
    commit("DELETE_USER", userId);
  },
  addFormSubmission({ commit }, submission) {
    return new Promise((resolve) => {
      commit("ADD_FORM_SUBMISSION", submission);
      resolve(submission);
    });
  },
  updateFormSubmission({ commit }, submission) {
    return new Promise((resolve) => {
      commit("UPDATE_FORM_SUBMISSION", submission);
      resolve(submission);
    });
  },
  deleteFormSubmission({ commit }, submissionId) {
    commit("DELETE_FORM_SUBMISSION", submissionId);
  },
  fetchUsers({ commit, state }) {
    const regularUsers = state.users || [];
    const formUsers = (state.formSubmissions || []).map((sub) => ({
      id: sub.id, name: sub.name, email: sub.email, dob: sub.dob, age: sub.age, homePhone: sub.homePhone || "--",
      mobilePhone: sub.mobilePhone || "--", addresses: sub.addresses || [], }));
    const combinedUsers = [...regularUsers, ...formUsers];
    commit("SET_COMBINED_USERS", combinedUsers);
  },
  setCustomData({ commit }, data) {
    commit("SET_CUSTOM_DATA", data);
  },
  setCustomColumns({ commit }, columns) {
    commit("SET_CUSTOM_COLUMNS", columns);
  },
  setSteps({ commit }, steps) {
    commit("SET_STEPS", steps);
  },
  setExcelSubTab({ commit }, tab) {
    commit("SET_EXCEL_SUB_TAB", tab);
  },
  setSelectedRows({ commit }, rows) {
    commit("SET_SELECTED_ROWS", rows);
  },
  addFile({ commit }, file) {
    commit("ADD_FILE", file);
  },
  updateFile({ commit }, file) {
    commit("UPDATE_FILE", file);
  },
  deleteFile({ commit }, fileId) {
    commit("DELETE_FILE", fileId);
  },
  fetchFiles({ commit }) {
    const docRef = doc(db, 'files', 'data');
    getDoc(docRef).then((snapshot) => {
      const data = snapshot.exists() ? snapshot.data().value : [];
      commit("SET_FILES", data);
    }).catch((error) => {
      console.error("[Firestore] Error fetching files:", error);
    });
  },
  fetchFileById({ commit }, fileId) {
    const docRef = doc(db, 'files', 'data');
    getDoc(docRef).then((snapshot) => {
      const data = snapshot.exists() ? snapshot.data().value : [];
      const file = data.find(f => f.id === fileId);
      if (file) {
        commit("SET_FILES", data);
      }
    }).catch((error) => {
      console.error("[Firestore] Error fetching file by id:", error);
    });
  },
};