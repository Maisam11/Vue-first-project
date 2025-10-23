export default {
  getUserRoles: (state) => state.userRoles,
  getRolePermissions: (state) => state.rolePermissions,
  getCurrentUserRole: (state) => state.currentUserRole,
  getAllUsers: (state) => state.allUsers || [],
  getStaffUsers: (state) => (state.allUsers || []).filter(user => user.role === 'staff'),
  canUserPerformAction: (state) => (resource, action) => {
    const userRole = state.currentUserRole || 'staff';
    const permissions = state.rolePermissions[userRole];
    return permissions && permissions[resource] && permissions[resource].includes(action);
  },
};