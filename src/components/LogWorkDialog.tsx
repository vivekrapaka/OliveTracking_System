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
import apiClient from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";

interface LogWorkDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Task {
  id: number;
  name: string;
  taskType: string;
  projectName: string;
}

export const LogWorkDialog = ({ isOpen, onClose }: LogWorkDialogProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hoursSpent, setHoursSpent] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiClient.get("/api/tasks").then(res => {
        setTasks(res.data.tasks || []);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId) || null;
      setSelectedTask(task);
    } else {
      setSelectedTask(null);
    }
    setDescription("");
  }, [selectedTaskId, tasks]);

  const isGeneralActivity = selectedTask?.taskType === "GENERAL_ACTIVITY" && !selectedTask?.name.includes("Idle Time");
  const isDescriptionRequired = isGeneralActivity;
  const canSubmit = !!selectedTaskId && hoursSpent && (!isDescriptionRequired || description.trim());

  const handleSubmit = async () => {
    if (!selectedTaskId) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/api/tasks/${selectedTaskId}/worklogs`, {
        hoursSpent: parseFloat(hoursSpent),
        logDate: format(selectedDate, "yyyy-MM-dd"),
        description: description.trim(),
      });
      toast({ title: "Work Logged", description: "Your work time has been logged successfully." });
      setHoursSpent("");
      setDescription("");
      setSelectedTaskId(null);
      setSelectedDate(new Date());
      onClose();
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast({
          title: "Description Required",
          description: "A description is required for this activity.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to log work. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Work</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">Task *</Label>
            <Select value={selectedTaskId?.toString() || ""} onValueChange={v => setSelectedTaskId(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a task..." />
              </SelectTrigger>
              <SelectContent>
                {tasks.map(task => (
                  <SelectItem key={task.id} value={task.id.toString()}>
                    {task.projectName ? `${task.projectName} - ` : ""}{task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoursSpent">Hours Spent *</Label>
            <Input
              id="hoursSpent"
              type="number"
              step="0.5"
              min="0.1"
              placeholder="e.g., 1.5"
              value={hoursSpent}
              onChange={e => setHoursSpent(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Work Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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
                  onSelect={date => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description{isDescriptionRequired ? " *" : " (optional)"}
            </Label>
            <Textarea
              id="description"
              placeholder={isDescriptionRequired ? "A description is required for this activity." : "Describe the work you completed..."}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="min-h-[80px]"
              required={isDescriptionRequired}
            />
            {isDescriptionRequired && !description.trim() && (
              <div className="text-sm text-red-600">A description is required for this activity.</div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Logging..." : "Log Time"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 