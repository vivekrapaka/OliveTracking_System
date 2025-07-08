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
import { useAuth } from "@/contexts/AuthContext";
import { getAvailableStatusTransitions, requiresCommitId, requiresComment } from "@/utils/statusWorkflowUtils";

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
  const { user } = useAuth();
  const [taskName, setTaskName] = useState(task.name);
  const [description, setDescription] = useState(task.description || "");
  const [currentStage, setCurrentStage] = useState(task.status);
  const [taskType, setTaskType] = useState(task.taskType);
  const [priority, setPriority] = useState(task.priority);
  const [commitId, setCommitId] = useState(task.commitId || "");
  const [comment, setComment] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDevelopmentStartDate, setSelectedDevelopmentStartDate] = useState<Date>();
  const [selectedReceivedDate, setSelectedReceivedDate] = useState<Date>();
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);

  const editTaskMutation = useEditTask();

  // Get available status transitions based on current status and user role
  const availableStatusTransitions = getAvailableStatusTransitions(
    task.status,
    user?.role || ""
  );

  // Check if the status dropdown should be disabled
  const isStatusDropdownDisabled = availableStatusTransitions.length <= 1;

  // Check if commit ID is required for the selected status
  const isCommitIdRequired = requiresCommitId(currentStage);
  const showCommitIdField = isCommitIdRequired;

  // Check if comment is required for the status change
  const isCommentRequired = requiresComment(task.status, currentStage);
  const showCommentField = isCommentRequired || task.status === "CODE_REVIEW";

  const taskTypes = [
    { value: "BRD", label: "Business Requirement Document" },
    { value: "EPIC", label: "Epic" },
    { value: "STORY", label: "Story" },
    { value: "TASK", label: "Task" },
    { value: "BUG", label: "Bug" },
    { value: "SUB_TASK", label: "Sub-Task" },
    { value: "ANALYSIS_TASK", label: "Analysis Task" }
  ];

  const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  useEffect(() => {
    setTaskName(task.name);
    setDescription(task.description || "");
    setCurrentStage(task.status);
    setTaskType(task.taskType);
    setPriority(task.priority);
    setCommitId(task.commitId || "");
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

  const handleStatusChange = (newStatus: string) => {
    setCurrentStage(newStatus);
    // Clear commit ID if not required for the new status
    if (!requiresCommitId(newStatus)) {
      setCommitId("");
    }
    // Clear comment when status changes
    setComment("");
  };

  const isFormValid = () => {
    if (isCommitIdRequired && !commitId.trim()) {
      return false;
    }
    if (isCommentRequired && !comment.trim()) {
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!isFormValid()) {
      return;
    }

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
      commitId: commitId.trim() || undefined,
      comment: comment.trim() || undefined,
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
      
      {/* Smart Status Dropdown */}
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={currentStage} 
          onValueChange={handleStatusChange}
          disabled={isStatusDropdownDisabled}
        >
          <SelectTrigger className={cn(isStatusDropdownDisabled && "opacity-50 cursor-not-allowed")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableStatusTransitions.map((status) => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isStatusDropdownDisabled && (
          <p className="text-xs text-slate-500">
            No status changes available for your role at this stage.
          </p>
        )}
      </div>

      {/* Conditional Comment Field */}
      {showCommentField && (
        <div className="grid gap-2">
          <Label htmlFor="comment">
            Comment {isCommentRequired && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              isCommentRequired 
                ? "A comment is required when changing status from Code Review..." 
                : "Add a comment about this status change (optional)..."
            }
            className={cn(
              "min-h-[80px]",
              isCommentRequired && !comment.trim() && "border-red-300 focus:border-red-500"
            )}
          />
          {isCommentRequired && !comment.trim() && (
            <p className="text-xs text-red-500">
              A comment is required when changing status from Code Review.
            </p>
          )}
        </div>
      )}

      {/* Conditional Commit ID Field */}
      {showCommitIdField && (
        <div className="grid gap-2">
          <Label htmlFor="commitId">
            Commit ID {isCommitIdRequired && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="commitId"
            value={commitId}
            onChange={(e) => setCommitId(e.target.value)}
            placeholder="Enter commit ID (required for UAT Testing and Pre-Production)"
            className={cn(
              isCommitIdRequired && !commitId.trim() && "border-red-300 focus:border-red-500"
            )}
          />
          {isCommitIdRequired && !commitId.trim() && (
            <p className="text-xs text-red-500">
              Commit ID is required when moving to UAT Testing or Pre-Production.
            </p>
          )}
        </div>
      )}
      
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
          disabled={editTaskMutation.isPending || !isFormValid()}
        >
          {editTaskMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
