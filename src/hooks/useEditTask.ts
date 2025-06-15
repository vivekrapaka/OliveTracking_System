
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';
import { toast } from '@/hooks/use-toast';

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
  const url = `${API_BASE_URL}/api/tasks/${encodeURIComponent(taskName)}`;
  
  console.log('Editing task at:', url);
  console.log('Task data:', taskData);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify(taskData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
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
