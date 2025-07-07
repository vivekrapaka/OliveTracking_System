
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from '@/hooks/use-toast';

interface EditTaskData {
  taskName: string;
  description: string;
  status: string;
  taskType: string;
  dueDate: string;
  receivedDate: string;
  developmentStartDate: string;
  assignedTeammateNames: string[];
  priority: string;
}

interface EditTaskRequest {
  taskId: number;
  taskData: EditTaskData;
}

const editTask = async ({ taskId, taskData }: EditTaskRequest) => {
  console.log('Editing task with ID:', taskId);
  console.log('Task data:', taskData);
  
  const response = await apiClient.put(`/api/tasks/${taskId}`, taskData);
  console.log('Edit task response:', response.data);
  return response.data;
};

export const useEditTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: editTask,
    onSuccess: (data) => {
      console.log('Task edited successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['tasks-data'] });
      toast({
        title: "Task Updated",
        description: "The task has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Edit task error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update task';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
