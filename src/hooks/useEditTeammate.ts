import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
import apiClient from '@/services/apiClient'; // Import apiClient

export interface EditTeammateRequest {
  fullName: string;
  email: string;
  role: string;
  phone: string;
  department: string;
  location: string;
  avatar: string;
  availabilityStatus: string;
}

const editTeammate = async (name: string, teammateData: EditTeammateRequest) => {
  const url = `${buildApiUrl(API_ENDPOINTS.TEAMMATES)}/${encodeURIComponent(name)}`;
  
  console.log('Editing teammate:', name, teammateData);
  
  const response = await apiClient.put(url, teammateData); // Use apiClient.put
  
  return response.data;
};

export const useEditTeammate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: EditTeammateRequest }) => 
      editTeammate(name, data),
    onSuccess: () => {
      // Invalidate and refetch teammates data
      queryClient.invalidateQueries({ queryKey: ['teammates-data'] });
    },
    onError: (error) => {
      console.error('Edit teammate error:', error);
    },
  });
};

