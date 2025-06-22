import apiClient from './apiClient';

const ProjectService = {
  // Get all projects
  getProjects: () => {
    return apiClient.get('/api/projects');
  },

  // Create a new project
  createProject: (projectData) => {
    return apiClient.post('/api/projects', projectData);
  },

  // Update a project
  updateProject: (id, projectData) => {
    return apiClient.put(`/api/projects/${id}`, projectData);
  },

  // Delete a project
  deleteProject: (id) => {
    return apiClient.delete(`/api/projects/${id}`);
  },
};

export default ProjectService;

