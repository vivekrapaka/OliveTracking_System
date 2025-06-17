import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient'; // Import apiClient

const deleteTask = async (taskName: string) => {
  const url = `/api/tasks/${encodeURIComponent(taskName)}`; // Relative path, apiClient handles base URL
  
  console.log('Deleting task at:', url);
  
  const response = await apiClient.delete(url); // Use apiClient.delete
  
  return response.data; // Axios automatically parses JSON or returns empty for 204
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskName: string) => deleteTask(taskName),
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

