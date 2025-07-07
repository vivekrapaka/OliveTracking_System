
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskDetailsTab } from "./TaskDetailsTab";
import { TaskHistoryTab } from "./TaskHistoryTab";
import { TaskWorkLogsTab } from "./TaskWorkLogsTab";
import { useAuth } from "@/contexts/AuthContext";

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
  priority: string;
  projectId: number;
  projectName: string;
  documentPath?: string;
  commitId?: string;
}

interface Teammate {
  id: number;
  name: string;
  role: string;
}

interface TaskDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (updatedTask: Task) => void;
  teammates: Teammate[];
}

export const TaskDetailsDialog = ({ isOpen, onClose, task, onSave, teammates }: TaskDetailsDialogProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");

  const canViewHistory = user?.role && ["ADMIN", "MANAGER"].includes(user.role);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("details");
    }
  }, [isOpen]);

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Task Details - {task.taskNumber}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            {canViewHistory && (
              <TabsTrigger value="history">History & Comments</TabsTrigger>
            )}
            <TabsTrigger value="worklogs">Work Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <TaskDetailsTab 
              task={task} 
              onSave={onSave} 
              teammates={teammates}
              onClose={onClose}
            />
          </TabsContent>
          
          {canViewHistory && (
            <TabsContent value="history" className="mt-4">
              <TaskHistoryTab taskId={task.id} />
            </TabsContent>
          )}
          
          <TabsContent value="worklogs" className="mt-4">
            <TaskWorkLogsTab taskId={task.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
