import { useMemo } from "react";

interface Task {
  id: number;
  assignedTeammates: string[];
  currentStage: string;
}

interface Teammate {
  id: number;
  name: string;
  availabilityStatus: string;
}

export const useTeammateAvailability = (tasks: Task[], teammates: Teammate[]) => {
  const updatedTeammates = useMemo(() => {
    return teammates.map(teammate => {
      // Check if teammate has any active tasks (not completed)
      const hasActiveTasks = tasks.some(task =>
        task.assignedTeammates.includes(teammate.name) &&
        task.currentStage !== "Completed"
      );

      // Update availability status based on task assignment
      const newStatus = hasActiveTasks ? "Occupied" : "Available";

      return {
        ...teammate,
        availabilityStatus: newStatus
      };
    });
  }, [tasks, teammates]);

  return updatedTeammates;
};