import state from './state';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';
import { firebaseConnector } from '@/firebase.js';

export default {
  namespaced: true,
  state: {
    ...state,
    firebaseConnector,
    currentModule: {
      accountId: '78910',
      moduleName: 'files',
      fullId: '78910-files'
    }
  },
  getters,
  mutations,
  actions,
};