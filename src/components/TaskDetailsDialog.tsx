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
  developerName?: string;
  testerName?: string;
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

  // Enhanced permission check - managers and leads can view history
  const canViewHistory = user?.functionalGroup && ["ADMIN", "MANAGER", "DEV_MANAGER", "TEST_MANAGER", "DEV_LEAD", "TEST_LEAD", "BUSINESS_ANALYST"].includes(user.functionalGroup);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("details");
    }
  }, [isOpen]);

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-professional-slate/20">
        <DialogHeader>
          <DialogTitle className="text-professional-navy">Task Details - {task.taskNumber}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-professional-blue/10">
            <TabsTrigger value="details" className="data-[state=active]:bg-professional-blue data-[state=active]:text-white">Details</TabsTrigger>
            {canViewHistory && (
              <TabsTrigger value="history" className="data-[state=active]:bg-professional-blue data-[state=active]:text-white">History & Comments</TabsTrigger>
            )}
            <TabsTrigger value="worklogs" className="data-[state=active]:bg-professional-blue data-[state=active]:text-white">Work Logs</TabsTrigger>
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
              {/* Only render TaskHistoryTab when the tab is active to prevent unnecessary API calls */}
              {activeTab === "history" && <TaskHistoryTab taskId={task.id} />}
            </TabsContent>
          )}
          
          <TabsContent value="worklogs" className="mt-4">
            {/* Only render TaskWorkLogsTab when the tab is active to prevent unnecessary API calls */}
            {activeTab === "worklogs" && <TaskWorkLogsTab taskId={task.id} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};


