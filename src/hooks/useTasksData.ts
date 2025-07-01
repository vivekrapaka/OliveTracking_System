import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
import apiClient from '@/services/apiClient'; // Import apiClient

export interface BackendTask {
  id: number;
  name: string;
  taskNumber: string;
  description: string;
  issueType: string;
  receivedDate: string;
  developmentStartDate: string;
  currentStage: string;
  dueDate: string;
  assignedTeammates: string[];
  priority: string;
  isCompleted: boolean;
  isCmcDone: boolean;
}

export interface TasksApiResponse {
  totalTasksCount: number;
  tasks: BackendTask[];
}

const fetchTasksData = async (): Promise<TasksApiResponse> => {
  const url = `/api/tasks`;
  
  try {
    const response = await apiClient.get(url); // Use apiClient.get
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

