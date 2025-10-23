export default {
  currentUserRole: null,
  allUsers: [],
  userRoles: ['admin', 'staff'],
  rolePermissions: {
    admin: {
      files: ['create', 'read', 'update', 'delete'],
    },
    staff: {
      files: ['create', 'read', 'update'],
    }
  }
};