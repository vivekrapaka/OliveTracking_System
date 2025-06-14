
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
  const url = buildApiUrl(API_ENDPOINTS.DASHBOARD_SUMMARY);
  console.log('🚀 Attempting to fetch dashboard data from:', url);
  console.log('🔧 Current environment:', process.env.NODE_ENV);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers here if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('📡 Response received - Status:', response.status, 'OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Dashboard data received successfully:', data);
    console.log('📊 Data keys:', Object.keys(data));
    
    return data;
  } catch (error) {
    console.error('💥 Dashboard data fetch error:', error);
    console.log('🔄 Will retry with exponential backoff...');
    throw error; // Let React Query handle retries
  }
};

export const useDashboardData = () => {
  console.log('🎯 useDashboardData hook called');
  
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
      console.log(`⏳ Retry attempt ${attemptIndex + 1} in ${delay}ms`);
      return delay;
    },
    // Use mock data as fallback during loading or errors
    placeholderData: mockDashboardData,
    onError: (error) => {
      console.error('🚨 Final query error after all retries:', error);
    },
    onSuccess: (data) => {
      console.log('🎉 Query successful, data keys:', Object.keys(data));
    }
  });
};
