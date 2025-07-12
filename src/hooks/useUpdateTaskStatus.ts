
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient';

interface UpdateTaskStatusRequest {
  newStatus: string;
}

const updateTaskStatus = async (taskId: number, newStatus: string) => {
  const url = `/api/tasks/${taskId}/status`;
  
  console.log('Updating task status at:', url);
  console.log('New status:', newStatus);
  
  const response = await apiClient.patch(url, { newStatus });
  
  return response.data;
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: number; newStatus: string }) => 
      updateTaskStatus(taskId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-data'] });
      toast({
        title: "Status Updated",
        description: "Task status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Update task status error:', error);
      toast({
        title: "Error",
        description: `Failed to update task status: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
