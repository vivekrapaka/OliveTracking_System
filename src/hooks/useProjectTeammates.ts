
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

const fetchProjectTeammates = async (projectId: number): Promise<ProjectTeammatesResponse> => {
  const url = `/api/projects/${projectId}/teammates`;
  
  console.log('Fetching project teammates from:', url);
  
  try {
    const response = await apiClient.get(url);
    console.log('Project teammates response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Project teammates fetch error:', error);
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
