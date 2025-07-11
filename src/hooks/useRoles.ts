
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

export interface Role {
  id: number;
  title: string;
  functionalGroup: string;
}

const fetchRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('/api/roles');
  return response.data;
};

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    staleTime: 300000, // 5 minutes
  });
};
