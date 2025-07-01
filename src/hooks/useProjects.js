import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProjectService from '../services/projectService';
import { toast } from '@/hooks/use-toast';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectService.getProjects().then(res => res.data),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectData) => ProjectService.createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project created successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create project",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, projectData }) => ProjectService.updateProject(id, projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project updated successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update project",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => ProjectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project deleted successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete project",
        variant: "destructive"
      });
    }
  });
};

