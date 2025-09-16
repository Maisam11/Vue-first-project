export default {
  getCustomData: (state) => state.customData,
  getCustomColumns: (state) => state.customColumns,
  getSteps: (state) => state.steps,
  getExcelSubTab: (state) => state.excelSubTab,
  getSelectedRows: (state) => state.selectedRows,
  getCurrentStepData: (state) => Object.fromEntries(state.customData.map((data, index) => [index, data])),
};