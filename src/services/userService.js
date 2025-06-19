import apiClient from './apiClient';

const UserService = {
  // Get all users
  getUsers: () => {
    return apiClient.get('/users');
  },

  // Create a new user
  createUser: (userData) => {
    return apiClient.post('/users', userData);
  },

  // Update a user
  updateUser: (id, userData) => {
    return apiClient.put(`/users/${id}`, userData);
  },

  // Delete a user
  deleteUser: (id) => {
    return apiClient.delete(`/users/${id}`);
  },
};

export default UserService;

