
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
import { ParentTaskSelector } from "./ParentTaskSelector";
import { useAddTask } from "@/hooks/useAddTask";
import { useTaskSequenceNumber } from "@/hooks/useTaskSequenceNumber";
import { useAuth } from "@/contexts/AuthContext";
import { useTasksData } from "@/hooks/useTasksData";
import { DisciplineBasedTeammateSelector } from "./DisciplineBasedTeammateSelector";

interface Teammate {
  id: number;
  name: string;
  role: string;
  functionalGroup: string;
}

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teammates: Teammate[];
}

export const AddTaskDialog = ({ isOpen, onClose, teammates }: AddTaskDialogProps) => {
  const { user } = useAuth();
  const { data: tasksData } = useTasksData();

  // Form state
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("BACKLOG");
  const [taskType, setTaskType] = useState("TASK");
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState("");
  const [selectedDeveloperIds, setSelectedDeveloperIds] = useState<number[]>([]);
  const [selectedTesterIds, setSelectedTesterIds] = useState<number[]>([]);
  const [receivedDate, setReceivedDate] = useState<Date>();
  const [developmentStartDate, setDevelopmentStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [documentPath, setDocumentPath] = useState("");
  const [commitId, setCommitId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [developmentDueHours, setDevelopmentDueHours] = useState<number>(0);
  const [testingDueHours, setTestingDueHours] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Hooks
  const addTaskMutation = useAddTask();
  const { data: taskSequenceNumber, isLoading: isLoadingSequence, refetch: refetchSequence } = useTaskSequenceNumber();

  // Constants with new status values
  const statuses = [
    { value: "BACKLOG", label: "Backlog" },
    { value: "ANALYSIS", label: "Analysis" },
    { value: "DEVELOPMENT", label: "Development" },
    { value: "CODE_REVIEW", label: "Code Review" },
    { value: "UAT_TESTING", label: "UAT Testing" },
    { value: "UAT_FAILED", label: "UAT Failed" },
    { value: "READY_FOR_PREPROD", label: "Ready for Pre-Production" },
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
    { value: "SUB_TASK", label: "Sub-Task" },
    { value: "ANALYSIS_TASK", label: "Analysis Task" }
  ];

  const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  // Available parent tasks
  const availableParentTasks = tasksData?.tasks?.map(task => ({
    id: task.id,
    name: task.name,
    taskNumber: task.taskNumber,
    taskType: task.taskType || 'TASK'
  })) || [];

  // Separate developers and testers
  const developers = teammates.filter(t => 
    t.functionalGroup === "DEVELOPER" || t.functionalGroup === "DEV_LEAD"
  );
  const testers = teammates.filter(t => 
    t.functionalGroup === "TESTER" || t.functionalGroup === "TEST_LEAD"
  );

  const resetForm = () => {
    setTaskName("");
    setDescription("");
    setStatus("BACKLOG");
    setTaskType("TASK");
    setParentId(undefined);
    setPriority("");
    setSelectedDeveloperIds([]);
    setSelectedTesterIds([]);
    setReceivedDate(undefined);
    setDevelopmentStartDate(undefined);
    setDueDate(undefined);
    setDocumentPath("");
    setCommitId("");
    setSelectedProjectId(undefined);
    setDevelopmentDueHours(0);
    setTestingDueHours(0);
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
    if (developmentDueHours <= 0) errors.developmentDueHours = "Development due hours must be greater than 0";

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
      developerIds: selectedDeveloperIds,
      testerIds: selectedTesterIds,
      priority,
      documentPath: documentPath || undefined,
      commitId: commitId || undefined,
      projectId: selectedProjectId,
      developmentDueHours,
      testingDueHours,
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-professional-slate/20 shadow-professional-xl">
        <DialogHeader className="pb-4 border-b border-professional-slate/20">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-professional-blue to-professional-cyan bg-clip-text text-transparent">
            Add New Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Project Selection */}
          <div className="grid gap-2">
            <Label className="text-professional-navy font-medium">Project *</Label>
            <Select
              value={selectedProjectId?.toString()}
              onValueChange={(value) => {
                console.log("Selected Project ID (as string):", value);
                setSelectedProjectId(Number(value));
              }}
            >
              <SelectTrigger className={cn("professional-input", validationErrors.projectId && "border-professional-red")}>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-professional-slate/30">
                {user?.projectNames?.map((projectNames, index) => {
                  const projectId = user.projectIds[index];
                  console.log(`Rendering: Name = ${projectNames}, ID = ${projectId}`);
                  return (
                    <SelectItem key={projectId} value={projectId.toString()}>
                      {projectNames}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {validationErrors.projectId && (
              <p className="text-professional-red text-sm bg-professional-red/10 p-2 rounded border border-professional-red/30">
                {validationErrors.projectId}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Task Number */}
              <div className="grid gap-2">
                <Label className="text-professional-navy font-medium">Task Number</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={isLoadingSequence ? "Loading..." : taskSequenceNumber || "TSK-001"}
                    readOnly
                    className="professional-input bg-professional-slate/10 text-professional-slate-dark font-mono"
                    placeholder="TSK-001"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchSequence()}
                    disabled={isLoadingSequence}
                    className="px-3 hover:bg-professional-blue/10"
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoadingSequence && "animate-spin")} />
                  </Button>
                </div>
              </div>

              {/* Task Name */}
              <div className="grid gap-2">
                <Label htmlFor="taskName" className="text-professional-navy font-medium">Task Name *</Label>
                <Input
                  id="taskName"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Enter task name"
                  className={cn("professional-input", validationErrors.taskName && "border-professional-red")}
                />
                {validationErrors.taskName && (
                  <p className="text-professional-red text-sm">{validationErrors.taskName}</p>
                )}
              </div>

              {/* Task Type */}
              <div className="grid gap-2">
                <Label className="text-professional-navy font-medium">Task Type *</Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger className={cn("professional-input", validationErrors.taskType && "border-professional-red")}>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border-professional-slate/30">
                    {taskTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.taskType && (
                  <p className="text-professional-red text-sm">{validationErrors.taskType}</p>
                )}
              </div>

              {/* Priority */}
              <div className="grid gap-2">
                <Label className="text-professional-navy font-medium">Priority *</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className={cn("professional-input", validationErrors.priority && "border-professional-red")}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border-professional-slate/30">
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.priority && (
                  <p className="text-professional-red text-sm">{validationErrors.priority}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Status */}
              <div className="grid gap-2">
                <Label className="text-professional-navy font-medium">Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className={cn("professional-input", validationErrors.status && "border-professional-red")}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border-professional-slate/30">
                    {statuses.map((statusOption) => (
                      <SelectItem key={statusOption.value} value={statusOption.value}>{statusOption.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.status && (
                  <p className="text-professional-red text-sm">{validationErrors.status}</p>
                )}
              </div>

              {/* Due Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="developmentDueHours" className="text-professional-navy font-medium">Dev Due Hours *</Label>
                  <Input
                    id="developmentDueHours"
                    type="number"
                    value={developmentDueHours}
                    onChange={(e) => setDevelopmentDueHours(Number(e.target.value))}
                    className={cn("professional-input", validationErrors.developmentDueHours && "border-professional-red")}
                    min="0"
                    step="0.5"
                    placeholder="0"
                  />
                  {validationErrors.developmentDueHours && (
                    <p className="text-professional-red text-xs">{validationErrors.developmentDueHours}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="testingDueHours" className="text-professional-navy font-medium">Test Due Hours</Label>
                  <Input
                    id="testingDueHours"
                    type="number"
                    value={testingDueHours}
                    onChange={(e) => setTestingDueHours(Number(e.target.value))}
                    className="professional-input"
                    min="0"
                    step="0.5"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Document Path */}
              <div className="grid gap-2">
                <Label htmlFor="documentPath" className="text-professional-navy font-medium">Document Path</Label>
                <Input
                  id="documentPath"
                  value={documentPath}
                  onChange={(e) => setDocumentPath(e.target.value)}
                  placeholder="Enter document path (optional)"
                  className="professional-input"
                />
              </div>

              {/* Commit ID */}
              <div className="grid gap-2">
                <Label htmlFor="commitId" className="text-professional-navy font-medium">Commit ID</Label>
                <Input
                  id="commitId"
                  value={commitId}
                  onChange={(e) => setCommitId(e.target.value)}
                  placeholder="Enter commit ID (optional)"
                  className="professional-input"
                />
              </div>
            </div>
          </div>

          {/* Parent Task */}
          <ParentTaskSelector
            availableTasks={availableParentTasks}
            selectedTaskId={parentId}
            onTaskSelect={setParentId}
            currentTaskType={taskType}
          />

          {/* Date Fields */}
          <div className="grid md:grid-cols-3 gap-4">
            {renderDateField("Received Date", receivedDate, setReceivedDate, validationErrors.receivedDate, true)}
            {renderDateField("Development Start Date", developmentStartDate, setDevelopmentStartDate)}
            {renderDateField("Due Date", dueDate, setDueDate, validationErrors.dueDate, true)}
          </div>

          {/* Team Assignment */}
          <DisciplineBasedTeammateSelector
            developers={developers}
            testers={testers}
            selectedDeveloperIds={selectedDeveloperIds}
            selectedTesterIds={selectedTesterIds}
            onDeveloperToggle={(id) => {
              setSelectedDeveloperIds(prev => 
                prev.includes(id) ? prev.filter(devId => devId !== id) : [...prev, id]
              );
            }}
            onTesterToggle={(id) => {
              setSelectedTesterIds(prev => 
                prev.includes(id) ? prev.filter(testId => testId !== id) : [...prev, id]
              );
            }}
          />

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-professional-navy font-medium">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              className="min-h-[100px] professional-input"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-professional-slate/20">
          <Button variant="outline" onClick={handleClose} className="hover:bg-professional-slate/10">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="professional-button shadow-professional-lg"
            disabled={addTaskMutation.isPending}
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
      <Label className="text-professional-navy font-medium">
        {label} {required && "*"}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal professional-input",
              !value && "text-muted-foreground",
              error && "border-professional-red"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Pick {label.toLowerCase()}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-md border-professional-slate/30" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={setValue}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-professional-red text-sm">{error}</p>}
    </div>
  );
}
