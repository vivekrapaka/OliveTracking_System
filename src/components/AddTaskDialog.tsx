import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, RefreshCw, Code, TestTube, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ParentTaskSelector } from "./ParentTaskSelector";
import { useAddTask } from "@/hooks/useAddTask";

import { useTaskSequenceNumber } from "@/hooks/useTaskSequenceNumber";
import { useAuth } from "@/contexts/AuthContext";
import { useTasksData } from "@/hooks/useTasksData";
import { useProjectTeammates } from "@/hooks/useProjectTeammates";
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

export const AddTaskDialog = ({
  isOpen,
  onClose,
  teammates,
}: AddTaskDialogProps) => {
  const { user } = useAuth();
  const { data: tasksData } = useTasksData();

  // Form state
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("BACKLOG");
  const [taskType, setTaskType] = useState("TASK");
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState("");
  const [selectedDeveloperIds, setSelectedDeveloperIds] = useState<number[]>(
    []
  );
  const [selectedTesterIds, setSelectedTesterIds] = useState<number[]>([]);
  const [receivedDate, setReceivedDate] = useState<Date>();
  const [developmentStartDate, setDevelopmentStartDate] = useState<Date>();
  const [documentPath, setDocumentPath] = useState("");
  const [commitId, setCommitId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<
    number | undefined
  >(undefined);
  const [developmentDueHours, setDevelopmentDueHours] = useState<number>(0);
  const [testingDueHours, setTestingDueHours] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Hooks
  const addTaskMutation = useAddTask();
  const {
    data: taskSequenceNumber,
    isLoading: isLoadingSequence,
    refetch: refetchSequence,
  } = useTaskSequenceNumber();

  // Fetch project teammates when project is selected
  console.log("selectedProjectId for -{}", selectedProjectId);
  const { data: projectTeammatesData } = useProjectTeammates(selectedProjectId);
  const projectTeammates = projectTeammatesData?.teammates || [];

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

    { value: "REOPENED", label: "Reopened" },
    { value: "BLOCKED", label: "Blocked" },
  ];

  const taskTypes = [
    { value: "BRD", label: "Business Requirement Document" },
    { value: "EPIC", label: "Epic" },
    { value: "STORY", label: "Story" },
    { value: "TASK", label: "Task" },
    { value: "BUG", label: "Bug" },
    { value: "SUB_TASK", label: "Sub-Task" },
    { value: "ANALYSIS_TASK", label: "Analysis Task" },
  ];

  const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  // Available parent tasks
  const availableParentTasks =
    tasksData?.tasks?.map((task) => ({
      id: task.id,
      name: task.name,
      taskNumber: task.taskNumber,
      taskType: task.taskType || "TASK",
    })) || [];

  // Separate developers and testers from project teammates
  console.log("printing the projectTeammats -{}", projectTeammates);
  const developers = projectTeammates.filter(
    (t) =>
      (t.department === "DEVELOPER" || t.department === "DEV_LEAD") &&
      t.projectIds?.includes(selectedProjectId!)
  );

  const testers = projectTeammates.filter(
    (t) =>
      (t.department === "TESTER" || t.department === "TEST_LEAD") &&
      t.projectIds?.includes(selectedProjectId!)
  );

  console.log("printing the developers", developers);
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
    if (!selectedProjectId) errors.projectId = "Project selection is required";
    if (developmentDueHours <= 0)
      errors.developmentDueHours =
        "Development due hours must be greater than 0";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      console.log("Validation failed", validationErrors);
      return;
    }

    const taskData = {
      taskName,
      description,
      status,
      taskType,
      parentId,
      receivedDate: format(receivedDate!, "yyyy-MM-dd"),
      developmentStartDate: developmentStartDate
        ? format(developmentStartDate, "yyyy-MM-dd")
        : undefined,
      developerIds: selectedDeveloperIds,
      testerIds: selectedTesterIds,
      priority,
      documentPath: documentPath || undefined,
      commitId: commitId || undefined,
      projectId: selectedProjectId,
      developmentDueHours,
      testingDueHours,
    };

    console.log("Submitting task:", taskData);

    addTaskMutation.mutate(taskData, {
      onSuccess: () => {
        console.log("Task added successfully");
        resetForm();
        refetchSequence();
        onClose();
      },
      onError: (error) => {
        console.error("Add task error:", error);
      },
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    console.log("🔥 selectedProjectId changed:", selectedProjectId);
  }, [selectedProjectId]);
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Add New Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Project Selection */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Label className="text-sm font-medium text-gray-700">
              Project *
            </Label>

            <Select
              value={selectedProjectId?.toString()}
              onValueChange={(value) => {
                console.log("Selected Project ID (as string):", value);
                setSelectedProjectId(Number(value));
                // Reset team selections when project changes
                setSelectedDeveloperIds([]);
                setSelectedTesterIds([]);
              }}
            >
              <SelectTrigger
                className={cn(
                  "mt-1",
                  validationErrors.projectId && "border-red-300"
                )}
              >
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {user?.projectNames?.map((projectNames, index) => {
                  const projectId = user.projectIds[index];
                  console.log(
                    `Rendering: Name = ${projectNames}, ID = ${projectId}`
                  );
                  return (
                    <SelectItem key={projectId} value={projectId.toString()}>
                      {projectNames}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {validationErrors.projectId && (
              <p className="text-red-600 text-sm mt-1">
                {validationErrors.projectId}
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Basic Information
                </h3>

                {/* Task Number */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Task Number
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={
                        isLoadingSequence
                          ? "Loading..."
                          : taskSequenceNumber || "TSK-001"
                      }
                      readOnly
                      className="bg-gray-50 text-gray-600 font-mono"
                      placeholder="TSK-001"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchSequence()}
                      disabled={isLoadingSequence}
                      className="px-3"
                    >
                      <RefreshCw
                        className={cn(
                          "h-4 w-4",
                          isLoadingSequence && "animate-spin"
                        )}
                      />
                    </Button>
                  </div>
                </div>

                {/* Task Name */}
                <div className="mb-4">
                  <Label
                    htmlFor="taskName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Task Name *
                  </Label>
                  <Input
                    id="taskName"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name"
                    className={cn(
                      "mt-1",
                      validationErrors.taskName && "border-red-300"
                    )}
                  />
                  {validationErrors.taskName && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.taskName}
                    </p>
                  )}
                </div>

                {/* Task Type */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Task Type *
                  </Label>
                  <Select value={taskType} onValueChange={setTaskType}>
                    <SelectTrigger
                      className={cn(
                        "mt-1",
                        validationErrors.taskType && "border-red-300"
                      )}
                    >
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.taskType && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.taskType}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Priority *
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger
                      className={cn(
                        "mt-1",
                        validationErrors.priority && "border-red-300"
                      )}
                    >
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.priority && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.priority}
                    </p>
                  )}
                </div>
              </div>

              {/* Due Hours */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Effort Estimation
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="developmentDueHours"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <Code className="h-4 w-4 text-blue-500" />
                      Dev Hours *
                    </Label>
                    <Input
                      id="developmentDueHours"
                      type="number"
                      value={developmentDueHours}
                      onChange={(e) =>
                        setDevelopmentDueHours(Number(e.target.value))
                      }
                      className={cn(
                        "mt-1",
                        validationErrors.developmentDueHours && "border-red-300"
                      )}
                      min="0"
                      step="0.5"
                      placeholder="0"
                    />
                    {validationErrors.developmentDueHours && (
                      <p className="text-red-600 text-xs mt-1">
                        {validationErrors.developmentDueHours}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="testingDueHours"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <TestTube className="h-4 w-4 text-green-500" />
                      Test Hours
                    </Label>
                    <Input
                      id="testingDueHours"
                      type="number"
                      value={testingDueHours}
                      onChange={(e) =>
                        setTestingDueHours(Number(e.target.value))
                      }
                      className="mt-1"
                      min="0"
                      step="0.5"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Status & Other Details */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Task Configuration
                </h3>

                {/* Status */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Status *
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger
                      className={cn(
                        "mt-1",
                        validationErrors.status && "border-red-300"
                      )}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((statusOption) => (
                        <SelectItem
                          key={statusOption.value}
                          value={statusOption.value}
                        >
                          {statusOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.status && (
                    <p className="text-red-600 text-sm mt-1">
                      {validationErrors.status}
                    </p>
                  )}
                </div>

                {/* Document Path */}
                <div className="mb-4">
                  <Label
                    htmlFor="documentPath"
                    className="text-sm font-medium text-gray-700"
                  >
                    Document Path
                  </Label>
                  <Input
                    id="documentPath"
                    value={documentPath}
                    onChange={(e) => setDocumentPath(e.target.value)}
                    placeholder="Enter document path (optional)"
                    className="mt-1"
                  />
                </div>

                {/* Commit ID */}
                <div>
                  <Label
                    htmlFor="commitId"
                    className="text-sm font-medium text-gray-700"
                  >
                    Commit ID
                  </Label>
                  <Input
                    id="commitId"
                    value={commitId}
                    onChange={(e) => setCommitId(e.target.value)}
                    placeholder="Enter commit ID (optional)"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Date Fields */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-purple-500" />
                  Important Dates
                </h3>

                <div className="space-y-4">
                  {/* Received Date */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Received Date *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !receivedDate && "text-muted-foreground",
                            validationErrors.receivedDate && "border-red-300"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {receivedDate ? (
                            format(receivedDate, "PPP")
                          ) : (
                            <span>Pick received date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={receivedDate}
                          onSelect={setReceivedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {validationErrors.receivedDate && (
                      <p className="text-red-600 text-sm mt-1">
                        {validationErrors.receivedDate}
                      </p>
                    )}
                  </div>

                  {/* Development Start Date */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Development Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !developmentStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {developmentStartDate ? (
                            format(developmentStartDate, "PPP")
                          ) : (
                            <span>Pick development start date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={developmentStartDate}
                          onSelect={setDevelopmentStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
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

          {/* Team Assignment */}
          {selectedProjectId && projectTeammates.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Team Assignment
              </h3>
              <DisciplineBasedTeammateSelector
                developers={developers}
                testers={testers}
                selectedDeveloperIds={selectedDeveloperIds}
                selectedTesterIds={selectedTesterIds}
                onDeveloperToggle={(id) => {
                  setSelectedDeveloperIds((prev) =>
                    prev.includes(id)
                      ? prev.filter((devId) => devId !== id)
                      : [...prev, id]
                  );
                }}
                onTesterToggle={(id) => {
                  setSelectedTesterIds((prev) =>
                    prev.includes(id)
                      ? prev.filter((testId) => testId !== id)
                      : [...prev, id]
                  );
                }}
              />
            </div>
          )}

          {/* Description */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Task Description
            </h3>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              className="min-h-[120px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 px-6"
            disabled={addTaskMutation.isPending}
          >
            {addTaskMutation.isPending ? "Adding..." : "Add Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
