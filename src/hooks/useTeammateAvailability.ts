import { useMemo } from "react";

interface Task {
  id: number;
  assignedTeammates: string[];
  currentStage: string;
}

interface Teammate {
  id: number;
  name: string;
  availabilityStatus: string; // "Available" | "Occupied" | "Leave"
}

export const useTeammateAvailability = (tasks: Task[], teammates: Teammate[]) => {
  // Simply return the teammates with their manually set status
  return teammates;
};
