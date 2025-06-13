import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { EditTaskDialog } from "@/components/EditTaskDialog";
import { TeammateSelector } from "@/components/TeammateSelector";

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);
  const [taskDescription, setTaskDescription] = useState("");

  // Mock teammates data - this would come from your API
  const teammates = [
    { id: 1, name: "John Doe", role: "Senior Frontend Developer" },
    { id: 2, name: "Jane Smith", role: "Backend Developer" },
    { id: 3, name: "Mike Johnson", role: "Full Stack Developer" },
    { id: 4, name: "Sarah Wilson", role: "UX Designer" },
    { id: 5, name: "Tom Brown", role: "DevOps Engineer" }
  ];

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "User Authentication System",
      description: "Implement a comprehensive user authentication system with login, registration, and password reset functionality.",
      issueType: "Feature",
      receivedDate: "2024-06-01",
      developmentStartDate: "2024-06-05",
      currentStage: "Development",
      dueDate: "2024-06-15",
      assignedTeammates: ["John Doe", "Jane Smith"],
      priority: "High",
      isCompleted: false
    },
    {
      id: 2,
      name: "Database Schema Design",
      description: "Design and implement the database schema for the new project including user management and task tracking.",
      issueType: "Task",
      receivedDate: "2024-06-02",
      developmentStartDate: "2024-06-06",
      currentStage: "Review",
      dueDate: "2024-06-12",
      assignedTeammates: ["Mike Johnson"],
      priority: "Medium",
      isCompleted: false
    },
    {
      id: 3,
      name: "Frontend Dashboard",
      description: "Create a responsive dashboard with charts, metrics, and real-time data visualization for better user experience.",
      issueType: "Feature",
      receivedDate: "2024-06-03",
      developmentStartDate: "2024-06-07",
      currentStage: "Testing",
      dueDate: "2024-06-18",
      assignedTeammates: ["Sarah Wilson", "Tom Brown"],
      priority: "High",
      isCompleted: false
    },
    {
      id: 4,
      name: "Bug Fix - Login Issue",
      description: "Fix the critical login bug where users are unable to authenticate with valid credentials.",
      issueType: "Bug",
      receivedDate: "2024-06-04",
      developmentStartDate: "2024-06-04",
      currentStage: "Completed",
      dueDate: "2024-06-08",
      assignedTeammates: ["John Doe"],
      priority: "Critical",
      isCompleted: true
    }
  ]);

  const stages = ["Planning", "Development", "Review", "Testing", "Completed"];
  const issueTypes = ["Feature", "Bug", "Task", "Enhancement"];
  const priorities = ["Low", "Medium", "High", "Critical"];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Planning": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Development": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Review": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Testing": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case "Feature": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Bug": return "bg-red-100 text-red-800 border-red-200";
      case "Task": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Enhancement": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.currentStage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTeammateToggle = (teammateName: string) => {
    setSelectedTeammates(prev =>
      prev.includes(teammateName)
        ? prev.filter(name => name !== teammateName)
        : [...prev, teammateName]
    );
  };

  const handleCreateTask = () => {
    toast({
      title: "Task Created",
      description: "New task has been created successfully.",
    });
    setSelectedTeammates([]);
    setTaskDescription("");
    setIsCreateModalOpen(false);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleSaveTask = (updatedTask: any) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "Task has been deleted successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-600 mt-1">Manage and track all your project tasks</p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="taskName">Task Name</Label>
                <Input id="taskName" placeholder="Enter task name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskDescription">Description</Label>
                <Textarea 
                  id="taskDescription" 
                  placeholder="Enter task description (max 1000 words)" 
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  maxLength={1000}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-slate-500">{taskDescription.length}/1000 characters</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="issueType">Issue Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stage">Current Stage</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <TeammateSelector
                teammates={teammates}
                selectedTeammates={selectedTeammates}
                onTeammateToggle={handleTeammateToggle}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask} className="bg-blue-600 hover:bg-blue-700">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-6">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className={cn(
              "hover:shadow-md transition-shadow",
              task.isCompleted && "bg-green-50 border-green-200"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">{task.name}</h3>
                    <Badge className={getIssueTypeColor(task.issueType)}>
                      {task.issueType}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>

                  {task.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 font-medium mb-1">Current Stage</p>
                      <Badge className={getStageColor(task.currentStage)}>
                        {task.currentStage}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-slate-600 font-medium mb-1">Due Date</p>
                      <div className="flex items-center text-slate-700">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {task.dueDate}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-600 font-medium mb-1">Assigned To</p>
                      <div className="flex flex-wrap gap-1">
                        {task.assignedTeammates.map((teammate, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {teammate}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-500">
                    <span className="mr-4">Received: {task.receivedDate}</span>
                    <span>Started: {task.developmentStartDate}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTask(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{task.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTask(task.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        teammates={teammates}
      />

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks found</h3>
          <p className="text-slate-600">Try adjusting your search criteria or create a new task.</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
