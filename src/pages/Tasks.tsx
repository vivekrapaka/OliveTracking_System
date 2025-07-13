import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Code,
  TestTube,
  Target,
  Timer
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTasksData } from "@/hooks/useTasksData";
import { useTeammatesData } from "@/hooks/useTeammatesData";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";

// Helper function to safely format dates
const formatSafeDate = (dateString: string, formatStr: string = "MMM dd, yyyy") => {
  try {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    if (!isValid(date)) return "N/A";
    return format(date, formatStr);
  } catch (error) {
    console.warn("Invalid date format:", dateString);
    return "N/A";
  }
};

// Helper function to get status badge styling
const getStatusBadgeClass = (status: string) => {
  const statusClasses = {
    'BACKLOG': 'bg-professional-slate/10 text-professional-slate-dark border-professional-slate/30',
    'ANALYSIS': 'bg-professional-purple/10 text-professional-purple-dark border-professional-purple/30',
    'DEVELOPMENT': 'bg-professional-blue/10 text-professional-blue-dark border-professional-blue/30',
    'CODE_REVIEW': 'bg-professional-cyan/10 text-professional-cyan-dark border-professional-cyan/30',
    'UAT_TESTING': 'bg-professional-yellow/10 text-professional-yellow-dark border-professional-yellow/30',
    'UAT_FAILED': 'bg-professional-red/10 text-professional-red-dark border-professional-red/30',
    'READY_FOR_PREPROD': 'bg-professional-green/10 text-professional-green-dark border-professional-green/30',
    'PREPROD': 'bg-professional-indigo/10 text-professional-indigo-dark border-professional-indigo/30',
    'PROD': 'bg-professional-emerald/10 text-professional-emerald-dark border-professional-emerald/30',
    'COMPLETED': 'bg-professional-green/10 text-professional-green-dark border-professional-green/30',
    'CLOSED': 'bg-professional-slate/10 text-professional-slate-dark border-professional-slate/30',
    'REOPENED': 'bg-professional-orange/10 text-professional-orange-dark border-professional-orange/30',
    'BLOCKED': 'bg-professional-red/10 text-professional-red-dark border-professional-red/30'
  };
  return statusClasses[status as keyof typeof statusClasses] || statusClasses.BACKLOG;
};

// Helper function to get priority badge styling
const getPriorityBadgeClass = (priority: string) => {
  const priorityClasses = {
    'CRITICAL': 'bg-professional-red/10 text-professional-red-dark border-professional-red/30',
    'HIGH': 'bg-professional-orange/10 text-professional-orange-dark border-professional-orange/30',
    'MEDIUM': 'bg-professional-yellow/10 text-professional-yellow-dark border-professional-yellow/30',
    'LOW': 'bg-professional-green/10 text-professional-green-dark border-professional-green/30'
  };
  return priorityClasses[priority as keyof typeof priorityClasses] || priorityClasses.MEDIUM;
};

export const Tasks = () => {
  const { user } = useAuth();
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useTasksData();
  const { data: teammatesData, isLoading: teammatesLoading } = useTeammatesData();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Check if user can add tasks (exclude TEST_LEAD, TESTER, TEST_MANAGER)
  const canAddTasks = user?.functionalGroup && !['TEST_LEAD', 'TESTER', 'TEST_MANAGER'].includes(user.functionalGroup);

  // Helper function to check if user can edit a task
  const canEditTask = (task: any) => {
    if (!user?.functionalGroup) return false;
    
    // Management roles can edit any task
    const managementRoles = ['ADMIN', 'MANAGER', 'DEV_MANAGER', 'TEST_MANAGER', 'DEV_LEAD', 'TEST_LEAD', 'BUSINESS_ANALYST'];
    if (managementRoles.includes(user.functionalGroup)) {
      return true;
    }
    
    // Check if user is assigned to the task based on their role and the task assignment
    const userFullName = user.fullName;
    if (user.functionalGroup === 'DEVELOPER' && task.developerName === userFullName) {
      return true;
    }
    if (['TESTER', 'TEST_LEAD'].includes(user.functionalGroup) && task.testerName === userFullName) {
      return true;
    }
    
    return false;
  };

  // Helper function to check if task is assigned to current user
  const isTaskAssignedToCurrentUser = (task: any) => {
    if (!user?.fullName) return false;
    
    const userFullName = user.fullName;
    if (user.functionalGroup === 'DEVELOPER' && task.developerName === userFullName) {
      return true;
    }
    if (['TESTER', 'TEST_LEAD'].includes(user.functionalGroup) && task.testerName === userFullName) {
      return true;
    }
    
    return false;
  };

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    if (!tasksData?.tasks) return [];

    return tasksData.tasks.filter((task) => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.taskNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesType = typeFilter === "all" || task.taskType === typeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [tasksData?.tasks, searchTerm, statusFilter, priorityFilter, typeFilter]);

  const handleTaskClick = (task: any) => {
    if (canEditTask(task)) {
      setSelectedTask(task);
      setIsDetailsDialogOpen(true);
    }
  };

  const handleTaskSave = (updatedTask: any) => {
    // Handle task update
    console.log('Task updated:', updatedTask);
  };

  if (tasksLoading || teammatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-professional-blue border-t-transparent mx-auto"></div>
          <p className="text-professional-slate-dark">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-professional-red mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load tasks</h3>
        <p className="text-professional-slate-dark">{tasksError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-professional-blue/5 to-professional-cyan/5 min-h-screen p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border border-professional-slate/20 rounded-xl p-6 shadow-professional">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-professional-blue to-professional-cyan bg-clip-text text-transparent">
              Tasks Management
            </h1>
            <p className="text-professional-slate-dark mt-1">
              Manage and track project tasks • {filteredTasks.length} tasks found
            </p>
          </div>
          {canAddTasks && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="professional-button shadow-professional-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="professional-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-professional-slate-dark h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 professional-input"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="professional-input">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-professional-slate/30">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="BACKLOG">Backlog</SelectItem>
                <SelectItem value="ANALYSIS">Analysis</SelectItem>
                <SelectItem value="DEVELOPMENT">Development</SelectItem>
                <SelectItem value="CODE_REVIEW">Code Review</SelectItem>
                <SelectItem value="UAT_TESTING">UAT Testing</SelectItem>
                <SelectItem value="UAT_FAILED">UAT Failed</SelectItem>
                <SelectItem value="READY_FOR_PREPROD">Ready for Pre-Prod</SelectItem>
                <SelectItem value="PREPROD">Pre-Production</SelectItem>
                <SelectItem value="PROD">Production</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="professional-input">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-professional-slate/30">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="professional-input">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-professional-slate/30">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="BRD">BRD</SelectItem>
                <SelectItem value="EPIC">Epic</SelectItem>
                <SelectItem value="STORY">Story</SelectItem>
                <SelectItem value="TASK">Task</SelectItem>
                <SelectItem value="BUG">Bug</SelectItem>
                <SelectItem value="SUB_TASK">Sub-Task</SelectItem>
                <SelectItem value="ANALYSIS_TASK">Analysis Task</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setTypeFilter("all");
              }}
              className="hover:bg-professional-slate/10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card className="professional-card">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-professional-slate-dark mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-professional-slate-dark mb-4">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by creating your first task."}
              </p>
              {canAddTasks && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="professional-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const isAssignedToUser = isTaskAssignedToCurrentUser(task);
            const canEdit = canEditTask(task);
            
            // Determine highlight class based on user's role and assignment
            let highlightClass = "";
            if (isAssignedToUser) {
              if (user?.functionalGroup === 'DEVELOPER' || user?.functionalGroup === 'DEV_LEAD') {
                highlightClass = "ring-2 ring-blue-500/50 bg-blue-50/30"; // Highlight for assigned developer
              } else if (user?.functionalGroup === 'TESTER' || user?.functionalGroup === 'TEST_LEAD') {
                highlightClass = "ring-2 ring-green-500/50 bg-green-50/30"; // Highlight for assigned tester
              }
            }

            return (
              <Card 
                key={task.id} 
                className={cn(
                  "professional-card professional-hover transition-all duration-300",
                  highlightClass, // Apply highlight class here
                  canEdit && "cursor-pointer",
                  task.status === 'UAT_FAILED' && "border-professional-red/30 bg-professional-red/5"
                )}
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-professional-navy to-professional-blue text-white px-3 py-1 rounded-lg font-mono text-sm font-bold shadow-professional">
                        {task.taskNumber}
                      </div>
                      {task.status === 'UAT_FAILED' && (
                        <div className="flex items-center gap-1 bg-professional-red/10 text-professional-red-dark px-2 py-1 rounded-full border border-professional-red/30">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs font-medium">UAT Failed</span>
                        </div>
                      )}
                      {isAssignedToUser && (
                        <div className="flex items-center gap-1 bg-professional-blue/10 text-professional-blue-dark px-2 py-1 rounded-full border border-professional-blue/30">
                          <Target className="h-4 w-4" />
                          <span className="text-xs font-medium">Assigned to You</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadgeClass(task.status)}>
                        {task.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className={getPriorityBadgeClass(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-professional-navy mb-2">{task.name}</h3>
                      {task.description && (
                        <p className="text-professional-slate-dark text-sm line-clamp-2">{task.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Developer Assignment */}
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-professional-blue" />
                        <div>
                          <p className="text-xs text-professional-slate-dark">Developer</p>
                          <p className="text-sm font-medium text-professional-navy">
                            {task.developerName || "Unassigned"}
                          </p>
                        </div>
                      </div>

                      {/* Tester Assignment */}
                      <div className="flex items-center gap-2">
                        <TestTube className="h-4 w-4 text-professional-green" />
                        <div>
                          <p className="text-xs text-professional-slate-dark">Tester</p>
                          <p className="text-sm font-medium text-professional-navy">
                            {task.testerName || "Unassigned"}
                          </p>
                        </div>
                      </div>

                      {/* Due Hours */}
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-professional-orange" />
                        <div>
                          <p className="text-xs text-professional-slate-dark">Due Hours</p>
                          <p className="text-sm font-medium text-professional-navy">
                            Dev: {task.developmentDueHours || 0}h • Test: {task.testingDueHours || 0}h
                          </p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-professional-purple" />
                        <div>
                          <p className="text-xs text-professional-slate-dark">Received</p>
                          <p className="text-sm font-medium text-professional-navy">
                            {formatSafeDate(task.receivedDate, "MMM dd")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {task.projectName && (
                      <div className="flex items-center gap-2 pt-2 border-t border-professional-slate/20">
                        <Badge variant="outline" className="text-xs bg-professional-slate/5">
                          {task.projectName}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-professional-slate/5">
                          {task.taskType.replace(/_/g, ' ')}
                        </Badge>
                        {!canEdit && (
                          <Badge variant="outline" className="text-xs bg-professional-yellow/10 text-professional-yellow-dark border-professional-yellow/30">
                            View Only
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        teammates={teammatesData?.teammates || []}
      />

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        task={selectedTask}
        onSave={handleTaskSave}
        teammates={teammatesData?.teammates || []}
      />
    </div>
  );
};

export default Tasks;


