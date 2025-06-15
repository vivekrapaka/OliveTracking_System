
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

export interface BackendTeammate {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
  location: string;
  avatar: string;
  availabilityStatus: string;
  tasksAssigned: number;
  tasksCompleted: number;
}

export interface TeammatesApiResponse {
  totalMembersInTeamCount: number;
  availableTeamMembersCount: number;
  occupiedTeamMembersCount: number;
  activeTasksCount: number;
  teammates: BackendTeammate[];
}

const fetchTeammatesData = async (): Promise<TeammatesApiResponse> => {
  const url = buildApiUrl(API_ENDPOINTS.TEAMMATES);
  
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
    console.error('Teammates data fetch error:', error);
    throw error;
  }
};

export const useTeammatesData = () => {
  return useQuery({
    queryKey: ['teammates-data'],
    queryFn: fetchTeammatesData,
    staleTime: 10000,
    retry: (failureCount, error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  });
};
