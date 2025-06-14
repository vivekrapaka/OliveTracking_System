
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
import { mockDashboardData } from '@/services/mockDashboardData';

const fetchDashboardData = async () => {
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
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Dashboard data received successfully:', data);
    
    // Validate that we have the expected data structure
    if (!data || typeof data !== 'object') {
      console.warn('Invalid data structure received, using mock data');
      return mockDashboardData;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch from API:', error.message);
    console.log('Using mock data as fallback');
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
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
