
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient';

export interface AddTaskRequest {
  taskName: string;
  description?: string;
  status: string;
  taskType: string;
  parentId?: number;
  receivedDate: string;
  developmentStartDate?: string;
  dueDate: string;
  assignedTeammateIds?: number[];
  priority: string;
  projectId: number;
  documentPath?: string;
  commitId?: string;
}

const addTask = async (taskData: AddTaskRequest) => {
  const url = '/api/tasks';
  
  console.log('Adding task with data:', taskData);
  
  try {
    const response = await apiClient.post(url, taskData);
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
