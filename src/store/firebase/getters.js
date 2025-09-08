export default {
  getModuleData: (state) => (module) => state.data[module] ? Object.values(state.data[module]) : [],
  getModuleItemById: (state) => (module, id) => state.data[module]?.[id] || null,
};