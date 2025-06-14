
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
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
  }>;
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const url = buildApiUrl(API_ENDPOINTS.DASHBOARD_SUMMARY);
  console.log('Fetching dashboard data from:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers here if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Dashboard data received:', data);
    
    return data;
  } catch (error) {
    console.warn('Failed to fetch from API, using mock data:', error);
    // Return mock data when API is not available
    return mockDashboardData;
  }
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};
