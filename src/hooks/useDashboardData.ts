
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
import apiClient from '@/services/apiClient';
import { mockDashboardData } from '@/services/mockDashboardData';

export interface DashboardData {
  totalTeammates: number;
  freeTeammates: number;
  occupiedTeammates: number;
  totalTasks: number;
  activeTasks: number;
  tasksByStage: Record<string, number>;
  tasksByIssueType: Record<string, number>;
  tasksPendingCodeReview: number;
  tasksPendingCmcApproval: number;
  recentTasks: Array<{
    id: number;
    name: string;
    stage: string;
    assignee: string;
    dueDate: string;
    priority: string;
    taskNumber: string;
  }>;
  teamMembersSummary: Array<{
    id: number;
    name: string;
    role: string;
    email: string;
    phone: string;
    department: string;
    location: string;
    tasksAssigned: number;
  }>;
  activeTasksList: Array<{
    id: number;
    name: string;
    stage: string;
    assignee: string;
    dueDate: string;
    priority: string;
    taskNumber: string;
  }>;
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const url = `/api/dashboard`;
  
  console.log('Fetching dashboard data from:', url);
  
  try {
    const response = await apiClient.get(url);
    console.log('Dashboard data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    throw error;
  }
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardData,
    staleTime: 10000,
    retry: (failureCount, error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  });
};

