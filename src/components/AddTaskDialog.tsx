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
import { TeammateSelector } from "./TeammateSelector";
import { useAddTask } from "@/hooks/useAddTask";
import { useTaskSequenceNumber } from "@/hooks/useTaskSequenceNumber";
import { useAuth } from "@/contexts/AuthContext";
import { useAllProjects } from "@/hooks/useFilterAdminInTasks"

interface Teammate {
  id: number;
  name: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
}

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teammates: Teammate[];
}

export const AddTaskDialog = ({ isOpen, onClose, teammates }: AddTaskDialogProps) => {
  const { user, setUser } = useAuth();
  //console.log('Dialog opened with user:', user);

  // Form state
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [currentStage, setCurrentStage] = useState("");
  const [issueType, setIssueType] = useState("");
  const [priority, setPriority] = useState("");
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);
  const [receivedDate, setReceivedDate] = useState<Date>();
  const [startDate, setStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [developmentStartDate, setDevelopmentStartDate] = useState<Date>();
  const [documentPath, setDocumentPath] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedProjectName, setSelectedProjectName] = useState("");

  // Hooks
  const addTaskMutation = useAddTask();
  const { data: taskSequenceNumber, isLoading: isLoadingSequence, refetch: refetchSequence } = useTaskSequenceNumber();

  // Constants
  const stages = ["SIT", "DEV", "Pre-Prod", "Prod", "FSD", "UAT"];
  const issueTypes = ["Feature", "Bug", "Enhancement"];
  const priorities = ["HIGH", "MEDIUM", "LOW"];
  const selectedProjectId = user?.projectIds?.[0];

  const handleTeammateToggle = (teammateName: string) => {
    setSelectedTeammates(prev => 
      prev.includes(teammateName)
        ? prev.filter(name => name !== teammateName)
        : [...prev, teammateName]
    );
  };

  const resetForm = () => {
    setTaskName("");
    setDescription("");
    setCurrentStage("");
    setIssueType("");
    setPriority("");
    setSelectedTeammates([]);
    setReceivedDate(undefined);
    setStartDate(undefined);
    setDueDate(undefined);
    setDevelopmentStartDate(undefined);
    setDocumentPath("");
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!taskName) errors.taskName = "Task name is required";
    if (!currentStage) errors.currentStage = "Current stage is required";
    if (!issueType) errors.issueType = "Issue type is required";
    if (!priority) errors.priority = "Priority is required";
    if (!receivedDate) errors.receivedDate = "Received date is required";
    if (!dueDate) errors.dueDate = "Due date is required";


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
      currentStage,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      dueDate: format(dueDate!, "yyyy-MM-dd"),
      issueType,
      receivedDate: format(receivedDate!, "yyyy-MM-dd"),
      developmentStartDate: developmentStartDate ? format(developmentStartDate, "yyyy-MM-dd") : undefined,
      assignedTeammateNames: selectedTeammates,
      priority,
      documentPath: documentPath || undefined,
      projectId : user?.projectIds?.[0],
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
       {/* Project Info (Auto-detected) */}
<div className="grid gap-2">
  <Label>Project</Label>
  <Input
    value={
      user?.projectIds?.[0]
    }
    readOnly
    className="bg-gray-50 text-gray-700"
  />
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

          {/* Current Stage */}
          <div className="grid gap-2">
            <Label>Current Stage *</Label>
            <Select 
              value={currentStage} 
              onValueChange={setCurrentStage}
            >
              <SelectTrigger className={validationErrors.currentStage ? "border-red-500" : ""}>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.currentStage && (
              <p className="text-red-500 text-sm">{validationErrors.currentStage}</p>
            )}
          </div>

          {/* Issue Type */}
          <div className="grid gap-2">
            <Label>Issue Type *</Label>
            <Select 
              value={issueType} 
              onValueChange={setIssueType}
            >
              <SelectTrigger className={validationErrors.issueType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.issueType && (
              <p className="text-red-500 text-sm">{validationErrors.issueType}</p>
            )}
          </div>

          {/* Priority */}
          <div className="grid gap-2">
            <Label>Priority *</Label>
            <Select 
              value={priority} 
              onValueChange={setPriority}
            >
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
          {renderDateField("Start Date", startDate, setStartDate)}
          {renderDateField("Development Start Date", developmentStartDate, setDevelopmentStartDate)}
          {renderDateField("Due Date", dueDate, setDueDate, validationErrors.dueDate, true)}

          {/* Teammates */}
          <TeammateSelector
            teammates={teammates}
            selectedTeammates={selectedTeammates}
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
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}