import apiClient from './apiClient';

const ProjectService = {
  // Get all projects
  getProjects: () => {
    return apiClient.get('/projects');
  },

  // Create a new project
  createProject: (projectData) => {
    return apiClient.post('/projects', projectData);
  },

  // Update a project
  updateProject: (id, projectData) => {
    return apiClient.put(`/projects/${id}`, projectData);
  },

  // Delete a project
  deleteProject: (id) => {
    return apiClient.delete(`/projects/${id}`);
  },
};

export default ProjectService;

