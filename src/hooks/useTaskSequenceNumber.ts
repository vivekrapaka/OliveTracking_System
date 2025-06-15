
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

const fetchTaskSequenceNumber = async (): Promise<string> => {
  const url = `${API_BASE_URL}/api/tasks/generateSequenceNumber`;
  
  console.log('Fetching task sequence number from:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
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
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the result
  });
};
