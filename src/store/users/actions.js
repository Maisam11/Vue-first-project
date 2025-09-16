export default {
  addUser({ commit }, user) {
    // Ensure user object is valid before committing
    if (!user || typeof user !== 'object') {
      console.error('Invalid user data provided to addUser');
      return;
    }
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
  fetchUsers({ getters }) {
    return getters.getCombinedUserData;
  },
};