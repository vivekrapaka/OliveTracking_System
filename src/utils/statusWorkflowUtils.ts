
interface StatusOption {
  value: string;
  label: string;
}

export const getAvailableStatuses = (currentStatus: string, userFunctionalGroup: string): StatusOption[] => {
  const statusTransitions: Record<string, Record<string, StatusOption[]>> = {
    'BACKLOG': {
      'DEVELOPER': [{ value: 'ANALYSIS', label: 'Analysis' }],
      'DEV_LEAD': [{ value: 'ANALYSIS', label: 'Analysis' }]
    },
    'ANALYSIS': {
      'DEVELOPER': [{ value: 'DEVELOPMENT', label: 'Development' }],
      'DEV_LEAD': [{ value: 'DEVELOPMENT', label: 'Development' }]
    },
    'DEVELOPMENT': {
      'DEVELOPER': [{ value: 'CODE_REVIEW', label: 'Code Review' }],
      'DEV_LEAD': [{ value: 'CODE_REVIEW', label: 'Code Review' }]
    },
    'CODE_REVIEW': {
      'MANAGER': [
        { value: 'DEVELOPMENT', label: 'Development' },
        { value: 'UAT_TESTING', label: 'UAT Testing' }
      ],
      'DEV_MANAGER': [
        { value: 'DEVELOPMENT', label: 'Development' },
        { value: 'UAT_TESTING', label: 'UAT Testing' }
      ],
      'DEV_LEAD': [
        { value: 'DEVELOPMENT', label: 'Development' },
        { value: 'UAT_TESTING', label: 'UAT Testing' }
      ],
      'BUSINESS_ANALYST': [
        { value: 'DEVELOPMENT', label: 'Development' },
        { value: 'UAT_TESTING', label: 'UAT Testing' }
      ]
    },
    'UAT_TESTING': {
      'TESTER': [
        { value: 'UAT_FAILED', label: 'UAT Failed' },
        { value: 'READY_FOR_PREPROD', label: 'Ready for Pre-Production' }
      ],
      'TEST_LEAD': [
        { value: 'UAT_FAILED', label: 'UAT Failed' },
        { value: 'READY_FOR_PREPROD', label: 'Ready for Pre-Production' }
      ],
      'TEST_MANAGER': [
        { value: 'UAT_FAILED', label: 'UAT Failed' },
        { value: 'READY_FOR_PREPROD', label: 'Ready for Pre-Production' }
      ]
    },
    'UAT_FAILED': {
      'DEVELOPER': [{ value: 'UAT_TESTING', label: 'UAT Testing' }],
      'DEV_LEAD': [{ value: 'UAT_TESTING', label: 'UAT Testing' }]
    },
    'READY_FOR_PREPROD': {
      'DEVELOPER': [{ value: 'PREPROD', label: 'Pre-Production' }],
      'DEV_LEAD': [{ value: 'PREPROD', label: 'Pre-Production' }]
    },
    'PREPROD': {
      'DEVELOPER': [{ value: 'PROD', label: 'Production' }],
      'DEV_LEAD': [{ value: 'PROD', label: 'Production' }]
    },
    'PROD': {
      'DEVELOPER': [{ value: 'COMPLETED', label: 'Completed' }],
      'DEV_LEAD': [{ value: 'COMPLETED', label: 'Completed' }]
    },
  };

  return statusTransitions[currentStatus]?.[userFunctionalGroup] || [];
};

export const requiresCommitId = (status: string): boolean => {
  return ['UAT_TESTING', 'PREPROD'].includes(status);
};

export const requiresComment = (fromStatus: string, toStatus: string): boolean => {
  // Comment required for UAT failure
  if (fromStatus === 'UAT_TESTING' && toStatus === 'UAT_FAILED') {
    return true;
  }
  
  // Comment required when moving back to UAT from failed state
  if (fromStatus === 'UAT_FAILED' && toStatus === 'UAT_TESTING') {
    return true;
  }
  
  return false;
};
