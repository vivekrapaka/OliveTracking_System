

export const getAvailableStatuses = (currentStatus: string, userFunctionalGroup: string): { value: string; label: string }[] => {
  const allStatuses = [
    { value: "BACKLOG", label: "Backlog" },
    { value: "ANALYSIS", label: "Analysis" },
    { value: "DEVELOPMENT", label: "Development" },
    { value: "CODE_REVIEW", label: "Code Review" },
    { value: "UAT_TESTING", label: "UAT Testing" },
    { value: "UAT_FAILED", label: "UAT Failed" },
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
      if (["MANAGER", "TEAMLEAD", "BUSINESS_ANALYST"].includes(userFunctionalGroup)) {
        allowedStatuses = ["DEVELOPMENT", "UAT_TESTING"];
      }
      break;
    
    case "UAT_TESTING":
      if (userFunctionalGroup === "TESTER") {
        allowedStatuses = ["PREPROD", "UAT_FAILED"];
      }
      break;
    
    case "UAT_FAILED":
      if (userFunctionalGroup === "DEVELOPER") {
        allowedStatuses = ["DEVELOPMENT"];
      }
      break;
    
    case "REOPENED":
      if (userFunctionalGroup === "DEVELOPER") {
        allowedStatuses = ["DEVELOPMENT"];
      }
      break;
    
    case "PREPROD":
      if (["MANAGER", "ADMIN"].includes(userFunctionalGroup)) {
        allowedStatuses = ["PROD"];
      }
      break;
    
    // For all other combinations, return empty array (no valid transitions)
    default:
      allowedStatuses = [];
  }

  return allStatuses.filter(status => allowedStatuses.includes(status.value));
};

export const requiresComment = (currentStatus: string, newStatus: string): boolean => {
  // Comment is mandatory when current status is CODE_REVIEW and a transition is available
  return currentStatus === "CODE_REVIEW";
};

export const requiresCommitId = (newStatus: string): boolean => {
  return ["UAT_TESTING", "PREPROD"].includes(newStatus);
};
