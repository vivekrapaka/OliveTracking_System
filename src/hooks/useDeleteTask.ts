
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';
import { toast } from '@/hooks/use-toast';

const deleteTask = async (taskName: string) => {
  const url = `${API_BASE_URL}/api/tasks/${encodeURIComponent(taskName)}`;
  
  console.log('Deleting task at:', url);
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
  }
  
  // For DELETE requests, don't expect JSON response
  // Some APIs return 204 No Content, others return empty response
  if (response.status === 204) {
    return { success: true };
  }
  
  // Only try to parse JSON if there's content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return { success: true };
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
