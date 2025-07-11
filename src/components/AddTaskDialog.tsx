
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddTask } from "@/hooks/useAddTask";
import { useTaskSequenceNumber } from "@/hooks/useTaskSequenceNumber";
import { useAuth } from "@/contexts/AuthContext";
import { TeammateSelector } from "./TeammateSelector";
import { useTeammatesData } from "@/hooks/useTeammatesData";
import { ParentTaskSelector } from "./ParentTaskSelector";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTaskDialog = ({ open, onOpenChange }: AddTaskDialogProps) => {
  const { user } = useAuth();
  const { data: teammatesData } = useTeammatesData();
  const { data: nextSequenceNumber } = useTaskSequenceNumber();
  const addTaskMutation = useAddTask();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [selectedTeammates, setSelectedTeammates] = useState<string[]>([]);
  const [parentTaskId, setParentTaskId] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setSelectedTeammates([]);
      setParentTaskId(null);
      setValidationErrors({});
      setSelectedProjectId(null);
    }
  }, [open]);

  const teammates = teammatesData?.teammates || [];

  const handleTeammateToggle = (teammateName: string) => {
    setSelectedTeammates(prev => 
      prev.includes(teammateName)
        ? prev.filter(name => name !== teammateName)
        : [...prev, teammateName]
    );
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    }

    if (!selectedProjectId) {
      errors.projectId = "Project selection is required";
    }

    if (!description.trim()) {
      errors.description = "Description is required";
    }

    if (selectedTeammates.length === 0) {
      errors.teammates = "At least one teammate must be assigned";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Get teammate IDs based on selected names
    const teammateIds = teammates
      .filter(teammate => selectedTeammates.includes(teammate.name))
      .map(teammate => teammate.id);

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignedUserIds: teammateIds,
      parentTaskId: parentTaskId || undefined,
      projectId: selectedProjectId,
    };

    addTaskMutation.mutate(taskData, {
      onSuccess: () => {
        onOpenChange(false);
      },
      onError: (error) => {
        console.error('Error adding task:', error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
        {/* Project Selection */}
        <div className="grid gap-2">
          <Label>Project *</Label>
          <Select
            value={selectedProjectId?.toString()}
            onValueChange={(value) => setSelectedProjectId(Number(value))}
          >
            <SelectTrigger className={validationErrors.projectId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {user?.projectNames?.map((projectName, index) => {
                const projectId = user.projectIds[index];
                return (
                  <SelectItem key={projectId} value={projectId.toString()}>
                    {projectName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {validationErrors.projectId && (
            <p className="text-red-500 text-sm">{validationErrors.projectId}</p>
          )}
        </div>

        {/* Task Number */}
        <div className="grid gap-2">
          <Label>Task Number</Label>
          <Input
            value={`TASK-${nextSequenceNumber || '001'}`}
            disabled
            className="bg-muted"
          />
        </div>

        {/* Title */}
        <div className="grid gap-2">
          <Label>Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className={validationErrors.title ? "border-red-500" : ""}
          />
          {validationErrors.title && (
            <p className="text-red-500 text-sm">{validationErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label>Description *</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={3}
            className={validationErrors.description ? "border-red-500" : ""}
          />
          {validationErrors.description && (
            <p className="text-red-500 text-sm">{validationErrors.description}</p>
          )}
        </div>

        {/* Priority */}
        <div className="grid gap-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Parent Task */}
        <ParentTaskSelector 
          selectedParentTaskId={parentTaskId}
          onParentTaskChange={setParentTaskId}
        />

        {/* Teammate Assignment */}
        <div className="space-y-2">
          <TeammateSelector
            teammates={teammates}
            selectedTeammates={selectedTeammates}
            onTeammateToggle={handleTeammateToggle}
          />
          {validationErrors.teammates && (
            <p className="text-red-500 text-sm">{validationErrors.teammates}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={addTaskMutation.isPending}
          >
            {addTaskMutation.isPending ? "Adding..." : "Add Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
