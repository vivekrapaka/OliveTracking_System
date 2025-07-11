
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  roleTitle?: string;
  functionalGroup?: string;
  roleId?: number;
  projectIds?: number[];
  projectNames?: string[];
}

export interface UserCreateUpdateRequest {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  password?: string;
  roleId: number;
  projectIds: number[];
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/api/users');
  return response.data;
};

const createUser = async (userData: UserCreateUpdateRequest): Promise<User> => {
  const response = await apiClient.post('/api/users', userData);
  return response.data;
};

const updateUser = async ({ id, userData }: { id: number; userData: UserCreateUpdateRequest }): Promise<User> => {
  const response = await apiClient.put(`/api/users/${id}`, userData);
  return response.data;
};

const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/users/${id}`);
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 60000, // 1 minute
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });
};
