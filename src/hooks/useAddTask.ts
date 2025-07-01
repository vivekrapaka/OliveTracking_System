import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient'; // Import apiClient

export interface AddTaskRequest {
  taskName: string;
  description?: string; // Made optional as per backend, if not @NotBlank
  currentStage: string;
  startDate?: string; // Made optional as per backend, if not @NotBlank
  dueDate?: string; // Made optional as per backend, if not @NotBlank
  issueType?: string; // Made optional as per backend, if not @NotBlank
  receivedDate?: string; // Made optional as per backend, if not @NotBlank
  developmentStartDate?: string; // Made optional as per backend, if not @NotBlank
  assignedTeammateNames?: string[]; // Made optional as per backend, if not @NotBlank
  priority?: string; // Made optional as per backend, if not @NotBlank
  projectId: number; // NEW: projectId is now required for task creation
  documentPath?: string; // NEW: documentPath
}

const addTask = async (taskData: AddTaskRequest) => {
  const url = '/api/tasks'; // Relative path, apiClient handles base URL
  
  console.log('Adding task with data:', taskData);
  
  try {
    const response = await apiClient.post(url, taskData); // Use apiClient.post
    console.log('Task added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Add task error:', error);
    throw error;
  }
};

export const useAddTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      console.log('Task added successfully, refreshing data...');
      queryClient.invalidateQueries({ queryKey: ['tasks-data'] });
      toast({
        title: "Success",
        description: "Task has been added successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Add task mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};


