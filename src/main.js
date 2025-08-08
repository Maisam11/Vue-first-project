import Vue from "vue";
import App from "./App.vue";
import router from "./router/route";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import VueTour from "vue-tour";
import "vue-tour/dist/vue-tour.css";
import VueExcelEditor from "vue-excel-editor";
import './firebase';

Vue.use(VueTour);
Vue.use(VueExcelEditor, {
  licenseKey: undefined,
  defaultColumnWidth: 120,
  defaultRowHeight: 24, 
  stickyHeader: true, 
  pageSize: 50,
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");