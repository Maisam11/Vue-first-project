export default {
  currentUserRole: null,
  userRoles: ['admin', 'staff', 'user'],
  rolePermissions: {
    admin: {
      files: ['create', 'read', 'update', 'delete'],
    },
    staff: {
      files: ['create', 'read', 'update'],
    },
    user: {
      files: ['create', 'read'],
    }
  }
};