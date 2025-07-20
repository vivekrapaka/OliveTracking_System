import { useState, useEffect } from "react";
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
import {
  CalendarIcon,
  AlertTriangle,
  Code,
  TestTube,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEditTask } from "@/hooks/useEditTask";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectTeammates } from "@/hooks/useProjectTeammates";
import {
  getAvailableStatuses,
  requiresCommitId,
  requiresComment,
} from "@/utils/statusWorkflowUtils";
import { DisciplineBasedTeammateSelector } from "./DisciplineBasedTeammateSelector";

const statusLabelMap: Record<string, string> = {
  BACKLOG: "Backlog",
  ANALYSIS: "Analysis",
  DEVELOPMENT: "Development",
  CODE_REVIEW: "Code Review",
  UAT_TESTING: "UAT Testing",
  UAT_FAILED: "UAT Failed",
  READY_FOR_PREPROD: "Ready for Pre-Production",
  PREPROD: "Pre-Production",
  PROD: "Production",
  COMPLETED: "Completed",
};

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
  developerName?: string;
  testerName?: string;
  priority: string;
  projectId: number;
  projectName: string;
  documentPath?: string;
  commitId?: string;
  developmentDueHours?: number;
  testingDueHours?: number;
  assignedDeveloperIds: number[];
  assignedTesterIds: number[];
}

interface Teammate {
  id: number;
  name: string;
  role: string;
  functionalGroup: string;
}

interface TaskDetailsTabProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  teammates: Teammate[];
  onClose: () => void;
}

export const TaskDetailsTab = ({
  task,
  onSave,
  teammates,
  onClose,
}: TaskDetailsTabProps) => {
  const { user } = useAuth();
  const [taskName, setTaskName] = useState(task.name);
  const [description, setDescription] = useState(task.description || "");
  const [currentStage, setCurrentStage] = useState(task.status);
  const [taskType, setTaskType] = useState(task.taskType);
  const [priority, setPriority] = useState(task.priority);
  const [commitId, setCommitId] = useState(task.commitId || "");
  const [comment, setComment] = useState("");
  const [selectedReceivedDate, setSelectedReceivedDate] = useState<Date>();
  const [selectedDevelopmentStartDate, setSelectedDevelopmentStartDate] =
    useState<Date>();
  const [selectedDeveloperIds, setSelectedDeveloperIds] = useState<number[]>(
    []
  );
  const [selectedTesterIds, setSelectedTesterIds] = useState<number[]>([]);
  const [developmentDueHours, setDevelopmentDueHours] = useState(
    task.developmentDueHours || 0
  );
  const [testingDueHours, setTestingDueHours] = useState(
    task.testingDueHours || 0
  );
  const [selectedProjectId, setSelectedProjectId] = useState<
    number | undefined
  >();
  const editTaskMutation = useEditTask();

  // Fetch project teammates
  const { data: projectTeammatesData } = useProjectTeammates(task.projectId);
  const projectTeammates = projectTeammatesData?.teammates || [];

  // Separate developers and testers from project teammates
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

  // Get available status transitions based on current status and user functionalGroup
  const availableStatusTransitions = getAvailableStatuses(
    currentStage,
    user?.functionalGroup || ""
  );
  // Check if the status dropdown should be disabled
  const isStatusDropdownDisabled = availableStatusTransitions.length === 0;

  // Check if commit ID is required for the selected status
  const isCommitIdRequired = requiresCommitId(currentStage);
  const showCommitIdField = isCommitIdRequired;

  // Check if comment is required for the status change
  const isCommentRequired = requiresComment(task.status, currentStage);
  const showCommentField =
    isCommentRequired ||  
    (task.status === "CODE_REVIEW" && availableStatusTransitions.length > 0) ||
    (task.status === "UAT_TESTING" && currentStage === "UAT_FAILED") ||
    (task.status === "UAT_FAILED" && currentStage === "UAT_TESTING") ||
    (task.status === "CODE_REVIEW" && currentStage === "UAT_TESTING") ||
    (task.status === "CODE_REVIEW" && currentStage === "DEVELOPMENT");

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

  useEffect(() => {
    setTaskName(task.name);
    setDescription(task.description || "");
    setCurrentStage(currentStage);
    setTaskType(task.taskType);
    setPriority(task.priority);
    setCommitId(task.commitId || "");
    setSelectedProjectId(task.projectId);
    setDevelopmentDueHours(task.developmentDueHours || 0);
    setTestingDueHours(task.testingDueHours || 0);

    if (task.receivedDate) {
      setSelectedReceivedDate(new Date(task.receivedDate));
    }
    if (task.developmentStartDate) {
      setSelectedDevelopmentStartDate(new Date(task.developmentStartDate));
    }
    console.log("Edit Task Loaded:", task);
    // Set initial developer and tester selections based on project teammates
    setSelectedDeveloperIds(task.assignedDeveloperIds);
    setSelectedTesterIds(task.assignedTesterIds); 
  }, [task, projectTeammates]);

  const handleStatusChange = (newStatus: string) => {
    setCurrentStage(newStatus);
    if (!requiresCommitId(newStatus)) {
      setCommitId("");
    }
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
      receivedDate: selectedReceivedDate
        ? format(selectedReceivedDate, "yyyy-MM-dd")
        : task.receivedDate,
      developmentStartDate: selectedDevelopmentStartDate
        ? format(selectedDevelopmentStartDate, "yyyy-MM-dd")
        : task.developmentStartDate,
      developerIds: selectedDeveloperIds,
      testerIds: selectedTesterIds,
      priority: priority,
      commitId: commitId.trim() || undefined,
      comment: comment.trim() || undefined,
      developmentDueHours: developmentDueHours,
      testingDueHours: testingDueHours,
    };

    editTaskMutation.mutate(
      {
        taskId: task.id,
        taskData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto">
      {/* Header with Task Number */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-mono text-lg font-bold shadow-md">
            {task.taskNumber}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{task.name}</h2>
            <p className="text-sm text-gray-600">{task.projectName}</p>
          </div>
        </div>
        {task.status === "UAT_FAILED" && (
          <div className="mt-3 flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-200">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">UAT Failed - Requires attention</span>
          </div>
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

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="taskName"
                  className="text-sm font-medium text-gray-700"
                >
                  Task Name
                </Label>
                <Input
                  id="taskName"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="taskType"
                    className="text-sm font-medium text-gray-700"
                  >
                    Task Type
                  </Label>
                  <Select value={taskType} onValueChange={setTaskType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="priority"
                    className="text-sm font-medium text-gray-700"
                  >
                    Priority
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priorityOption) => (
                        <SelectItem key={priorityOption} value={priorityOption}>
                          {priorityOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                  Development Hours
                </Label>
                <Input
                  id="developmentDueHours"
                  type="number"
                  value={developmentDueHours}
                  onChange={(e) =>
                    setDevelopmentDueHours(Number(e.target.value))
                  }
                  className="mt-1"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <Label
                  htmlFor="testingDueHours"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4 text-green-500" />
                  Testing Hours
                </Label>
                <Input
                  id="testingDueHours"
                  type="number"
                  value={testingDueHours}
                  onChange={(e) => setTestingDueHours(Number(e.target.value))}
                  className="mt-1"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-purple-500" />
              Important Dates
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Received Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !selectedReceivedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedReceivedDate ? (
                        format(selectedReceivedDate, "PPP")
                      ) : (
                        <span>Pick received date</span>
                      )}
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
                        !selectedDevelopmentStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDevelopmentStartDate ? (
                        format(selectedDevelopmentStartDate, "PPP")
                      ) : (
                        <span>Pick development start date</span>
                      )}
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
            </div>
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Management
            </h3>

            <div>
              <Label
                htmlFor="status"
                className="text-sm font-medium text-gray-700"
              >
                Current Status
              </Label>
              <Select
                value={currentStage}
                onValueChange={handleStatusChange}
                disabled={isStatusDropdownDisabled}
              >
                <SelectTrigger
                  className={cn(
                    "mt-1",
                    isStatusDropdownDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <SelectValue placeholder="Select status">
                    {statusLabelMap[currentStage] || currentStage}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableStatusTransitions.map((statusOption) => (
                    <SelectItem
                      key={statusOption.value}
                      value={statusOption.value}
                    >
                      {statusOption.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isStatusDropdownDisabled && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-2 border border-amber-200">
                  No status changes available for your role at this stage.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Assignment Section */}
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

      {/* Conditional Fields */}
      {(showCommentField || showCommitIdField) && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Information
          </h3>

          <div className="space-y-4">
            {showCommentField && (
              <div>
                <Label
                  htmlFor="comment"
                  className="text-sm font-medium text-gray-700"
                >
                  Comment{" "}
                  {isCommentRequired && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    isCommentRequired
                      ? "A comment is required for this status transition..."
                      : "Add a comment about this status change (optional)..."
                  }
                  className={cn(
                    "min-h-[80px] mt-1",
                    isCommentRequired &&
                      !comment.trim() &&
                      "border-red-300 focus:border-red-500"
                  )}
                />
                {isCommentRequired && !comment.trim() && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2 border border-red-200">
                    A comment is required for this status transition.
                  </p>
                )}
              </div>
            )}

            {showCommitIdField && (
              <div>
                <Label
                  htmlFor="commitId"
                  className="text-sm font-medium text-gray-700"
                >
                  Commit ID{" "}
                  {isCommitIdRequired && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Input
                  id="commitId"
                  value={commitId}
                  onChange={(e) => setCommitId(e.target.value)}
                  placeholder="Enter commit ID (required for UAT Testing and Pre-Production)"
                  className={cn(
                    "mt-1",
                    isCommitIdRequired &&
                      !commitId.trim() &&
                      "border-red-300 focus:border-red-500"
                  )}
                />
                {isCommitIdRequired && !commitId.trim() && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2 border border-red-200">
                    Commit ID is required when moving to UAT Testing or
                    Pre-Production.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Task Description
        </h3>
        <Textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (max 1000 words)"
          maxLength={1000}
          className="min-h-[120px]"
        />
        <p className="text-xs text-gray-500 mt-2">
          {description.length}/1000 characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={onClose} className="px-6">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 px-6"
          disabled={editTaskMutation.isPending || !isFormValid()}
        >
          {editTaskMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
