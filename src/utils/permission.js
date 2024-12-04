const ROLES = {
  Administrator: {
    reconcile: {
      matched: true,
      minor_issues: true,
      major_issues: true,
      reject: true
    },
    approval: {
      approve: true
    }
  },
  Management: {
    reconcile: {
      matched: true,
      minor_issues: true,
      major_issues: true,
      reject: true
    },
    approval: {
      approve: true
    }
  },
  'Operations Senior': {
    reconcile: {
      matched: true,
      minor_issues: true,
      major_issues: true,
      reject: true
    },
    approval: {
      approve: false
    }
  },
  Operations: {
    reconcile: {
      matched: true,
      minor_issues: true,
      major_issues: true,
      reject: true
    },
    approval: {
      approve: false
    }
  },
}

export const hasPermission = (role, permission, action) => {
  // Check if the role exists in the ROLES object
  if (!ROLES[role]) {
    return false; // Role does not exist
  }

  // Check if the permission exists for the given role
  const rolePermissions = ROLES[role];
  if (!rolePermissions[permission]) {
    return false; // Permission does not exist for this role
  }

  // Check if the specific action is allowed
  return !!rolePermissions[permission][action];
};
