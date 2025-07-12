import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  Link,
  Lock
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { FilterDropdown } from "@/components/FilterDropdown";
import { useTasksData, BackendTask } from "@/hooks/useTasksData";
import { useTeammatesData } from "@/hooks/useTeammatesData";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { useAuth } from "@/contexts/AuthContext";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";

interface Task {
  id: number;
  taskNumber: string;
  name: string;
  description?: string;
  status: string;
  taskType: string;
  parentId?: number;
  parentTaskTitle?: string;
  parentTaskFormattedNumber?: string;
  receivedDate: string;
  developmentStartDate: string;
  dueDate: string;
  assignedTeammates: string[];
  assignedTeammateIds: number[];
  developerName?: string;
  testerName?: string;
  priority: string;
  projectId: number;
  projectName: string;
  documentPath?: string;
  commitId?: string;
}

export const Tasks = () => {
  const { user } = useAuth();
  const { data: tasksApiData, isLoading, error } = useTasksData();
  const { data: teammatesApiData } = useTeammatesData();
  const deleteTaskMutation = useDeleteTask();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const convertBackendToFrontend = (backendTask: BackendTask): Task => {
    return {
      id: backendTask.id,
      taskNumber: backendTask.taskNumber,
      name: backendTask.name,
      description: backendTask.description,
      status: backendTask.status,
      taskType: backendTask.taskType,
      parentId: backendTask.parentId,
      parentTaskTitle: backendTask.parentTaskTitle,
      parentTaskFormattedNumber: backendTask.parentTaskFormattedNumber,
      receivedDate: backendTask.receivedDate,
      developmentStartDate: backendTask.developmentStartDate,
      dueDate: backendTask.dueDate,
      assignedTeammates: backendTask.assignedTeammateNames || [],
      assignedTeammateIds: backendTask.assignedTeammateIds || [],
      developerName: backendTask.developerName,
      testerName: backendTask.testerName,
      priority: backendTask.priority,
      projectId: backendTask.projectId,
      projectName: backendTask.projectName,
      documentPath: backendTask.documentPath,
      commitId: backendTask.commitId
    };
  };

  const apiTasksData = tasksApiData?.tasks?.map(convertBackendToFrontend) || [];
  const [tasksData, setTasksData] = useState<Task[]>([]);

  useEffect(() => {
    if (apiTasksData.length > 0) {
      setTasksData(apiTasksData);
    }
  }, [apiTasksData]);

  const teammates = teammatesApiData?.teammates?.map(teammate => ({
    id: teammate.id,
    name: teammate.name,
    role: teammate.role
  })) || [];

  // Check if current user can edit a task
  const canEditTask = (task: Task): boolean => {
    if (!user?.fullName || !user?.functionalGroup) return false;
    
    // Managers and analysts can edit all tasks
    const managerRoles = ["ADMIN", "MANAGER", "DEV_MANAGER", "TEST_MANAGER", "DEV_LEAD", "TEST_LEAD", "BUSINESS_ANALYST"];
    if (managerRoles.includes(user.functionalGroup)) {
      return true;
    }
    
    // Regular developers and testers can only edit if they are assigned
    const isAssignedDeveloper = task.developerName === user.fullName;
    const isAssignedTester = task.testerName === user.fullName;
    
    return isAssignedDeveloper || isAssignedTester;
  };

  // Check if task is assigned to current user (for highlighting)
  const isTaskAssignedToUser = (task: Task): boolean => {
    if (!user?.fullName) return false;
    return task.developerName === user.fullName || task.testerName === user.fullName;
  };

  const filteredTasks = tasksData.filter(task => {
    const matchesSearch = searchTerm === "" || 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(task.status);
    const matchesTaskType = selectedTaskTypes.length === 0 || selectedTaskTypes.includes(task.taskType);
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);

    return matchesSearch && matchesStatus && matchesTaskType && matchesPriority;
  });

  const filterOptions = {
    statuses: [...new Set(tasksData.map(t => t.status))].map(s => ({ 
      label: s, 
      value: s, 
      count: tasksData.filter(t => t.status === s).length 
    })),
    taskTypes: [...new Set(tasksData.map(t => t.taskType))].map(t => ({ 
      label: t, 
      value: t, 
      count: tasksData.filter(task => task.taskType === t).length 
    })),
    priorities: [...new Set(tasksData.map(t => t.priority))].map(p => ({ 
      label: p, 
      value: p, 
      count: tasksData.filter(t => t.priority === p).length 
    }))
  };

  const activeFiltersCount = selectedStatuses.length + selectedTaskTypes.length + selectedPriorities.length;

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedTaskTypes([]);
    setSelectedPriorities([]);
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BACKLOG": return "bg-professional-gray-light text-professional-gray-dark border-professional-gray-dark";
      case "ANALYSIS": return "bg-professional-blue-light text-professional-blue-dark border-professional-blue-dark";
      case "DEVELOPMENT": return "bg-professional-purple-light text-professional-purple-dark border-professional-purple-dark";
      case "SIT_TESTING": return "bg-professional-orange-light text-professional-orange-dark border-professional-orange-dark";
      case "SIT_FAILED": return "bg-professional-red-light text-professional-red-dark border-professional-red-dark";
      case "UAT_TESTING": return "bg-professional-orange-light text-professional-orange-dark border-professional-orange-dark";
      case "UAT_FAILED": return "bg-professional-red-light text-professional-red-dark border-professional-red-dark";
      case "PREPROD": return "bg-professional-indigo-light text-professional-indigo-dark border-professional-indigo-dark";
      case "PROD": return "bg-professional-green-light text-professional-green-dark border-professional-green-dark";
      case "COMPLETED": return "bg-professional-green-light text-professional-green-dark border-professional-green-dark";
      case "CLOSED": return "bg-professional-gray-light text-professional-gray-dark border-professional-gray-dark";
      case "REOPENED": return "bg-professional-red-light text-professional-red-dark border-professional-red-dark";
      case "BLOCKED": return "bg-professional-red-light text-professional-red-dark border-professional-red-dark";
      default: return "bg-professional-gray-light text-professional-gray-dark border-professional-gray-dark";
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case "BRD": return "bg-professional-blue-light text-professional-blue-dark border-professional-blue-dark";
      case "EPIC": return "bg-professional-purple-light text-professional-purple-dark border-professional-purple-dark";
      case "STORY": return "bg-professional-green-light text-professional-green-dark border-professional-green-dark";
      case "TASK": return "bg-professional-gray-light text-professional-gray-dark border-professional-gray-dark";
      case "BUG": return "bg-professional-red-light text-professional-red-dark border-professional-red-dark";
      case "SUB_TASK": return "bg-professional-orange-light text-professional-orange-dark border-professional-orange-dark";
      default: return "bg-professional-gray-light text-professional-gray-dark border-professional-gray-dark";
    }
  };

  const getPriorityColor = (priority: string) => {
    const normalizedPriority = priority.toLowerCase();
    switch (normalizedPriority) {
      case "critical": return "bg-professional-red-light text-professional-red-dark border-professional-red-dark";
      case "high": 
      case "hig": return "bg-professional-orange-light text-professional-orange-dark border-professional-orange-dark";
      case "medium": return "bg-professional-yellow-light text-professional-yellow-dark border-professional-yellow-dark";
      case "low": return "bg-professional-green-light text-professional-green-dark border-professional-green-dark";
      default: return "bg-professional-gray-light text-professional-gray-dark border-professional-gray-dark";
    }
  };

  const handleViewTask = (task: Task) => {
    console.log("View task:", task);
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    deleteTaskMutation.mutate(task.id);
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasksData(tasksData.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  // Check if user can create tasks - exclude TEST roles
  const canCreateTasks = user?.functionalGroup && 
    ["ADMIN", "MANAGER", "DEV_MANAGER", "BUSINESS_ANALYST", "DEV_LEAD"].includes(user.functionalGroup);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-professional-blue/5 to-professional-cyan/5">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-professional-blue" />
          <p className="text-professional-slate-dark">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-professional-blue/5 to-professional-cyan/5">
        <div className="text-professional-red mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load tasks</h3>
          <p className="text-professional-slate-dark mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-professional-blue/5 to-professional-cyan/5 min-h-screen">
      {/* Header with Professional styling */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white/80 backdrop-blur-md border-b border-professional-slate/20 p-6 shadow-professional">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-professional-blue to-professional-cyan bg-clip-text text-transparent">Tasks</h1>
          <p className="text-professional-slate-dark mt-1">Manage and track your project tasks</p>
        </div>

        <div className="flex items-center space-x-2">
          {canCreateTasks && (
            <Button 
              className="bg-gradient-to-r from-professional-blue to-professional-cyan hover:from-professional-blue-dark hover:to-professional-cyan-dark text-white shadow-professional"
              onClick={() => setIsCreateModalOpen(true)}
              data-testid="add-task-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      <div className="px-6">
        {/* Search and Filters with Professional styling */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-professional-slate-dark h-4 w-4" />
            <Input
              placeholder="Search tasks by name or task number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-md border-professional-slate/30 focus:border-professional-blue focus:ring-professional-blue/20"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <FilterDropdown
              title="Status"
              options={filterOptions.statuses}
              selectedValues={selectedStatuses}
              onSelectionChange={setSelectedStatuses}
            />
            <FilterDropdown
              title="Task Type"
              options={filterOptions.taskTypes}
              selectedValues={selectedTaskTypes}
              onSelectionChange={setSelectedTaskTypes}
            />
            <FilterDropdown
              title="Priority"
              options={filterOptions.priorities}
              selectedValues={selectedPriorities}
              onSelectionChange={setSelectedPriorities}
            />

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-professional-slate-dark hover:text-professional-blue hover:bg-professional-blue/10"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-professional-slate-dark">
            Showing {filteredTasks.length} of {tasksData.length} tasks
          </div>
        </div>

        {/* Task Stats with Professional cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-6">
          <Card className="bg-white/80 backdrop-blur-md border-professional-slate/20 shadow-professional hover:shadow-professional-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="text-2xl font-bold bg-gradient-to-r from-professional-blue to-professional-cyan bg-clip-text text-transparent">{tasksApiData?.totalTasksCount || 0}</div>
              <p className="text-sm text-professional-slate-dark">Total Tasks</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-md border-professional-slate/20 shadow-professional hover:shadow-professional-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-professional-blue">
                {tasksData.filter(t => t.status === "DEVELOPMENT" || t.status === "ANALYSIS").length}
              </div>
              <p className="text-sm text-professional-slate-dark">In Development</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-md border-professional-slate/20 shadow-professional hover:shadow-professional-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-professional-orange">
                {tasksData.filter(t => t.status === "UAT_TESTING").length}
              </div>
              <p className="text-sm text-professional-slate-dark">In Testing</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-md border-professional-slate/20 shadow-professional hover:shadow-professional-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-professional-green">
                {tasksData.filter(t => t.status === "COMPLETED").length}
              </div>
              <p className="text-sm text-professional-slate-dark">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table with Professional styling */}
        <Card className="bg-white/80 backdrop-blur-md border-professional-slate/20 shadow-professional-lg">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-professional-blue to-professional-cyan bg-clip-text text-transparent">All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const isAssigned = isTaskAssignedToUser(task);
                const canEdit = canEditTask(task);
                return (
                  <div 
                    key={task.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg transition-all duration-200 border",
                      // Highlight assigned tasks
                      isAssigned 
                        ? "border-professional-blue/50 bg-gradient-to-r from-professional-blue/10 to-professional-cyan/5 shadow-professional ring-2 ring-professional-blue/20" 
                        : "border-professional-slate/20",
                      task.status === "COMPLETED" ? "bg-professional-green/5" : 
                      task.status === "BLOCKED" ? "bg-professional-red/5" : 
                      "bg-white/50 hover:bg-professional-blue/5"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <div className="bg-gradient-to-r from-professional-navy to-professional-blue text-white px-2 py-1 rounded font-mono text-xs font-bold shadow-sm">
                          {task.taskNumber}
                        </div>
                        <h3 className="font-medium text-professional-navy">{task.name}</h3>
                        {isAssigned && (
                          <Badge className="bg-professional-green/10 text-professional-green-dark border-professional-green/20 text-xs">
                            Assigned to You
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-professional-slate-dark mb-2 line-clamp-2">{task.description}</p>
                      )}
                      {/* Parent Task Link */}
                      {task.parentTaskTitle && (
                        <div className="flex items-center gap-2 mb-2">
                          <Link className="h-3 w-3 text-professional-slate-dark" />
                          <span className="text-xs text-professional-slate-dark">
                            Parent: {task.parentTaskFormattedNumber} - {task.parentTaskTitle}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-professional-slate-dark">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Received: {format(new Date(task.receivedDate), "MMM dd, yyyy")}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Start: {format(new Date(task.developmentStartDate), "MMM dd, yyyy")}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                        </span>
                        {/* Display developer and tester names */}
                        {(task.developerName || task.testerName) && (
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {[task.developerName, task.testerName].filter(Boolean).join(", ")}
                          </span>
                        )}
                        {task.projectName && (
                          <span className="text-xs bg-professional-cyan/10 text-professional-cyan-dark px-2 py-1 rounded border border-professional-cyan/20">
                            {task.projectName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTaskTypeColor(task.taskType)}>
                        {task.taskType}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {/* Edit button - based on new permission logic */}
                        {canEdit ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTask(task)}
                            className="hover:bg-professional-blue/10 text-professional-blue hover:text-professional-blue-dark"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="opacity-50 cursor-not-allowed"
                            title="You don't have permission to edit this task"
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Delete button - only for admins and managers */}
                        {user?.functionalGroup && ["ADMIN", "MANAGER", "BUSINESS_ANALYST"].includes(user.functionalGroup) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-professional-red/10 text-professional-red hover:text-professional-red-dark">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white/95 backdrop-blur-md border-professional-slate/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-professional-navy">Delete Task</AlertDialogTitle>
                                <AlertDialogDescription className="text-professional-slate-dark">
                                  Are you sure you want to delete task "{task.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-professional-slate/10">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTask(task)}
                                  className="bg-professional-red hover:bg-professional-red-dark text-white"
                                  disabled={deleteTaskMutation.isPending}
                                >
                                  {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Add Task Modal */}
        <AddTaskDialog 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}   
          teammates={teammates}
        />

        {/* Task Details Modal */}
        <TaskDetailsDialog 
          isOpen={isDetailsModalOpen} 
          onClose={() => setIsDetailsModalOpen(false)} 
          task={selectedTask} 
          onSave={handleSaveTask} 
          teammates={teammates} 
        />

        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-xl border border-professional-slate/20">
            <Users className="h-12 w-12 text-professional-slate-dark mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-professional-navy mb-2">No tasks found</h3>
            <p className="text-professional-slate-dark">Try adjusting your search criteria or add a new task.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
