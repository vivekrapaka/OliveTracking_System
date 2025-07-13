
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

export interface BackendTask {
  id: number;
  name: string;
  taskNumber: string;
  description: string;
  status: string;
  taskType: string;
  parentId?: number;
  parentTaskTitle?: string;
  parentTaskFormattedNumber?: string;
  receivedDate: string;
  developmentStartDate: string;
  dueDate: string;
  assignedTeammateIds: number[];
  assignedTeammateNames: string[];
  developerName?: string;
  testerName?: string;
  priority: string;
  projectId: number;
  projectName: string;
  documentPath?: string;
  commitId?: string;
}

export interface TasksApiResponse {
  totalTasksCount: number;
  tasks: BackendTask[];
}

const fetchTasksData = async (): Promise<TasksApiResponse> => {
  const url = `/api/tasks`;
  
  console.log('Fetching tasks data from:', url);
  
  try {
    const response = await apiClient.get(url);
    console.log('Tasks data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Tasks data fetch error:', error);
    throw error;
  }
};

export const useTasksData = () => {
  return useQuery({
    queryKey: ['tasks-data'],
    queryFn: fetchTasksData,
    staleTime: 10000,
    retry: (failureCount, error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  });
};
