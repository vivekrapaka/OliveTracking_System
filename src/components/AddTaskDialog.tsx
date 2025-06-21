
import { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

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
  const { user } = useAuth(); // Get user from AuthContext

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
  const [documentPath, setDocumentPath] = useState(""); // NEW: documentPath

  const addTaskMutation = useAddTask();
  const { data: taskSequenceNumber, isLoading: isLoadingSequence, refetch: refetchSequence } = useTaskSequenceNumber();

  const stages = ["SIT", "DEV", "Pre-Prod", "Prod", "FSD", "UAT"];
  const issueTypes = ["Feature", "Bug", "Enhancement"];
  const priorities = ["HIGH", "MEDIUM", "LOW"];

  const handleTeammateToggle = (teammateName: string) => {
    setSelectedTeammates(prev => {
      return prev.includes(teammateName)
        ? prev.filter(name => name !== teammateName)
        : [...prev, teammateName];
    });
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
    setDocumentPath(""); // NEW: reset documentPath
  };

  const handleSave = () => {
    if (!taskName || !currentStage || !issueType || !priority || !receivedDate || !dueDate || user?.projectId === undefined) {
      // Added user?.projectId check
      return;
    }

    const taskData = {
      taskName,
      description,
      currentStage,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined, // Changed to undefined if not present
      dueDate: format(dueDate, "yyyy-MM-dd"),
      issueType,
      receivedDate: format(receivedDate, "yyyy-MM-dd"),
      developmentStartDate: developmentStartDate ? format(developmentStartDate, "yyyy-MM-dd") : undefined, // Changed to undefined if not present
      assignedTeammateNames: selectedTeammates,
      priority,
      projectId: user.projectId, // NEW: Pass projectId from user context
      documentPath: documentPath || undefined, // NEW: Pass documentPath, or undefined if empty
    };

    addTaskMutation.mutate(taskData, {
      onSuccess: () => {
        resetForm();
        refetchSequence(); // Refresh sequence number for next task
        onClose();
      }
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          {/* Task Sequence Number */}
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

          <div className="grid gap-2">
            <Label htmlFor="taskName">Task Name *</Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Current Stage *</Label>
            <Select value={currentStage} onValueChange={setCurrentStage} required>
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

          <div className="grid gap-2">
            <Label>Issue Type *</Label>
            <Select value={issueType} onValueChange={setIssueType} required>
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
            <Label>Priority *</Label>
            <Select value={priority} onValueChange={setPriority} required>
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
            <Label>Received Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !receivedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {receivedDate ? format(receivedDate, "PPP") : <span>Pick received date</span>}
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
          </div>

          <div className="grid gap-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
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
                    !developmentStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {developmentStartDate ? format(developmentStartDate, "PPP") : <span>Pick development start date</span>}
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

          <div className="grid gap-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick due date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <TeammateSelector
            teammates={teammates}
            selectedTeammates={selectedTeammates}
            onTeammateToggle={handleTeammateToggle}
          />

          <div className="grid gap-2">
            <Label htmlFor="documentPath">Document Path</Label>
            <Input
              id="documentPath"
              value={documentPath}
              onChange={(e) => setDocumentPath(e.target.value)}
              placeholder="Enter document path (optional)"
            />
          </div>

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
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={addTaskMutation.isPending}
          >
            {addTaskMutation.isPending ? "Adding..." : "Add Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


