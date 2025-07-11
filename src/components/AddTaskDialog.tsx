import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useAddTask } from "@/hooks/useAddTask";
import { useTeammatesData } from "@/hooks/useTeammatesData";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "@/hooks/use-toast";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTaskDialog = ({ open, onOpenChange }: AddTaskDialogProps) => {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState("");
  const [priority, setPriority] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDevelopmentStartDate, setSelectedDevelopmentStartDate] = useState<Date>();
  const [selectedReceivedDate, setSelectedReceivedDate] = useState<Date>();
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);
  const [parentTaskId, setParentTaskId] = useState("");

  const addTaskMutation = useAddTask();
  const { data: teammatesApiData } = useTeammatesData();
  const { data: projects = [] } = useProjects();

  const teammates = teammatesApiData?.teammates?.map(teammate => ({
    id: teammate.id,
    name: teammate.name,
    role: teammate.role
  })) || [];

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
    setTaskType("");
    setPriority("");
    setSelectedProjectId(null);
    setSelectedDate(undefined);
    setSelectedDevelopmentStartDate(undefined);
    setSelectedReceivedDate(undefined);
    setSelectedTeammates([]);
    setParentTaskId("");
  };

  const handleSubmit = () => {
    if (!taskName || !taskType || !priority || !selectedProjectId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including project selection",
        variant: "destructive"
      });
      return;
    }

    const taskData = {
      taskName,
      description,
      taskType,
      priority,
      projectId: selectedProjectId,
      dueDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
      developmentStartDate: selectedDevelopmentStartDate ? format(selectedDevelopmentStartDate, "yyyy-MM-dd") : undefined,
      receivedDate: selectedReceivedDate ? format(selectedReceivedDate, "yyyy-MM-dd") : undefined,
      assignedTeammateNames: selectedTeammates,
      parentTaskId: parentTaskId ? parseInt(parentTaskId) : undefined,
      status: "BACKLOG"
    };

    addTaskMutation.mutate(taskData, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="taskName">Task Name *</Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project">Project *</Label>
            <Select value={selectedProjectId?.toString() || ""} onValueChange={(value) => setSelectedProjectId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="taskType">Task Type *</Label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priorityOption) => (
                  <SelectItem key={priorityOption} value={priorityOption}>{priorityOption}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="parentTaskId">Parent Task ID (Optional)</Label>
            <Input
              id="parentTaskId"
              value={parentTaskId}
              onChange={(e) => setParentTaskId(e.target.value)}
              placeholder="Enter parent task ID if this is a sub-task"
              type="number"
            />
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={addTaskMutation.isPending}
            >
              {addTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
