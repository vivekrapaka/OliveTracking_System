import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient'; // Import apiClient

interface EditTaskRequest {
  taskName: string;
  description: string;
  currentStage: string;
  startDate: string;
  dueDate: string;
  isCompleted: boolean;
  issueType: string;
  receivedDate: string;
  developmentStartDate: string;
  isCodeReviewDone: boolean;
  isCmcDone: boolean;
  assignedTeammateNames: string[];
  priority: string;
}

const editTask = async (taskName: string, taskData: EditTaskRequest) => {
  const url = `/api/tasks/${encodeURIComponent(taskName)}`; // Relative path, apiClient handles base URL
  
  console.log('Editing task at:', url);
  console.log('Task data:', taskData);
  
  const response = await apiClient.put(url, taskData); // Use apiClient.put
  
  return response.data;
};

export const useEditTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskName, taskData }: { taskName: string; taskData: EditTaskRequest }) => 
      editTask(taskName, taskData),
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

