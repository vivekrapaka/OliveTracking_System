
import { useState, useMemo } from "react";

interface Teammate {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  availabilityStatus: string;
  location: string;
  avatar: string;
  tasksAssigned: number;
  tasksCompleted: number;
}

interface Task {
  id: number;
  assignedTeammates: string[];
  currentStage: string;
}

export const useTeammateFilters = (teammates: Teammate[], tasks: Task[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedAvailabilityStatus, setSelectedAvailabilityStatus] = useState<string[]>([]);

  const filteredTeammates = useMemo(() => {
    return teammates.filter(teammate => {
      // Search filter - focused on name search
      const matchesSearch = searchTerm === "" || 
        teammate.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDepartment = selectedDepartments.length === 0 || 
        selectedDepartments.includes(teammate.department);

      // Role filter
      const matchesRole = selectedRoles.length === 0 || 
        selectedRoles.includes(teammate.role);

      // Availability filter
      const matchesAvailability = selectedAvailabilityStatus.length === 0 || 
        selectedAvailabilityStatus.includes(teammate.availabilityStatus);

      return matchesSearch && matchesDepartment && matchesRole && matchesAvailability;
    });
  }, [teammates, searchTerm, selectedDepartments, selectedRoles, selectedAvailabilityStatus]);

  const filterOptions = useMemo(() => {
    const departments = [...new Set(teammates.map(t => t.department))];
    const roles = [...new Set(teammates.map(t => t.role))];
    const availabilityStatuses = [...new Set(teammates.map(t => t.availabilityStatus))];

    return {
      departments: departments.map(d => ({ 
        label: d, 
        value: d, 
        count: teammates.filter(t => t.department === d).length 
      })),
      roles: roles.map(r => ({ 
        label: r, 
        value: r, 
        count: teammates.filter(t => t.role === r).length 
      })),
      availabilityStatuses: availabilityStatuses.map(a => ({ 
        label: a, 
        value: a, 
        count: teammates.filter(t => t.availabilityStatus === a).length 
      }))
    };
  }, [teammates]);

  const activeFiltersCount = selectedDepartments.length + selectedRoles.length + 
                            selectedAvailabilityStatus.length;

  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedRoles([]);
    setSelectedAvailabilityStatus([]);
    setSearchTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedDepartments,
    setSelectedDepartments,
    selectedRoles,
    setSelectedRoles,
    selectedAvailabilityStatus,
    setSelectedAvailabilityStatus,
    filteredTeammates,
    filterOptions,
    activeFiltersCount,
    clearAllFilters
  };
};
