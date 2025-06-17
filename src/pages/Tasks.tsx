import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Users
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { FilterDropdown } from "@/components/FilterDropdown";
import { useTasksData, BackendTask } from "@/hooks/useTasksData";
import { useTeammatesData } from "@/hooks/useTeammatesData";
import { EditTaskDialog } from "@/components/EditTaskDialog";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: number;
  taskNumber: string;
  name: string;
  description?: string;
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

export const Tasks = () => {
  const { user } = useAuth();
  const { data: tasksApiData, isLoading, error } = useTasksData();
  const { data: teammatesApiData } = useTeammatesData();
  const deleteTaskMutation = useDeleteTask();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>([]);

  // Convert backend data to frontend format
  const convertBackendToFrontend = (backendTask: BackendTask): Task => {
    return {
      id: backendTask.id,
      taskNumber: backendTask.taskNumber,
      name: backendTask.name,
      description: backendTask.description,
      issueType: backendTask.issueType,
      receivedDate: backendTask.receivedDate,
      developmentStartDate: backendTask.developmentStartDate,
      currentStage: backendTask.currentStage,
      dueDate: backendTask.dueDate,
      assignedTeammates: backendTask.assignedTeammates,
      priority: backendTask.priority,
      isCompleted: backendTask.isCompleted,
      isCmcDone: backendTask.isCmcDone
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

    const matchesStage = selectedStages.length === 0 || selectedStages.includes(task.currentStage);
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);
    const matchesIssueType = selectedIssueTypes.length === 0 || selectedIssueTypes.includes(task.issueType);

    return matchesSearch && matchesStage && matchesPriority && matchesIssueType;
  });

  // Filter options for dropdowns
  const filterOptions = {
    stages: [...new Set(tasksData.map(t => t.currentStage))].map(s => ({ 
      label: s, 
      value: s, 
      count: tasksData.filter(t => t.currentStage === s).length 
    })),
    priorities: [...new Set(tasksData.map(t => t.priority))].map(p => ({ 
      label: p, 
      value: p, 
      count: tasksData.filter(t => t.priority === p).length 
    })),
    issueTypes: [...new Set(tasksData.map(t => t.issueType))].map(i => ({ 
      label: i, 
      value: i, 
      count: tasksData.filter(t => t.issueType === i).length 
    }))
  };

  const activeFiltersCount = selectedStages.length + selectedPriorities.length + selectedIssueTypes.length;

  const clearAllFilters = () => {
    setSelectedStages([]);
    setSelectedPriorities([]);
    setSelectedIssueTypes([]);
    setSearchTerm("");
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

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Planning": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Development":
      case "DEV": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Review": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Testing":
      case "SIT": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "HOLD": return "bg-red-100 text-red-800 border-red-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIssueTypeColor = (issueType: string) => {
    const normalizedType = issueType.toLowerCase();
    switch (normalizedType) {
      case "bug": return "bg-red-100 text-red-800 border-red-200";
      case "feature": return "bg-blue-100 text-blue-800 border-blue-200";
      case "task": return "bg-green-100 text-green-800 border-green-200";
      case "enhancement": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    deleteTaskMutation.mutate(task.name);
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
          {/* Only show Add Task button for ADMIN, MANAGER, BA */}
          {user?.role && ['ADMIN', 'MANAGER', 'BA'].includes(user.role) && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsCreateModalOpen(true)}
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
            title="Stage"
            options={filterOptions.stages}
            selectedValues={selectedStages}
            onSelectionChange={setSelectedStages}
          />
          <FilterDropdown
            title="Priority"
            options={filterOptions.priorities}
            selectedValues={selectedPriorities}
            onSelectionChange={setSelectedPriorities}
          />
          <FilterDropdown
            title="Issue Type"
            options={filterOptions.issueTypes}
            selectedValues={selectedIssueTypes}
            onSelectionChange={setSelectedIssueTypes}
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
              {tasksData.filter(t => t.currentStage === "Development" || t.currentStage === "DEV").length}
            </div>
            <p className="text-sm text-slate-600">In Development</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {tasksData.filter(t => t.currentStage === "Testing" || t.currentStage === "SIT").length}
            </div>
            <p className="text-sm text-slate-600">In Testing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {tasksData.filter(t => t.currentStage === "Completed").length}
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
                  task.currentStage === "Completed" ? "bg-green-50" : 
                  task.currentStage === "HOLD" ? "bg-red-50" : 
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
                    <span className={cn(
                      "flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      task.isCmcDone ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                      CMC: {task.isCmcDone ? "Done" : "Pending"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getIssueTypeColor(task.issueType)}>
                    {task.issueType}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge className={getStageColor(task.currentStage)}>
                    {task.currentStage}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {/* Edit button - visible to all roles but with different permissions */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {/* Delete button - only visible to ADMIN, MANAGER, BA */}
                    {user?.role && ['ADMIN', 'MANAGER', 'BA'].includes(user.role) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the task "{task.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTask(task)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
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

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        teammates={teammates}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        teammates={teammates}
      />

      {filteredTasks.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks found</h3>
          <p className="text-slate-600">Try adjusting your search criteria or add a new task.</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
