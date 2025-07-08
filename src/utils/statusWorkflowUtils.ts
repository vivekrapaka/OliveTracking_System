
export interface StatusTransition {
  value: string;
  label: string;
}

export const getAvailableStatusTransitions = (
  currentStatus: string,
  userRole: string
): StatusTransition[] => {
  const statusMap: Record<string, { label: string; value: string }> = {
    BACKLOG: { label: "Backlog", value: "BACKLOG" },
    ANALYSIS: { label: "Analysis", value: "ANALYSIS" },
    DEVELOPMENT: { label: "Development", value: "DEVELOPMENT" },
    SIT_TESTING: { label: "SIT Testing", value: "SIT_TESTING" },
    SIT_FAILED: { label: "SIT Failed", value: "SIT_FAILED" },
    UAT_TESTING: { label: "UAT Testing", value: "UAT_TESTING" },
    UAT_FAILED: { label: "UAT Failed", value: "UAT_FAILED" },
    PREPROD: { label: "Pre-Production", value: "PREPROD" },
    PROD: { label: "Production", value: "PROD" },
    COMPLETED: { label: "Completed", value: "COMPLETED" },
    CLOSED: { label: "Closed", value: "CLOSED" },
    REOPENED: { label: "Reopened", value: "REOPENED" },
    BLOCKED: { label: "Blocked", value: "BLOCKED" }
  };

  const transitions: StatusTransition[] = [];

  switch (currentStatus) {
    case "DEVELOPMENT":
      if (userRole === "DEVELOPER") {
        transitions.push(statusMap.SIT_TESTING);
      }
      break;

    case "SIT_TESTING":
      if (["TESTER", "QA_MANAGER"].includes(userRole)) {
        transitions.push(statusMap.UAT_TESTING, statusMap.SIT_FAILED);
      }
      break;

    case "UAT_TESTING":
      if (["TESTER", "QA_MANAGER", "BUSINESS_ANALYST", "BA"].includes(userRole)) {
        transitions.push(statusMap.PREPROD, statusMap.UAT_FAILED);
      }
      break;

    case "PREPROD":
      if (["MANAGER", "ADMIN"].includes(userRole)) {
        transitions.push(statusMap.PROD);
      }
      break;

    case "SIT_FAILED":
      if (userRole === "DEVELOPER") {
        transitions.push(statusMap.DEVELOPMENT);
      }
      break;

    case "UAT_FAILED":
      if (userRole === "DEVELOPER") {
        transitions.push(statusMap.DEVELOPMENT);
      }
      break;

    case "REOPENED":
      if (userRole === "DEVELOPER") {
        transitions.push(statusMap.DEVELOPMENT);
      }
      break;

    default:
      // For other statuses or roles, allow basic transitions
      if (["ADMIN", "MANAGER"].includes(userRole)) {
        // Admins and managers can transition to most statuses
        return Object.values(statusMap);
      }
      break;
  }

  // Always allow staying in the same status
  if (statusMap[currentStatus]) {
    transitions.unshift(statusMap[currentStatus]);
  }

  return transitions;
};

export const requiresCommitId = (status: string): boolean => {
  return ["UAT_TESTING", "PREPROD"].includes(status);
};
