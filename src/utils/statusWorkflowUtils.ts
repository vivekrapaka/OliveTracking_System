export const getAvailableStatuses = (currentStatus: string, userRole: string): { value: string; label: string }[] => {
  const allStatuses = [
    { value: "BACKLOG", label: "Backlog" },
    { value: "ANALYSIS", label: "Analysis" },
    { value: "DEVELOPMENT", label: "Development" },
    { value: "CODE_REVIEW", label: "Code Review" },
    { value: "SIT_TESTING", label: "SIT Testing" },
    { value: "SIT_FAILED", label: "SIT Failed" },
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
//console.log("userrole of the member-{}   {}",userRole,currentStatus)
  switch (currentStatus) {
    case "DEVELOPMENT":
      if (userRole === "TEAM_MEMBER") {
        allowedStatuses = ["CODE_REVIEW", "BACKLOG"];
      }
      break;
    case "BACKLOG":
      if (userRole === "TEAM_MEMBER") {
        allowedStatuses = ["CODE_REVIEW", "DEVELOPMENT"];
      }
      break;
    case "CODE_REVIEW":
      if (["MANAGER", "TEAMLEAD", "BUSINESS_ANALYST"].includes(userRole)) {
        allowedStatuses = ["DEVELOPMENT", "UAT_TESTING"];
      }
      break;
    case "UAT_TESTING":
      if (["TESTER", "QA_MANAGER"].includes(userRole)) {
        allowedStatuses = ["PREPROD", "UAT_FAILED"];
      }
      break;
    case "SIT_FAILED":
      if (userRole === "DEVELOPER") {
        allowedStatuses = ["DEVELOPMENT"];
      }
      break;
    case "UAT_FAILED":
      if (userRole === "DEVELOPER") {
        allowedStatuses = ["DEVELOPMENT"];
      }
      break;
    case "REOPENED":
      if (userRole === "DEVELOPER") {
        allowedStatuses = ["DEVELOPMENT"];
      }
      break;
    case "PREPROD":
      if (["MANAGER", "ADMIN"].includes(userRole)) {
        allowedStatuses = ["PROD"];
      }
      break;
    default:
      allowedStatuses = [];
  }

  return allStatuses.filter(status => allowedStatuses.includes(status.value));
};

export const requiresComment = (currentStatus: string, newStatus: string): boolean => {
  // Comment is mandatory when current status is CODE_REVIEW and a transition is available
  return currentStatus === "CODE_REVIEW" && getAvailableStatuses(currentStatus, "").length > 0; // Role is not relevant for this check
};

export const requiresCommitId = (newStatus: string): boolean => {
  return ["UAT_TESTING", "PREPROD"].includes(newStatus);
};


