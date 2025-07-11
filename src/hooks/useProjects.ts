
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from '@/hooks/use-toast';

export interface Project {
  id: number;
  projectName: string;
  projectDescription?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

const fetchProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get('/api/projects');
  return response.data;
};

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 300000, // 5 minutes
  });
};
