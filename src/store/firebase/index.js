import state from './state';
import actions from './actions';
import { firebaseConnector } from '@/firebase.js';

export default {
  namespaced: true,
  state: {
    ...state,
    firebaseConnector,
  },
  actions,
};