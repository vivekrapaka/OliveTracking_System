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
  Link
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

  // Convert backend data to frontend format
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
      priority: backendTask.priority,
      projectId: backendTask.projectId,
      projectName: backendTask.projectName,
      documentPath: backendTask.documentPath,
      commitId: backendTask.commitId
    };
  };

  // Convert API data to component state
  const apiTasksData = tasksApiData?.tasks?.map(convertBackendToFrontend) || [];
  const [tasksData, setTasksData] = useState<Task[]>([]);

  // Update local state when API data changes
  useEffect(() => {
    if (apiTasksData.length > 0) {
      setTasksData(apiTasksData);
    }
  }, [apiTasksData]);

  // Convert teammates data for the dialog
  const teammates = teammatesApiData?.teammates?.map(teammate => ({
    id: teammate.id,
    name: teammate.name,
    role: teammate.role
  })) || [];

  // Filter tasks based on search and filters
  const filteredTasks = tasksData.filter(task => {
    const matchesSearch = searchTerm === "" || 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(task.status);
    const matchesTaskType = selectedTaskTypes.length === 0 || selectedTaskTypes.includes(task.taskType);
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);

    return matchesSearch && matchesStatus && matchesTaskType && matchesPriority;
  });

  // Filter options for dropdowns
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
      case "BACKLOG": return "bg-gray-100 text-gray-800 border-gray-200";
      case "ANALYSIS": return "bg-blue-100 text-blue-800 border-blue-200";
      case "DEVELOPMENT": return "bg-purple-100 text-purple-800 border-purple-200";
      case "SIT_TESTING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "SIT_FAILED": return "bg-red-100 text-red-800 border-red-200";
      case "UAT_TESTING": return "bg-orange-100 text-orange-800 border-orange-200";
      case "UAT_FAILED": return "bg-red-100 text-red-800 border-red-200";
      case "PREPROD": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "PROD": return "bg-green-100 text-green-800 border-green-200";
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
      case "CLOSED": return "bg-gray-100 text-gray-800 border-gray-200";
      case "REOPENED": return "bg-red-100 text-red-800 border-red-200";
      case "BLOCKED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case "BRD": return "bg-blue-100 text-blue-800 border-blue-200";
      case "EPIC": return "bg-purple-100 text-purple-800 border-purple-200";
      case "STORY": return "bg-green-100 text-green-800 border-green-200";
      case "TASK": return "bg-gray-100 text-gray-800 border-gray-200";
      case "BUG": return "bg-red-100 text-red-800 border-red-200";
      case "SUB_TASK": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    const normalizedPriority = priority.toLowerCase();
    switch (normalizedPriority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": 
      case "hig": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load tasks</h3>
          <p className="text-slate-600 mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-600 mt-1">Manage and track your project tasks</p>
        </div>

        <div className="flex items-center space-x-2">
          {user?.role && ["ADMIN", "MANAGER", "BA","TEAMLEAD"].includes(user.role) && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsCreateModalOpen(true)}
              data-testid="add-task-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search tasks by name or task number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
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
              className="text-slate-600 hover:text-slate-900"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-slate-600">
          Showing {filteredTasks.length} of {tasksData.length} tasks
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-slate-900">{tasksApiData?.totalTasksCount || 0}</div>
            <p className="text-sm text-slate-600">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {tasksData.filter(t => t.status === "DEVELOPMENT" || t.status === "SIT_TESTING").length}
            </div>
            <p className="text-sm text-slate-600">In Development</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {tasksData.filter(t => t.status === "UAT_TESTING").length}
            </div>
            <p className="text-sm text-slate-600">In Testing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {tasksData.filter(t => t.status === "COMPLETED").length}
            </div>
            <p className="text-sm text-slate-600">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg transition-colors",
                  task.status === "COMPLETED" ? "bg-green-50" : 
                  task.status === "BLOCKED" ? "bg-red-50" : 
                  "bg-slate-50 hover:bg-slate-100"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs font-bold border border-gray-600">
                      {task.taskNumber}
                    </div>
                    <h3 className="font-medium text-slate-900">{task.name}</h3>
                  </div>
                  {task.description && (
                    <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                  )}
                  {/* Parent Task Link */}
                  {task.parentTaskTitle && (
                    <div className="flex items-center gap-2 mb-2">
                      <Link className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        Parent: {task.parentTaskFormattedNumber} - {task.parentTaskTitle}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
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
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {task.assignedTeammates.join(", ")}
                    </span>
                    {task.projectName && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user?.role && ["ADMIN", "MANAGER", "BA"].includes(user.role) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete task "{task.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTask(task)}
                              className="bg-red-600 hover:bg-red-700"
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
            ))}
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
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks found</h3>
          <p className="text-slate-600">Try adjusting your search criteria or add a new task.</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
