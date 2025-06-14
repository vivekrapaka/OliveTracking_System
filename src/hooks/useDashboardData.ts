
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
      },
      // Add CORS mode to help with cross-origin requests
      mode: 'cors',
    });
    
    console.log('📡 Response received - Status:', response.status, 'OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Dashboard data received successfully from API:', data);
    console.log('📊 Real API data keys:', Object.keys(data));
    
    return data;
  } catch (error) {
    console.error('💥 Dashboard data fetch error:', error);
    console.log('🔄 Will retry with exponential backoff...');
    
    // Check if it's a network error vs server error
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error('🌐 Network error - possible causes:');
      console.error('   • Backend server not running on localhost:8085');
      console.error('   • CORS policy blocking the request');
      console.error('   • Firewall blocking the connection');
    }
    
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
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount + 1}/3 for error:`, error.message);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
      console.log(`⏳ Retry attempt ${attemptIndex + 1} in ${delay}ms`);
      return delay;
    },
    // Remove placeholderData to see if API is actually working
    // placeholderData: mockDashboardData,
    onError: (error) => {
      console.error('🚨 Final query error after all retries:', error);
      console.log('📝 Falling back to mock data due to API failure');
    },
    onSuccess: (data) => {
      console.log('🎉 Query successful! Using REAL API data');
      console.log('📊 API data keys:', Object.keys(data));
    }
  });
};
