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
  fetchUsers({ state }) {
    const regularUsers = (state.users || []).map((user) => ({
      ...user,
      isFormSubmission: false,
      type: "user",
    }));
    const formUsers = (state.formSubmissions || []).map((sub) => ({
      id: sub.id,
      name: sub.name,
      email: sub.email,
      dob: sub.dob,
      age: sub.age,
      homePhone: sub.homePhone || "--",
      mobilePhone: sub.mobilePhone || "--",
      addresses: sub.addresses || [],
      isFormSubmission: true,
      type: "form",
    }));
    return [...regularUsers, ...formUsers];
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
  addFile({ commit, state }, file) {
    if (!file.id) {
      throw new Error("File ID must be provided");
    }
    // Check for duplicate ID
    if (state.files.some(f => f.id === file.id)) {
      throw new Error("File ID already exists");
    }
    commit("ADD_FILE", file);
  },
  updateFile({ commit }, file) {
    commit("UPDATE_FILE", file);
  },
  deleteFile({ commit }, fileId) {
    commit("DELETE_FILE", fileId);
  },
};