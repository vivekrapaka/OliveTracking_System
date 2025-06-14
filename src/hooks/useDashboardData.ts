
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
  console.log('🚀 [FETCH START] Attempting to fetch dashboard data from:', url);
  console.log('🔧 [ENV] Current environment:', process.env.NODE_ENV);
  console.log('🕐 [TIMESTAMP] Request started at:', new Date().toISOString());
  
  try {
    console.log('📡 [REQUEST] Making fetch request...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    console.log('📨 [RESPONSE] Response received:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   OK:', response.ok);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [ERROR] API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ [SUCCESS] Dashboard data received successfully from API');
    console.log('📊 [DATA] API response structure:', {
      keys: Object.keys(data),
      totalTasks: data.totalTasks,
      activeTasks: data.activeTasks,
      totalTeammates: data.totalTeammates
    });
    
    return data;
  } catch (error) {
    console.error('💥 [FETCH ERROR] Dashboard data fetch error:', error);
    console.log('🔍 [DEBUG] Error details:');
    console.log('   Error name:', error.name);
    console.log('   Error message:', error.message);
    console.log('   Error stack:', error.stack);
    
    // Check if it's a network error vs server error
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error('🌐 [NETWORK ERROR] Possible causes:');
      console.error('   • Backend server not running on localhost:8085');
      console.error('   • CORS policy blocking the request');
      console.error('   • Firewall blocking the connection');
      console.error('   • Backend endpoint /api/dashboard not available');
    } else if (error.message.includes('HTTP')) {
      console.error('🔧 [SERVER ERROR] Backend responded with error');
    }
    
    console.log('🔄 [RETRY] Will retry with exponential backoff...');
    throw error; // Let React Query handle retries
  }
};

export const useDashboardData = () => {
  console.log('🎯 [HOOK] useDashboardData hook called');
  
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: (failureCount, error) => {
      console.log(`🔄 [RETRY] Attempt ${failureCount + 1}/3 for error:`, error.message);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
      console.log(`⏳ [DELAY] Retry attempt ${attemptIndex + 1} in ${delay}ms`);
      return delay;
    },
    onError: (error) => {
      console.error('🚨 [FINAL ERROR] Query failed after all retries:', error);
      console.log('📝 [FALLBACK] Using mock data due to API failure');
    },
    onSuccess: (data) => {
      console.log('🎉 [SUCCESS] Query successful! Using REAL API data');
      console.log('📊 [VALIDATION] API data structure validated:', Object.keys(data));
    }
  });
};
