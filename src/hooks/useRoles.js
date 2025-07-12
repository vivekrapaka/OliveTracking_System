
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

const RoleService = {
  getRoles: () => {
    return apiClient.get('/api/roles');
  },
};

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => RoleService.getRoles().then(res => res.data),
  });
};
