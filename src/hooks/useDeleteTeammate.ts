
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

const deleteTeammate = async (name: string) => {
  const url = `${buildApiUrl(API_ENDPOINTS.TEAMMATES)}/${encodeURIComponent(name)}`;
  
  console.log('Deleting teammate:', name);
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
  }
  
  // For DELETE requests, some APIs return empty response
  if (response.status === 204) {
    return { success: true };
  }
  
  return response.json();
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
