
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

const fetchTaskSequenceNumber = async (parentId?: number): Promise<string> => {
  const url = parentId 
    ? `/api/tasks/nextSequenceNumber?parentId=${parentId}`
    : `/api/tasks/nextSequenceNumber`;
  
  console.log('Fetching task sequence number from:', url);
  
  try {
    const response = await apiClient.get(url);
    const result = response.data;
    console.log('Sequence number response:', result);
    
    return result;
  } catch (error) {
    console.error('Fetch sequence number error:', error);
    throw error;
  }
};

export const useTaskSequenceNumber = (parentId?: number) => {
  return useQuery({
    queryKey: ['task-sequence-number', parentId],
    queryFn: () => fetchTaskSequenceNumber(parentId),
    enabled: false // Only fetch when explicitly refetched
  });
};
