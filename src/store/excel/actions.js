export default {
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
};