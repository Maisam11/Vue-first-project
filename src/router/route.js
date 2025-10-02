import Vue from "vue";
import Router from "vue-router";
import ParentComp from "../components/layout/mainLayout/ParentComp.vue";
import HomePage from "../components/layout/sections/HomePage.vue";
import BrandsComp from "../components/layout/sections/BrandsComp.vue";
import RepairComp from "../components/layout/sections/RepairComp.vue";
import WorksComp from "../components/layout/sections/WorksComp.vue";
import AboutComp from "../components/layout/sections/AboutComp.vue";
import ServicesComp from "../components/layout/sections/ServicesComp.vue";
import RepBrandsComp from "../components/layout/sections/RepBrandsComp.vue";
import WhyUsComp from "../components/layout/sections/WhyUsComp.vue";
import FeedbackComp from "../components/layout/sections/FeedbackComp.vue";
import FAQComp from "../components/layout/sections/FAQComp.vue";
import BlogComp from "../components/layout/sections/BlogComp.vue";
import UserPage from "../components/layout/DashboardPages/Users/UserPage.vue";
import VueStepper from "../components/layout/DashboardPages/VueStepper.vue";
import UserDashboard from "../components/layout/DashboardPages/UserDashboard.vue";
import SettingsFile from "../components/layout/DashboardPages/practicePages/Settings.vue";
import Setting1File from "../components/layout/DashboardPages/practicePages/Setting1.vue";
import Setting2File from "../components/layout/DashboardPages/practicePages/Setting2.vue";
import MorePage from "../components/layout/DashboardPages/practicePages/More.vue";
import FilesPage from "../components/layout/DashboardPages/Files/FilesPage.vue";
import FileView from "../components/layout/DashboardPages/Files/FileView.vue";
import LoginComp from '../components/layout/DashboardPages/Files/LoginComp.vue';
import RegisterComp from '../components/layout/DashboardPages/Files/RegisterComp.vue';
import store from '../store';

Vue.use(Router);

const router = new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      component: ParentComp,
      children: [
        { path: "", component: HomePage },
        { path: "BrandsComp", component: BrandsComp },
        { path: "RepairComp", component: RepairComp },
        { path: "WorksComp", component: WorksComp },
        { path: "AboutComp", component: AboutComp },
        { path: "ServicesComp", component: ServicesComp },
        { path: "RepBrandsComp", component: RepBrandsComp },
        { path: "WhyUsComp", component: WhyUsComp },
        { path: "FeedbackComp", component: FeedbackComp },
        { path: "FAQComp", component: FAQComp },
        { path: "BlogComp", component: BlogComp },
        { path: "VueStepper", component: VueStepper },
        { path: "login", component: LoginComp, name: 'login' },
        { path: "register", component: RegisterComp, name: 'register' },
      ],
    },
    {
      path: "/UserDashboard",
      component: UserDashboard,
      children: [
        {
          path: "UserPage",
          component: UserPage,
        },
        {
          path: "More",
          component: MorePage,
        },
        {
          path: "Files",
          component: FilesPage,
          meta: { requiresAuth: true },
        },
        {
          path: "Files/:id",
          component: FileView,
          meta: { requiresAuth: true },
        },
        {
          path: "Settings",
          component: SettingsFile,
          children: [
            {
              path: "setting1",
              component: Setting1File,
            },
            {
              path: "setting2",
              component: Setting2File,
            },
          ],
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  
  if (requiresAuth) {
    console.log('Router: Checking authentication for protected route, isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('Router: Redirecting to login, user not authenticated');
      next({ name: 'login', query: { redirect: to.fullPath } });
    } else {
      next();
    }
  } else if (to.name === 'login' && isAuthenticated) {
    console.log('Router: Already authenticated, redirecting to Files');
    next(to.query.redirect || '/UserDashboard/Files');
  } else if (to.name === 'register' && isAuthenticated) {
    console.log('Router: Already authenticated, redirecting to Files');
    next(to.query.redirect || '/UserDashboard/Files');
  } else {
    next();
  }
});

export default router;