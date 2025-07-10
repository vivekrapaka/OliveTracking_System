import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TeammateMultiSelector } from "./TeammateMultiSelector";
import { ParentTaskSelector } from "./ParentTaskSelector";
import { useAddTask } from "@/hooks/useAddTask";
import { useTaskSequenceNumber } from "@/hooks/useTaskSequenceNumber";
import { useAuth } from "@/contexts/AuthContext";
import { useTasksData } from "@/hooks/useTasksData";
import { useProjects } from "@/hooks/useProjects";

interface Teammate {
  id: number;
  name: string;
  role: string;
}

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teammates: Teammate[];
}

export const AddTaskDialog = ({ isOpen, onClose, teammates }: AddTaskDialogProps) => {
  const { user } = useAuth();
  const { data: tasksData } = useTasksData();
  const { data: projectsData } = useProjects();

  // Form state
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("BACKLOG");
  const [taskType, setTaskType] = useState("TASK");
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState("");
  const [selectedTeammateIds, setSelectedTeammateIds] = useState<number[]>([]);
  const [receivedDate, setReceivedDate] = useState<Date>();
  const [developmentStartDate, setDevelopmentStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [documentPath, setDocumentPath] = useState("");
  const [commitId, setCommitId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Hooks
  const addTaskMutation = useAddTask();
  const { data: taskSequenceNumber, isLoading: isLoadingSequence, refetch: refetchSequence } = useTaskSequenceNumber();

  // Constants with new status values
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

  const priorities = ["HIGH", "MEDIUM", "LOW"];

  // Available parent tasks
  const availableParentTasks = tasksData?.tasks?.map(task => ({
    id: task.id,
    name: task.name,
    taskNumber: task.taskNumber,
    taskType: task.taskType || 'TASK'
  })) || [];

  // Available projects from API
  const availableProjects = projectsData || [];

  const handleTeammateToggle = (teammateId: number) => {
    setSelectedTeammateIds(prev => 
      prev.includes(teammateId)
        ? prev.filter(id => id !== teammateId)
        : [...prev, teammateId]
    );
  };

  const resetForm = () => {
    setTaskName("");
    setDescription("");
    setStatus("BACKLOG");
    setTaskType("TASK");
    setParentId(undefined);
    setPriority("");
    setSelectedTeammateIds([]);
    setReceivedDate(undefined);
    setDevelopmentStartDate(undefined);
    setDueDate(undefined);
    setDocumentPath("");
    setCommitId("");
    setSelectedProjectId(undefined);
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!taskName) errors.taskName = "Task name is required";
    if (!status) errors.status = "Status is required";
    if (!taskType) errors.taskType = "Task type is required";
    if (!priority) errors.priority = "Priority is required";
    if (!receivedDate) errors.receivedDate = "Received date is required";
    if (!dueDate) errors.dueDate = "Due date is required";
    if (!selectedProjectId) errors.projectId = "Project selection is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      console.log('Validation failed', validationErrors);
      return;
    }

    const taskData = {
      taskName,
      description,
      status,
      taskType,
      parentId,
      receivedDate: format(receivedDate!, "yyyy-MM-dd"),
      developmentStartDate: developmentStartDate ? format(developmentStartDate, "yyyy-MM-dd") : undefined,
      dueDate: format(dueDate!, "yyyy-MM-dd"),
      assignedTeammateIds: selectedTeammateIds,
      priority,
      documentPath: documentPath || undefined,
      commitId: commitId || undefined,
      projectId: selectedProjectId, // Send the selected project ID
    };

    console.log('Submitting task:', taskData);

    addTaskMutation.mutate(taskData, {
      onSuccess: () => {
        console.log('Task added successfully');
        resetForm();
        refetchSequence();
        onClose();
      },
      onError: (error) => {
        console.error('Add task error:', error);
      }
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
        {/* Project Selection - NEW FEATURE */}
        <div className="grid gap-2">
          <Label>Project *</Label>
          <Select value={selectedProjectId?.toString()} onValueChange={(value) => setSelectedProjectId(Number(value))}>
            <SelectTrigger className={validationErrors.projectId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {availableProjects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.projectId && (
            <p className="text-red-500 text-sm">{validationErrors.projectId}</p>
          )}
        </div>

        {/* Task Number */}
        <div className="grid gap-2">
          <Label>Task Number</Label>
          <div className="flex items-center gap-2">
            <Input
              value={isLoadingSequence ? "Loading..." : taskSequenceNumber || "TSK-001"}
              readOnly
              className="bg-gray-50 text-gray-700"
              placeholder="TSK-001"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchSequence()}
              disabled={isLoadingSequence}
              className="px-3"
            >
              <RefreshCw className={cn("h-4 w-4", isLoadingSequence && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Task Name */}
        <div className="grid gap-2">
          <Label htmlFor="taskName">Task Name *</Label>
          <Input
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
            className={validationErrors.taskName ? "border-red-500" : ""}
          />
          {validationErrors.taskName && (
            <p className="text-red-500 text-sm">{validationErrors.taskName}</p>
          )}
        </div>

        {/* Task Type */}
        <div className="grid gap-2">
          <Label>Task Type *</Label>
          <Select value={taskType} onValueChange={setTaskType}>
            <SelectTrigger className={validationErrors.taskType ? "border-red-500" : ""}>
              <SelectValue placeholder="Select task type" />
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.taskType && (
            <p className="text-red-500 text-sm">{validationErrors.taskType}</p>
          )}
        </div>

        {/* Parent Task */}
        <ParentTaskSelector
          availableTasks={availableParentTasks}
          selectedTaskId={parentId}
          onTaskSelect={setParentId}
          currentTaskType={taskType}
        />

        {/* Status */}
        <div className="grid gap-2">
          <Label>Status *</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className={validationErrors.status ? "border-red-500" : ""}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((statusOption) => (
                <SelectItem key={statusOption.value} value={statusOption.value}>{statusOption.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.status && (
            <p className="text-red-500 text-sm">{validationErrors.status}</p>
          )}
        </div>

        {/* Priority */}
        <div className="grid gap-2">
          <Label>Priority *</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className={validationErrors.priority ? "border-red-500" : ""}>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.priority && (
            <p className="text-red-500 text-sm">{validationErrors.priority}</p>
          )}
        </div>

        {/* Date Fields */}
        {renderDateField("Received Date", receivedDate, setReceivedDate, validationErrors.receivedDate, true)}
        {renderDateField("Development Start Date", developmentStartDate, setDevelopmentStartDate)}
        {renderDateField("Due Date", dueDate, setDueDate, validationErrors.dueDate, true)}

        {/* Teammates */}
        <TeammateMultiSelector
          teammates={teammates}
          selectedTeammateIds={selectedTeammateIds}
          onTeammateToggle={handleTeammateToggle}
        />

        {/* Document Path */}
        <div className="grid gap-2">
          <Label htmlFor="documentPath">Document Path</Label>
          <Input
            id="documentPath"
            value={documentPath}
            onChange={(e) => setDocumentPath(e.target.value)}
            placeholder="Enter document path (optional)"
          />
        </div>

        {/* Commit ID */}
        <div className="grid gap-2">
          <Label htmlFor="commitId">Commit ID</Label>
          <Input
            id="commitId"
            value={commitId}
            onChange={(e) => setCommitId(e.target.value)}
            placeholder="Enter commit ID (optional)"
          />
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description (optional)"
            className="min-h-[100px]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            {addTaskMutation.isPending ? "Adding..." : "Add Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for date fields
function renderDateField(
  label: string,
  value: Date | undefined,
  setValue: (date: Date | undefined) => void,
  error?: string,
  required?: boolean
) {
  return (
    <div className="grid gap-2">
      <Label>
        {label} {required && "*"}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Pick {label.toLowerCase()}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={setValue}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
