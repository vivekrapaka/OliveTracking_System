
import { useState, useEffect } from "react";
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
import { useEditTask } from "@/hooks/useEditTask";

interface Task {
  id: number;
  taskNumber: string;
  name: string;
  description?: string;
  issueType: string;
  receivedDate: string;
  developmentStartDate: string;
  currentStage: string;
  dueDate: string;
  assignedTeammates: string[];
  priority: string;
  isCompleted: boolean;
  isCmcDone: boolean;
}

interface Teammate {
  id: number;
  name: string;
  role: string;
}

interface EditTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (updatedTask: Task) => void;
  teammates: Teammate[];
}

export const EditTaskDialog = ({ isOpen, onClose, task, onSave, teammates }: EditTaskDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedStartDate, setSelectedStartDate] = useState<Date>();
  const [selectedReceivedDate, setSelectedReceivedDate] = useState<Date>();
  const [selectedDevelopmentStartDate, setSelectedDevelopmentStartDate] = useState<Date>();
  const [editData, setEditData] = useState<Partial<Task>>({});
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);
  const [isCodeReviewDone, setIsCodeReviewDone] = useState(false);

  const editTaskMutation = useEditTask();

  const stages = ["SIT", "DEV", "Pre-Prod", "Prod", "FSD", "UAT"];
  const issueTypes = ["Feature", "Bug", "Enhancement"];
  const priorities = ["HIGH", "MEDIUM", "LOW"];

  useEffect(() => {
    if (task) {
      setEditData(task);
      setSelectedTeammates(task.assignedTeammates || []);
      setIsCodeReviewDone(false); // Default value since it's not in the task interface
      
      if (task.dueDate) {
        setSelectedDate(new Date(task.dueDate));
      }
      if (task.developmentStartDate) {
        setSelectedDevelopmentStartDate(new Date(task.developmentStartDate));
      }
      if (task.receivedDate) {
        setSelectedReceivedDate(new Date(task.receivedDate));
      }
    }
  }, [task]);

  const handleTeammateToggle = (teammateName: string) => {
    setSelectedTeammates(prev => {
      const updated = prev.includes(teammateName)
        ? prev.filter(name => name !== teammateName)
        : [...prev, teammateName];

      setEditData(current => ({ ...current, assignedTeammates: updated }));
      return updated;
    });
  };

  const handleSave = () => {
    if (!task) return;
    
    const taskData = {
      taskName: editData.name || task.name,
      description: editData.description || task.description || "",
      currentStage: editData.currentStage || task.currentStage,
      startDate: selectedStartDate ? format(selectedStartDate, "yyyy-MM-dd") : "",
      dueDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : task.dueDate,
      isCompleted: editData.currentStage === "Completed" || editData.isCompleted || false,
      issueType: editData.issueType || task.issueType,
      receivedDate: selectedReceivedDate ? format(selectedReceivedDate, "yyyy-MM-dd") : task.receivedDate,
      developmentStartDate: selectedDevelopmentStartDate ? format(selectedDevelopmentStartDate, "yyyy-MM-dd") : task.developmentStartDate,
      isCodeReviewDone: isCodeReviewDone,
      isCmcDone: editData.isCmcDone !== undefined ? editData.isCmcDone : task.isCmcDone,
      assignedTeammateNames: selectedTeammates,
      priority: editData.priority || task.priority,
    };

    editTaskMutation.mutate({
      taskName: task.name, // Use original task name for the API call
      taskData
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="editTaskNumber">Task Number</Label>
            <Input
              id="editTaskNumber"
              value={task.taskNumber}
              readOnly
              className="bg-gray-100 border border-gray-300"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="editTaskName">Task Name</Label>
            <Input
              id="editTaskName"
              defaultValue={task.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="editIssueType">Issue Type</Label>
            <Select defaultValue={task.issueType} onValueChange={(value) => setEditData({...editData, issueType: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="editPriority">Priority</Label>
            <Select defaultValue={task.priority} onValueChange={(value) => setEditData({...editData, priority: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
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
                  className="pointer-events-auto"
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
                    !selectedStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedStartDate ? format(selectedStartDate, "PPP") : <span>Pick start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedStartDate}
                  onSelect={setSelectedStartDate}
                  initialFocus
                  className="pointer-events-auto"
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
                  className="pointer-events-auto"
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="editStage">Current Stage</Label>
            <Select defaultValue={task.currentStage} onValueChange={(value) => setEditData({...editData, currentStage: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
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
            <Label htmlFor="editIsCodeReviewDone">Code Review Done</Label>
            <Select value={isCodeReviewDone ? "true" : "false"} onValueChange={(value) => setIsCodeReviewDone(value === "true")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="editIsCmcDone">CMC Done</Label>
            <Select defaultValue={task.isCmcDone ? "true" : "false"} onValueChange={(value) => setEditData({...editData, isCmcDone: value === "true"})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="editTaskDescription">Description</Label>
            <Textarea
              id="editTaskDescription"
              defaultValue={task.description || ""}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              placeholder="Enter task description (max 1000 words)"
              maxLength={1000}
              className="min-h-[100px]"
            />
            <p className="text-xs text-slate-500">{(editData.description || task.description || "").length}/1000 characters</p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
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
      </DialogContent>
    </Dialog>
  );
};
