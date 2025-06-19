import apiClient from './apiClient';

const AuthService = {
  signup: (fullName, email, phone, location, password) => {
    return apiClient.post('/auth/signup', { fullName, email, phone, location, password });
  },

  signin: (email, password) => {
    return apiClient.post('/auth/signin', { email, password });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('jwtToken');
    // Optionally, invalidate token on backend if supported
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
};

export default AuthService;

