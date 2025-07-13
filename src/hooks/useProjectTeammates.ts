
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

interface ProjectTeammate {
  id: number;
  name: string;
  role: string;
  functionalGroup: string;
}

interface ProjectTeammatesResponse {
  teammates: ProjectTeammate[];
}


const fetchProjectTeammates = async (taskId: number) => {
  const url = `/api/tasks/${taskId}/history`;
  
  console.log('Fetchinwertyui:', url);
  
  try {

    const response = await apiClient.get(url);
    console.log('Task history response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Task history fetch error:', error);
    throw error;
  }
};

export const useProjectTeammates = (projectId: number | undefined) => {
  return useQuery({
    queryKey: ['project-teammates', projectId],
    queryFn: () => fetchProjectTeammates(projectId!),
    enabled: !!projectId,
    staleTime: 10000,
  });
};
