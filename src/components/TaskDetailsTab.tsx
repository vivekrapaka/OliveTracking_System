
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TeammateSelector } from "./TeammateSelector";
import { useEditTask } from "@/hooks/useEditTask";

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

interface Teammate {
  id: number;
  name: string;
  role: string;
}

interface TaskDetailsTabProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  teammates: Teammate[];
  onClose: () => void;
}

export const TaskDetailsTab = ({ task, onSave, teammates, onClose }: TaskDetailsTabProps) => {
  const [taskName, setTaskName] = useState(task.name);
  const [description, setDescription] = useState(task.description || "");
  const [currentStage, setCurrentStage] = useState(task.status);
  const [taskType, setTaskType] = useState(task.taskType);
  const [priority, setPriority] = useState(task.priority);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDevelopmentStartDate, setSelectedDevelopmentStartDate] = useState<Date>();
  const [selectedReceivedDate, setSelectedReceivedDate] = useState<Date>();
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);

  const editTaskMutation = useEditTask();

  const statuses = [
    { value: "BACKLOG", label: "Backlog" },
    { value: "ANALYSIS", label: "Analysis" },
    { value: "DEVELOPMENT", label: "Development" },
    { value: "SIT_TESTING", label: "SIT Testing" },
    { value: "SIT_FAILED", label: "SIT Failed" },
    { value: "UAT_TESTING", label: "UAT Testing" },
    { value: "UAT_FAILED", label: "UAT Failed" },
    { value: "PREPROD", label: "Pre-Production" },
    { value: "PROD", label: "Production" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CLOSED", label: "Closed" },
    { value: "REOPENED", label: "Reopened" },
    { value: "BLOCKED", label: "Blocked" }
  ];

  const taskTypes = [
    { value: "BRD", label: "Business Requirement Document" },
    { value: "EPIC", label: "Epic" },
    { value: "STORY", label: "Story" },
    { value: "TASK", label: "Task" },
    { value: "BUG", label: "Bug" },
    { value: "SUB_TASK", label: "Sub-Task" }
  ];

  const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  useEffect(() => {
    setTaskName(task.name);
    setDescription(task.description || "");
    setCurrentStage(task.status);
    setTaskType(task.taskType);
    setPriority(task.priority);
    setSelectedTeammates(task.assignedTeammates || []);
    
    if (task.dueDate) {
      setSelectedDate(new Date(task.dueDate));
    }
    if (task.developmentStartDate) {
      setSelectedDevelopmentStartDate(new Date(task.developmentStartDate));
    }
    if (task.receivedDate) {
      setSelectedReceivedDate(new Date(task.receivedDate));
    }
  }, [task]);

  const handleTeammateToggle = (teammateName: string) => {
    setSelectedTeammates(prev => {
      return prev.includes(teammateName)
        ? prev.filter(name => name !== teammateName)
        : [...prev, teammateName];
    });
  };

  const handleSave = () => {
    const taskData = {
      taskName: taskName,
      description: description,
      status: currentStage,
      taskType: taskType,
      dueDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : task.dueDate,
      receivedDate: selectedReceivedDate ? format(selectedReceivedDate, "yyyy-MM-dd") : task.receivedDate,
      developmentStartDate: selectedDevelopmentStartDate ? format(selectedDevelopmentStartDate, "yyyy-MM-dd") : task.developmentStartDate,
      assignedTeammateNames: selectedTeammates,
      priority: priority,
    };

    editTaskMutation.mutate({
      taskId: task.id,
      taskData
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
      <div className="grid gap-2">
        <Label htmlFor="taskNumber">Task Number</Label>
        <Input
          id="taskNumber"
          value={task.taskNumber}
          readOnly
          className="bg-gray-100 border border-gray-300"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="taskName">Task Name</Label>
        <Input
          id="taskName"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="taskType">Task Type</Label>
        <Select value={taskType} onValueChange={setTaskType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {taskTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((priorityOption) => (
              <SelectItem key={priorityOption} value={priorityOption}>{priorityOption}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label>Received Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !selectedReceivedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedReceivedDate ? format(selectedReceivedDate, "PPP") : <span>Pick received date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedReceivedDate}
              onSelect={setSelectedReceivedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label>Development Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !selectedDevelopmentStartDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDevelopmentStartDate ? format(selectedDevelopmentStartDate, "PPP") : <span>Pick development start date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDevelopmentStartDate}
              onSelect={setSelectedDevelopmentStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select value={currentStage} onValueChange={setCurrentStage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <TeammateSelector
        teammates={teammates}
        selectedTeammates={selectedTeammates}
        onTeammateToggle={handleTeammateToggle}
      />
      
      <div className="grid gap-2">
        <Label htmlFor="taskDescription">Description</Label>
        <Textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (max 1000 words)"
          maxLength={1000}
          className="min-h-[100px]"
        />
        <p className="text-xs text-slate-500">{description.length}/1000 characters</p>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={editTaskMutation.isPending}
        >
          {editTaskMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
