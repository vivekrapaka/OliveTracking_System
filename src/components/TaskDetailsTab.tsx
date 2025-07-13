
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEditTask } from "@/hooks/useEditTask";
import { useAuth } from "@/contexts/AuthContext";
import { getAvailableStatuses, requiresCommitId, requiresComment } from "@/utils/statusWorkflowUtils";
import { DisciplineBasedTeammateSelector } from "./DisciplineBasedTeammateSelector";

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
  const [selectedDeveloperIds, setSelectedDeveloperIds] = useState<number[]>([]);
  const [selectedTesterIds, setSelectedTesterIds] = useState<number[]>([]);
  const [developmentDueHours, setDevelopmentDueHours] = useState(task.developmentDueHours || 0);
  const [testingDueHours, setTestingDueHours] = useState(task.testingDueHours || 0);

  const editTaskMutation = useEditTask();

  // Get available status transitions based on current status and user functionalGroup
  const availableStatusTransitions = getAvailableStatuses(
    task.status,
    user?.functionalGroup || ""
  );

  // Check if the status dropdown should be disabled
  const isStatusDropdownDisabled = availableStatusTransitions.length === 0;

  // Check if commit ID is required for the selected status
  const isCommitIdRequired = requiresCommitId(currentStage);
  const showCommitIdField = isCommitIdRequired;

  // Check if comment is required for the status change
  const isCommentRequired = requiresComment(task.status, currentStage);
  const showCommentField = isCommentRequired || 
    (task.status === "CODE_REVIEW" && availableStatusTransitions.length > 0) ||
    (task.status === "UAT_TESTING" && currentStage === "UAT_FAILED") ||
    (task.status === "UAT_FAILED" && currentStage === "UAT_TESTING");

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

  // Separate developers and testers
  const developers = teammates.filter(t => 
    t.functionalGroup === "DEVELOPER" || t.functionalGroup === "DEV_LEAD"
  );
  const testers = teammates.filter(t => 
    t.functionalGroup === "TESTER" || t.functionalGroup === "TEST_LEAD"
  );

  useEffect(() => {
    setTaskName(task.name);
    setDescription(task.description || "");
    setCurrentStage(task.status);
    setTaskType(task.taskType);
    setPriority(task.priority);
    setCommitId(task.commitId || "");
    setDevelopmentDueHours(task.developmentDueHours || 0);
    setTestingDueHours(task.testingDueHours || 0);
    
    if (task.dueDate) {
      setSelectedDate(new Date(task.dueDate));
    }
    if (task.developmentStartDate) {
      setSelectedDevelopmentStartDate(new Date(task.developmentStartDate));
    }
    if (task.receivedDate) {
      setSelectedReceivedDate(new Date(task.receivedDate));
    }

    // Set initial developer and tester selections based on task data
    const devIds = teammates
      .filter(t => (t.functionalGroup === "DEVELOPER" || t.functionalGroup === "DEV_LEAD") && 
                   task.assignedTeammates.includes(t.name))
      .map(t => t.id);
    const testIds = teammates
      .filter(t => (t.functionalGroup === "TESTER" || t.functionalGroup === "TEST_LEAD") && 
                   task.assignedTeammates.includes(t.name))
      .map(t => t.id);
    
    setSelectedDeveloperIds(devIds);
    setSelectedTesterIds(testIds);
  }, [task, teammates]);

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
      dueDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : task.dueDate,
      receivedDate: selectedReceivedDate ? format(selectedReceivedDate, "yyyy-MM-dd") : task.receivedDate,
      developmentStartDate: selectedDevelopmentStartDate ? format(selectedDevelopmentStartDate, "yyyy-MM-dd") : task.developmentStartDate,
      developerIds: selectedDeveloperIds,
      testerIds: selectedTesterIds,
      priority: priority,
      commitId: commitId.trim() || undefined,
      comment: comment.trim() || undefined,
      developmentDueHours: developmentDueHours,
      testingDueHours: testingDueHours,
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
    <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto professional-scrollbar">
      {/* Header with Task Number */}
      <div className="bg-gradient-to-r from-professional-blue/10 to-professional-cyan/10 p-4 rounded-lg border border-professional-blue/20">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-professional-navy to-professional-blue text-white px-3 py-1 rounded-lg font-mono text-sm font-bold shadow-professional">
            {task.taskNumber}
          </div>
          <h2 className="text-lg font-semibold text-professional-navy">{task.name}</h2>
          {task.status === "UAT_FAILED" && (
            <div className="flex items-center gap-1 bg-professional-red/10 text-professional-red-dark px-2 py-1 rounded-full border border-professional-red/30">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">UAT Failed</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="taskName" className="text-professional-navy font-medium">Task Name</Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="professional-input"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="taskType" className="text-professional-navy font-medium">Task Type</Label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger className="professional-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-professional-slate/30">
                {taskTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority" className="text-professional-navy font-medium">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="professional-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-professional-slate/30">
                {priorities.map((priorityOption) => (
                  <SelectItem key={priorityOption} value={priorityOption}>{priorityOption}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Hours Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="developmentDueHours" className="text-professional-navy font-medium">Dev Due Hours</Label>
              <Input
                id="developmentDueHours"
                type="number"
                value={developmentDueHours}
                onChange={(e) => setDevelopmentDueHours(Number(e.target.value))}
                className="professional-input"
                min="0"
                step="0.5"
              />
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
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Date Fields */}
          <div className="grid gap-2">
            <Label className="text-professional-navy font-medium">Received Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal professional-input",
                    !selectedReceivedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedReceivedDate ? format(selectedReceivedDate, "PPP") : <span>Pick received date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-md border-professional-slate/30" align="start">
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
            <Label className="text-professional-navy font-medium">Development Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal professional-input",
                    !selectedDevelopmentStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDevelopmentStartDate ? format(selectedDevelopmentStartDate, "PPP") : <span>Pick development start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-md border-professional-slate/30" align="start">
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
            <Label className="text-professional-navy font-medium">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal professional-input",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-md border-professional-slate/30" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="grid gap-2">
        <Label htmlFor="status" className="text-professional-navy font-medium">Status</Label>
        <Select 
          value={currentStage} 
          onValueChange={handleStatusChange}
          disabled={isStatusDropdownDisabled}
        >
          <SelectTrigger className={cn("professional-input", isStatusDropdownDisabled && "opacity-50 cursor-not-allowed")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-professional-slate/30">
            {availableStatusTransitions.map((status) => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isStatusDropdownDisabled && (
          <p className="text-xs text-professional-slate-dark bg-professional-yellow/10 p-2 rounded border border-professional-yellow/30">
            No status changes available for your role at this stage.
          </p>
        )}
      </div>

      {/* Team Assignment Section */}
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

      {/* Conditional Fields */}
      {showCommentField && (
        <div className="grid gap-2">
          <Label htmlFor="comment" className="text-professional-navy font-medium">
            Comment {isCommentRequired && <span className="text-professional-red">*</span>}
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
              "min-h-[80px] professional-input",
              isCommentRequired && !comment.trim() && "border-professional-red focus:border-professional-red"
            )}
          />
          {isCommentRequired && !comment.trim() && (
            <p className="text-xs text-professional-red bg-professional-red/10 p-2 rounded border border-professional-red/30">
              A comment is required for this status transition.
            </p>
          )}
        </div>
      )}

      {showCommitIdField && (
        <div className="grid gap-2">
          <Label htmlFor="commitId" className="text-professional-navy font-medium">
            Commit ID {isCommitIdRequired && <span className="text-professional-red">*</span>}
          </Label>
          <Input
            id="commitId"
            value={commitId}
            onChange={(e) => setCommitId(e.target.value)}
            placeholder="Enter commit ID (required for UAT Testing and Pre-Production)"
            className={cn(
              "professional-input",
              isCommitIdRequired && !commitId.trim() && "border-professional-red focus:border-professional-red"
            )}
          />
          {isCommitIdRequired && !commitId.trim() && (
            <p className="text-xs text-professional-red bg-professional-red/10 p-2 rounded border border-professional-red/30">
              Commit ID is required when moving to UAT Testing or Pre-Production.
            </p>
          )}
        </div>
      )}
      
      <div className="grid gap-2">
        <Label htmlFor="taskDescription" className="text-professional-navy font-medium">Description</Label>
        <Textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (max 1000 words)"
          maxLength={1000}
          className="min-h-[100px] professional-input"
        />
        <p className="text-xs text-professional-slate-dark">{description.length}/1000 characters</p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-professional-slate/20">
        <Button variant="outline" onClick={onClose} className="hover:bg-professional-slate/10">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          className="professional-button shadow-professional-lg"
          disabled={editTaskMutation.isPending || !isFormValid()}
        >
          {editTaskMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
