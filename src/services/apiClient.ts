
import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8085',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Add JWT to Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    console.log('Request interceptor - Token found:', token ? 'Yes' : 'No');
    console.log('Request URL:', config.url);
    console.log("out of token")
    if (token) {
      console.log("in token block")
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers['Authorization']);
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized and other errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received for:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', error);
    
    // Handle 401 Unauthorized errors (e.g., token expired, invalid token)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access. Token expired or invalid.');
      // Clear stored user data (logout)
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden errors (permission denied)
    if (error.response && error.response.status === 403) {
      console.error('Forbidden: You do not have permission to perform this action.');
      alert("Permission Denied: You are not authorized to perform this action.");
    }
    
    // Re-throw the error so specific components can handle it
    return Promise.reject(error);
  }
);

export default apiClient;
