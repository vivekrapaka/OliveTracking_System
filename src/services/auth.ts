
import apiClient from './apiClient';

const AuthService = {
  signup: (fullName: string, email: string, phone: string, location: string, password: string) => {
    return apiClient.post('/auth/signup', { fullName, email, phone, location, password });
  },

  signin: (email: string, password: string) => {
    return apiClient.post('/auth/signin', { email, password });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('jwtToken');
    // Optionally, invalidate token on backend if supported
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default AuthService;
