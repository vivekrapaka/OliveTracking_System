import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
import apiClient from '@/services/apiClient'; // Import apiClient

export interface AddTeammateRequest {
  fullName: string;
  email: string;
  role: string;
  phone: string;
  department: string;
  location: string;
  avatar: string;
}

const addTeammate = async (teammateData: AddTeammateRequest) => {
  const url = buildApiUrl(API_ENDPOINTS.TEAMMATES);
  
  console.log('Adding teammate:', teammateData);
  
  const response = await apiClient.post(url, teammateData); // Use apiClient.post
  
  return response.data;
};

export const useAddTeammate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addTeammate,
    onSuccess: () => {
      // Invalidate and refetch teammates data
      queryClient.invalidateQueries({ queryKey: ['teammates-data'] });
    },
    onError: (error) => {
      console.error('Add teammate error:', error);
    },
  });
};

