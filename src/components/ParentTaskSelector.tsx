
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParentTask {
  id: number;
  name: string;
  taskNumber: string;
  taskType: string;
}

interface ParentTaskSelectorProps {
  availableTasks: ParentTask[];
  selectedTaskId?: number;
  onTaskSelect: (taskId: number | undefined) => void;
  disabled?: boolean;
  currentTaskType?: string;
}

export const ParentTaskSelector = ({
  availableTasks,
  selectedTaskId,
  onTaskSelect,
  disabled = false,
  currentTaskType
}: ParentTaskSelectorProps) => {
  const [open, setOpen] = useState(false);
  
  // Filter out EPICs from being selectable as parents and don't allow EPICs to have parents
  const filteredTasks = availableTasks.filter(task => {
    if (currentTaskType === 'EPIC') return false; // EPICs cannot have parents
    return task.taskType !== 'EPIC'; // EPICs cannot be parents
  });
  
  const selectedTask = filteredTasks.find(task => task.id === selectedTaskId);

  const handleClear = () => {
    onTaskSelect(undefined);
  };

  if (currentTaskType === 'EPIC') {
    return (
      <div className="grid gap-2">
        <Label>Parent Task</Label>
        <Input
          value="EPICs cannot have parent tasks"
          readOnly
          disabled
          className="bg-gray-100 text-gray-500"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label>Parent Task</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
              disabled={disabled}
            >
              {selectedTask
                ? `${selectedTask.taskNumber} - ${selectedTask.name}`
                : "Select parent task..."
              }
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search parent tasks..." />
              <CommandList>
                <CommandEmpty>No tasks found.</CommandEmpty>
                <CommandGroup>
                  {filteredTasks.map((task) => (
                    <CommandItem
                      key={task.id}
                      value={`${task.taskNumber} ${task.name}`}
                      onSelect={() => {
                        onTaskSelect(task.id);
                        setOpen(false);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{task.taskNumber}</span>
                        <span className="text-sm text-muted-foreground">{task.name}</span>
                        <span className="text-xs text-muted-foreground">Type: {task.taskType}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedTask && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
