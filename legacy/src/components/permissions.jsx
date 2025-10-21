export const ACTIONS = {
  // Navigation
  VIEW_REPORTS: 'view:reports',

  // Project Lifecycle
  CREATE_PROJECT: 'create:project',
  EDIT_PROJECT: 'edit:project',
  SUBMIT_PROJECT: 'submit:project',
  APPROVE_PROJECT: 'approve:project',
  REQUEST_PROJECT_CHANGES: 'request-changes:project',

  // Cost & Claim Management
  MANAGE_COSTS: 'manage:costs',
  CREATE_CLAIM: 'create:claim',
  APPROVE_CLAIM: 'approve:claim',
  REJECT_CLAIM: 'reject:claim',
  MARK_CLAIM_PAID: 'mark-paid:claim',
  
  // Project Details
  MANAGE_MILESTONES: 'manage:milestones',
  UPLOAD_DOCUMENTS: 'upload:documents',
  DELETE_DOCUMENTS: 'delete:documents',
  CREATE_COMMENTS: 'create:comments',

  // Administration
  MANAGE_ORGANIZATIONS: 'manage:organizations',
  MANAGE_TEAM: 'manage:team'
};

export const can = (user, action, resource) => {
  if (!user) {
    return false;
  }
  const { user_role } = user;

  switch (action) {
    case ACTIONS.VIEW_REPORTS:
      return ['officer', 'platform_admin'].includes(user_role);

    case ACTIONS.CREATE_PROJECT:
      return ['org_admin', 'org_finance'].includes(user_role);
      
    case ACTIONS.EDIT_PROJECT:
      // An org user can edit a project only if it's a draft.
      if (['org_admin', 'org_finance'].includes(user_role)) {
          return resource?.status === 'draft';
      }
      // An officer might have broader edit rights, but for now we scope to state changes.
      return false;

    case ACTIONS.SUBMIT_PROJECT:
      return ['org_admin', 'org_finance'].includes(user_role) && resource?.status === 'draft';

    case ACTIONS.APPROVE_PROJECT:
    case ACTIONS.REQUEST_PROJECT_CHANGES:
      return user_role === 'officer' && ['submitted', 'under_review'].includes(resource?.status);

    case ACTIONS.MANAGE_COSTS:
      if (user_role === 'officer') return true;
      if (['org_admin', 'org_finance'].includes(user_role)) {
        return ['draft', 'approved', 'in_progress'].includes(resource?.status);
      }
      return false;

    case ACTIONS.CREATE_CLAIM:
      return ['org_admin', 'org_finance'].includes(user_role) && ['approved', 'in_progress'].includes(resource?.status);

    case ACTIONS.APPROVE_CLAIM:
    case ACTIONS.REJECT_CLAIM:
      return user_role === 'officer' && resource?.status === 'submitted';

    case ACTIONS.MARK_CLAIM_PAID:
      return user_role === 'officer' && resource?.status === 'approved';

    case ACTIONS.MANAGE_MILESTONES:
    case ACTIONS.UPLOAD_DOCUMENTS:
    case ACTIONS.DELETE_DOCUMENTS:
        if (user_role === 'officer') return true;
        if (['org_admin', 'org_finance', 'org_hr'].includes(user_role)) {
            return ['draft', 'approved', 'in_progress'].includes(resource?.status);
        }
        return false;

    case ACTIONS.CREATE_COMMENTS:
      // Anyone who can see the project can comment. The page-level access is the guard.
      return true;

    case ACTIONS.MANAGE_ORGANIZATIONS:
      return user_role === 'platform_admin';

    case ACTIONS.MANAGE_TEAM:
      return user_role === 'org_admin';

    default:
      return false;
  }
};