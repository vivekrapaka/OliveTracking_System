
import { useState, useMemo } from "react";

interface Task {
  id: number;
  taskNumber: string;
  name: string;
  description: string;
  issueType: string;
  receivedDate: string;
  developmentStartDate: string;
  currentStage: string;
  dueDate: string;
  assignedTeammates: string[];
  priority: string;
  isCompleted: boolean;
  isCmcDone: boolean;
}

export const useTaskFilters = (tasks: Task[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>([]);
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [showCmcDoneOnly, setShowCmcDoneOnly] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.currentStage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.taskNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTeammates.some(teammate => 
          teammate.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Priority filter
      const matchesPriority = selectedPriorities.length === 0 || 
        selectedPriorities.includes(task.priority);

      // Stage filter
      const matchesStage = selectedStages.length === 0 || 
        selectedStages.includes(task.currentStage);

      // Issue type filter
      const matchesIssueType = selectedIssueTypes.length === 0 || 
        selectedIssueTypes.includes(task.issueType);

      // Teammate filter
      const matchesTeammate = selectedTeammates.length === 0 || 
        task.assignedTeammates.some(teammate => selectedTeammates.includes(teammate));

      // Completion filter
      const matchesCompletion = !showCompletedOnly || task.isCompleted;

      // CMC filter
      const matchesCmc = !showCmcDoneOnly || task.isCmcDone;

      return matchesSearch && matchesPriority && matchesStage && 
             matchesIssueType && matchesTeammate && matchesCompletion && matchesCmc;
    });
  }, [tasks, searchTerm, selectedPriorities, selectedStages, selectedIssueTypes, 
      selectedTeammates, showCompletedOnly, showCmcDoneOnly]);

  const filterOptions = useMemo(() => {
    const priorities = [...new Set(tasks.map(t => t.priority))];
    const stages = [...new Set(tasks.map(t => t.currentStage))];
    const issueTypes = [...new Set(tasks.map(t => t.issueType))];
    const teammates = [...new Set(tasks.flatMap(t => t.assignedTeammates))];

    return {
      priorities: priorities.map(p => ({ 
        label: p, 
        value: p, 
        count: tasks.filter(t => t.priority === p).length 
      })),
      stages: stages.map(s => ({ 
        label: s, 
        value: s, 
        count: tasks.filter(t => t.currentStage === s).length 
      })),
      issueTypes: issueTypes.map(i => ({ 
        label: i, 
        value: i, 
        count: tasks.filter(t => t.issueType === i).length 
      })),
      teammates: teammates.map(tm => ({ 
        label: tm, 
        value: tm, 
        count: tasks.filter(t => t.assignedTeammates.includes(tm)).length 
      }))
    };
  }, [tasks]);

  const activeFiltersCount = selectedPriorities.length + selectedStages.length + 
                            selectedIssueTypes.length + selectedTeammates.length +
                            (showCompletedOnly ? 1 : 0) + (showCmcDoneOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedPriorities([]);
    setSelectedStages([]);
    setSelectedIssueTypes([]);
    setSelectedTeammates([]);
    setShowCompletedOnly(false);
    setShowCmcDoneOnly(false);
    setSearchTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedPriorities,
    setSelectedPriorities,
    selectedStages,
    setSelectedStages,
    selectedIssueTypes,
    setSelectedIssueTypes,
    selectedTeammates,
    setSelectedTeammates,
    showCompletedOnly,
    setShowCompletedOnly,
    showCmcDoneOnly,
    setShowCmcDoneOnly,
    filteredTasks,
    filterOptions,
    activeFiltersCount,
    clearAllFilters
  };
};
