
export const getAvailableStatuses = (currentStatus: string, userFunctionalGroup: string): { value: string; label: string }[] => {
  const allStatuses = [
    { value: "BACKLOG", label: "Backlog" },
    { value: "ANALYSIS", label: "Analysis" },
    { value: "DEVELOPMENT", label: "Development" },
    { value: "CODE_REVIEW", label: "Code Review" },
    { value: "UAT_TESTING", label: "UAT Testing" },
    { value: "UAT_FAILED", label: "UAT Failed" },
    { value: "READY_FOR_PREPROD", label: "Ready for Pre-Production" },
    { value: "PREPROD", label: "Pre-Production" },
    { value: "PROD", label: "Production" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CLOSED", label: "Closed" },
    { value: "REOPENED", label: "Reopened" },
    { value: "BLOCKED", label: "Blocked" }
  ];

  let allowedStatuses: string[] = [];
  
  // Implement the definitive workflow logic map from the guide
  switch (currentStatus) {
    case "BACKLOG":
      if (userFunctionalGroup === "DEVELOPER") {
        allowedStatuses = ["ANALYSIS"];
      }
      break;
    
    case "ANALYSIS":
      if (userFunctionalGroup === "DEVELOPER") {
        allowedStatuses = ["DEVELOPMENT"];
      }
      break;
    
    case "DEVELOPMENT":
      if (userFunctionalGroup === "DEVELOPER") {
        allowedStatuses = ["CODE_REVIEW"];
      }
      break;
    
    case "CODE_REVIEW":
      if (["MANAGER", "DEV_MANAGER", "DEV_LEAD", "BUSINESS_ANALYST"].includes(userFunctionalGroup)) {
        allowedStatuses = ["DEVELOPMENT", "UAT_TESTING"];
      }
      break;
    
    case "UAT_TESTING":
      if (["TESTER", "TEST_LEAD", "TEST_MANAGER"].includes(userFunctionalGroup)) {
        allowedStatuses = ["UAT_FAILED", "READY_FOR_PREPROD"];
      }
      break;
    
    case "UAT_FAILED":
      if (userFunctionalGroup === "DEVELOPER") {
        allowedStatuses = ["UAT_TESTING"];
      }
      break;
    
    case "READY_FOR_PREPROD":
      if (["DEVELOPER", "DEV_LEAD"].includes(userFunctionalGroup)) {
        allowedStatuses = ["PREPROD"];
      }
      break;
    
    case "PREPROD":
      if (["DEVELOPER", "DEV_LEAD"].includes(userFunctionalGroup)) {
        allowedStatuses = ["PROD"];
      }
      break;
    
    case "REOPENED":
      if (userFunctionalGroup === "DEVELOPER") {
        allowedStatuses = ["DEVELOPMENT"];
      }
      break;
    
    // For all other combinations, return empty array (no valid transitions)
    default:
      allowedStatuses = [];
  }

  return allStatuses.filter(status => allowedStatuses.includes(status.value));
};

export const requiresComment = (currentStatus: string, newStatus: string): boolean => {
  // Comment is mandatory for these transitions:
  // 1. From CODE_REVIEW to any other status
  // 2. From UAT_TESTING to UAT_FAILED
  // 3. From UAT_FAILED back to UAT_TESTING
  
  if (currentStatus === "CODE_REVIEW") {
    return true;
  }
  
  if (currentStatus === "UAT_TESTING" && newStatus === "UAT_FAILED") {
    return true;
  }
  
  if (currentStatus === "UAT_FAILED" && newStatus === "UAT_TESTING") {
    return true;
  }
  
  return false;
};

export const requiresCommitId = (newStatus: string): boolean => {
  return ["UAT_TESTING", "PREPROD"].includes(newStatus);
};
