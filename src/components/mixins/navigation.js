export default {
  data() {
    return {
      // TOP drawer items
      drawerItems: [
        {
          title: "User Table",
          icon: "mdi-account",
          to: "/UserDashboard/UserPage",
        },
        {
          title: "Files",
          icon: "mdi-file",
          to: "/UserDashboard/Files",
        },
        {
          title: "More",
          icon: "mdi-account-circle",
          to: "/UserDashboard/More",
        },
        {
          title: "Settings",
          icon: "mdi-cog",
          children: [
            {
              title: "Setting 1",
              icon: "mdi-cog-outline",
              to: "/UserDashboard/Settings/setting1",
            },
            {
              title: "Setting 2",
              icon: "mdi-cog-outline",
              to: "/UserDashboard/Settings/setting2",
            },
          ],
        },
      ],

      // BOTTOM menu items
      bottomDrawerItems: [
        {
          title: "More",
          icon: "mdi-dots-horizontal",
          to: "/UserDashboard/More",
        },
      ],

      // Toolbar top header menu items
      toolbarItems: [
        {
          title: "User Table",
          to: "/UserDashboard/UserPage",
        },
        {
          title: "Profile",
          to: "/UserDashboard/More",
        },
        {
          title: "Files",
          to: "/UserDashboard/Files",
        },
      ],
    };
  },
};