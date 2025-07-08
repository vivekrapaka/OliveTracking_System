
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
    CODE_REVIEW: { label: "Code Review", value: "CODE_REVIEW" },
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

  // Core workflow logic with teammember permissions
  switch (currentStatus) {
    case "DEVELOPMENT":
      if (["DEVELOPER", "TEAMMEMBER"].includes(userRole)) {
        transitions.push(statusMap.CODE_REVIEW);
      }
      break;

    case "CODE_REVIEW":
      if (["MANAGER", "TEAMLEAD", "BUSINESS_ANALYST", "BA", "TEAMMEMBER"].includes(userRole)) {
        transitions.push(statusMap.DEVELOPMENT, statusMap.UAT_TESTING);
      }
      break;

    case "UAT_TESTING":
      if (["TESTER", "QA_MANAGER", "BUSINESS_ANALYST", "BA", "TEAMMEMBER"].includes(userRole)) {
        transitions.push(statusMap.PREPROD, statusMap.UAT_FAILED);
      }
      break;

    case "SIT_FAILED":
    case "UAT_FAILED":
      if (["DEVELOPER", "TEAMMEMBER"].includes(userRole)) {
        transitions.push(statusMap.DEVELOPMENT);
      }
      break;

    case "PREPROD":
      if (["MANAGER", "ADMIN", "TEAMMEMBER"].includes(userRole)) {
        transitions.push(statusMap.PROD);
      }
      break;

    default:
      // For other statuses, allow admins, managers, and teammembers to have broader access
      if (["ADMIN", "MANAGER", "TEAMMEMBER"].includes(userRole)) {
        return Object.values(statusMap);
      }
      break;
  }

  // Always include the current status as the first option (no change)
  if (statusMap[currentStatus]) {
    transitions.unshift(statusMap[currentStatus]);
  }

  return transitions;
};

export const requiresCommitId = (status: string): boolean => {
  return ["UAT_TESTING", "PREPROD"].includes(status);
};

export const requiresComment = (currentStatus: string, newStatus: string): boolean => {
  // Comment is required when changing status FROM CODE_REVIEW to any other status
  return currentStatus === "CODE_REVIEW" && newStatus !== "CODE_REVIEW";
};
