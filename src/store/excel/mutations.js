export default {
  SET_CUSTOM_DATA(state, data) {
    state.customData = data;
  },
  SET_CUSTOM_COLUMNS(state, columns) {
    state.customColumns = columns;
  },
  SET_STEPS(state, steps) {
    state.steps = steps;
  },
  SET_EXCEL_SUB_TAB(state, tab) {
    state.excelSubTab = tab;
  },
  SET_SELECTED_ROWS(state, rows) {
    state.selectedRows = rows;
  },
};