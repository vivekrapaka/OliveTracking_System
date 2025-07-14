
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


const fetchProjectTeammates = async (projectId: number) => {
  const url = `/api/teammates?projectId=${projectId}`;
  
  console.log("fecthing for the projects teammates :", url);
  
  try {

    const response = await apiClient.get(url);
    console.log("response of project teammates:", response.data);
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
