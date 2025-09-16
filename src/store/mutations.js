// import Vue from "vue";
// export default {
//   ADD_USER(state, user) {
//     state.users.push({ ...user });
//   },
//   UPDATE_USER(state, updatedUser) {
//     const index = state.users.findIndex((u) => u.id === updatedUser.id);
//     if (index !== -1) {
//       Vue.set(state.users, index, updatedUser);
//     }
//   },
//   DELETE_USER(state, userId) {
//     state.users = state.users.filter((user) => user.id !== userId);
//   },
//   ADD_FORM_SUBMISSION(state, submission) {
//     if (!submission.id) {
//       submission.id = String(Date.now());
//     }
//     state.formSubmissions.push({ ...submission });
//   },
//   UPDATE_FORM_SUBMISSION(state, updatedSubmission) {
//     const index = state.formSubmissions.findIndex((s) => s.id === updatedSubmission.id);
//     if (index !== -1) {
//       Vue.set(state.formSubmissions, index, updatedSubmission);
//     }
//   },
//   DELETE_FORM_SUBMISSION(state, submissionId) {
//     state.formSubmissions = state.formSubmissions.filter((s) => s.id !== submissionId);
//   },
//   SET_CUSTOM_DATA(state, data) {
//     state.customData = data;
//   },
//   SET_STEPS(state, steps) {
//     state.steps = steps;
//   },
//   SET_EXCEL_SUB_TAB(state, tab) {
//     state.excelSubTab = tab;
//   },
//   SET_SELECTED_ROWS(state, rows) {
//     state.selectedRows = rows;
//   },
//   SET_COMBINED_USERS(state, combinedUsers) {
//     state.combinedUsers = combinedUsers;
//   },
// };