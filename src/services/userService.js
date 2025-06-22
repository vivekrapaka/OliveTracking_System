import apiClient from './apiClient';

const UserService = {
  // Get all users
  getUsers: () => {
    return apiClient.get('/api/users');
  },

  // Create a new user
  createUser: (userData) => {
    return apiClient.post('/api/users', userData);
  },

  // Update a user
  updateUser: (id, userData) => {
    return apiClient.put(`/api/users/${id}`, userData);
  },

  // Delete a user
  deleteUser: (id) => {
    return apiClient.delete(`/api/users/${id}`);
  },
};

export default UserService;

