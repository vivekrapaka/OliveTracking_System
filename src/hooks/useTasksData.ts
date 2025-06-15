
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

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
  const url = buildApiUrl(API_ENDPOINTS.TASKS);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
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
