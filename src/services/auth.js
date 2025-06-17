import apiClient from './apiClient';

const AuthService = {
  signup: (fullName, email, password) => {
    return apiClient.post('/auth/signup', { fullName, email, password });
  },

  signin: (email, password) => {
    return apiClient.post('/auth/signin', { email, password });
  },

  logout: () => {
    localStorage.removeItem('user');
    // Optionally, invalidate token on backend if supported
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
};

export default AuthService;

