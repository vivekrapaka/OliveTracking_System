
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
import apiClient from '@/services/apiClient'; // Import apiClient

export interface BackendTask {
  id: number;
  name: string;
  taskNumber: string;
  description: string;
  status: string; // Changed from currentStage to status
  taskType: string; // New field
  parentId?: number; // New field
  parentTaskTitle?: string; // New field for display
  parentTaskSequenceNumber?: string; // New field for display
  issueType: string;
  receivedDate: string;
  developmentStartDate: string;
  dueDate: string;
  assignedTeammateIds: number[]; // Changed from assignedTeammates to List<Long>
  assignedTeammateNames: string[]; // New field for display
  priority: string;
  isCompleted: boolean;
  isCmcDone: boolean;
  projectId: number;
  documentPath?: string;
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
