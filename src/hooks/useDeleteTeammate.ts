import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';
import apiClient from '@/services/apiClient'; // Import apiClient

const deleteTeammate = async (name: string) => {
  const url = `${buildApiUrl(API_ENDPOINTS.TEAMMATES)}/${encodeURIComponent(name)}`;
  
  console.log('Deleting teammate:', name);
  
  const response = await apiClient.delete(url); // Use apiClient.delete
  
  return response.data;
};

export const useDeleteTeammate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (name: string) => deleteTeammate(name),
    onSuccess: () => {
      console.log('Delete successful, refreshing teammates data...');
      // Invalidate and refetch teammates data
      queryClient.invalidateQueries({ queryKey: ['teammates-data'] });
      // Force refetch to ensure fresh data
      queryClient.refetchQueries({ queryKey: ['teammates-data'] });
    },
    onError: (error) => {
      console.error('Delete teammate error:', error);
    },
  });
};

