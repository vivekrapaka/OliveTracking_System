
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl } from '@/config/api';

export interface EditTeammateRequest {
  fullName: string;
  email: string;
  role: string;
  phone: string;
  department: string;
  location: string;
  avatar: string;
}

const editTeammate = async (name: string, teammateData: EditTeammateRequest) => {
  const url = `${buildApiUrl(API_ENDPOINTS.TEAMMATES)}/${encodeURIComponent(name)}`;
  
  console.log('Editing teammate:', name, teammateData);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(teammateData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
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
