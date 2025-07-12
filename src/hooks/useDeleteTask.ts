
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient';

const deleteTask = async (taskId: number) => {
  const url = `/api/tasks/${taskId}`;
  
  console.log('Deleting task at:', url);
  
  const response = await apiClient.delete(url);
  
  return response.data;
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-data'] });
      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Delete task error:', error);
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
