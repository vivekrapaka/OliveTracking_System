
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

export interface AddTaskRequest {
  taskName: string;
  description: string;
  currentStage: string;
  startDate: string;
  dueDate: string;
  issueType: string;
  receivedDate: string;
  developmentStartDate: string;
  assignedTeammateNames: string[];
  priority: string;
}

const addTask = async (taskData: AddTaskRequest) => {
  const url = buildApiUrl(API_ENDPOINTS.TASKS);
  
  console.log('Adding task with data:', taskData);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
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
    
    const result = await response.json();
    console.log('Task added successfully:', result);
    return result;
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
