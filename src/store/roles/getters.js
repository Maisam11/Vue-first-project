export default {
  getUserRoles: (state) => state.userRoles,
  getRolePermissions: (state) => state.rolePermissions,
  getCurrentUserRole: (state) => state.currentUserRole,
  canUserPerformAction: (state) => (resource, action) => {
    const userRole = state.currentUserRole || 'user';
    const permissions = state.rolePermissions[userRole];
    return permissions && permissions[resource] && permissions[resource].includes(action);
  },
};