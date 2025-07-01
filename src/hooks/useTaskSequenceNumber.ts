import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient'; // Import apiClient

const fetchTaskSequenceNumber = async (): Promise<string> => {
  const url = `/api/tasks/generateSequenceNumber`; // Relative path, apiClient handles base URL
  
  console.log('Fetching task sequence number from:', url);
  
  try {
    const response = await apiClient.get(url); // Use apiClient.get
    const result = response.data;
    console.log('Sequence number response:', result);
    
    // Concatenate TSK- with the response number
    const taskNumber = `TSK-${result.number || result}`;
    console.log('Generated task number:', taskNumber);
    
    return taskNumber;
  } catch (error) {
    console.error('Fetch sequence number error:', error);
    throw error;
  }
};

export const useTaskSequenceNumber = () => {
  return useQuery({
    queryKey: ['task-sequence-number'],
    queryFn: fetchTaskSequenceNumber,
    staleTime: 0 // Always fetch fresh data
  });
};

