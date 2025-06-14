
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

export const useTeammateFilters = (teammates: Teammate[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedAvailabilityStatus, setSelectedAvailabilityStatus] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [minTasksAssigned, setMinTasksAssigned] = useState<number>(0);
  const [maxTasksAssigned, setMaxTasksAssigned] = useState<number>(100);

  const filteredTeammates = useMemo(() => {
    return teammates.filter(teammate => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        teammate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teammate.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teammate.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teammate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teammate.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDepartment = selectedDepartments.length === 0 || 
        selectedDepartments.includes(teammate.department);

      // Role filter
      const matchesRole = selectedRoles.length === 0 || 
        selectedRoles.includes(teammate.role);

      // Availability filter
      const matchesAvailability = selectedAvailabilityStatus.length === 0 || 
        selectedAvailabilityStatus.includes(teammate.availabilityStatus);

      // Location filter
      const matchesLocation = selectedLocations.length === 0 || 
        selectedLocations.includes(teammate.location);

      // Tasks assigned filter
      const matchesTaskRange = teammate.tasksAssigned >= minTasksAssigned && 
        teammate.tasksAssigned <= maxTasksAssigned;

      return matchesSearch && matchesDepartment && matchesRole && 
             matchesAvailability && matchesLocation && matchesTaskRange;
    });
  }, [teammates, searchTerm, selectedDepartments, selectedRoles, 
      selectedAvailabilityStatus, selectedLocations, minTasksAssigned, maxTasksAssigned]);

  const filterOptions = useMemo(() => {
    const departments = [...new Set(teammates.map(t => t.department))];
    const roles = [...new Set(teammates.map(t => t.role))];
    const availabilityStatuses = [...new Set(teammates.map(t => t.availabilityStatus))];
    const locations = [...new Set(teammates.map(t => t.location))];

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
      })),
      locations: locations.map(l => ({ 
        label: l, 
        value: l, 
        count: teammates.filter(t => t.location === l).length 
      }))
    };
  }, [teammates]);

  const activeFiltersCount = selectedDepartments.length + selectedRoles.length + 
                            selectedAvailabilityStatus.length + selectedLocations.length +
                            (minTasksAssigned > 0 ? 1 : 0) + (maxTasksAssigned < 100 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedRoles([]);
    setSelectedAvailabilityStatus([]);
    setSelectedLocations([]);
    setMinTasksAssigned(0);
    setMaxTasksAssigned(100);
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
    selectedLocations,
    setSelectedLocations,
    minTasksAssigned,
    setMinTasksAssigned,
    maxTasksAssigned,
    setMaxTasksAssigned,
    filteredTeammates,
    filterOptions,
    activeFiltersCount,
    clearAllFilters
  };
};
