import Vue from 'vue';

export default {
  SET_MODULE_DATA(state, { module, data }) {
    Vue.set(state.data, module, data);
  },
  ADD_MODULE_ITEM(state, { module, item }) {
    if (!state.data[module]) {
      Vue.set(state.data, module, {});
    }
    Vue.set(state.data[module], item.id, item);
  },
  UPDATE_MODULE_ITEM(state, { module, id, data }) {
    if (state.data[module]?.[id]) {
      Vue.set(state.data[module], id, { ...state.data[module][id], ...data });
    }
  },
  DELETE_MODULE_ITEM(state, { module, id }) {
    if (state.data[module]?.[id]) {
      Vue.delete(state.data[module], id);
    }
  },
};