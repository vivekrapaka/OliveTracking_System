
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
import { toast } from "@/hooks/use-toast";
import { TeammateSelector } from "./TeammateSelector";

interface Task {
  id: number;
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
  const [editData, setEditData] = useState<Partial<Task>>({});
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);

  const stages = ["Planning", "Development", "Review", "Testing", "Completed"];
  const issueTypes = ["Feature", "Bug", "Task", "Enhancement"];
  const priorities = ["Low", "Medium", "High", "Critical"];

  useEffect(() => {
    if (task) {
      setEditData(task);
      setSelectedTeammates(task.assignedTeammates || []);
      if (task.dueDate) {
        setSelectedDate(new Date(task.dueDate));
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
    
    const updatedTask = {
      ...task,
      ...editData,
      assignedTeammates: selectedTeammates,
      dueDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : task.dueDate,
      isCompleted: editData.currentStage === "Completed"
    };
    onSave(updatedTask);
    toast({
      title: "Task Updated",
      description: "Task has been updated successfully.",
    });
    onClose();
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
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
