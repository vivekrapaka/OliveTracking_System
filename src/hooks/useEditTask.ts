
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient';

interface EditTaskRequest {
  taskName: string;
  description: string;
  status: string;
  taskType: string;
  parentId?: number;
  receivedDate: string;
  developmentStartDate: string;
  dueDate: string;
  assignedTeammateIds: number[];
  priority: string;
  projectId: number;
  documentPath?: string;
  commitId?: string;
}

const editTask = async (taskId: number, taskData: EditTaskRequest) => {
  const url = `/api/tasks/${taskId}`;
  
  console.log('Editing task at:', url);
  console.log('Task data:', taskData);
  
  const response = await apiClient.put(url, taskData);
  
  return response.data;
};

export const useEditTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, taskData }: { taskId: number; taskData: EditTaskRequest }) => 
      editTask(taskId, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-data'] });
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Edit task error:', error);
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
