import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8085/api', // Replace with your actual backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add JWT to Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user')); // Retrieve stored user data
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized and other errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (e.g., token expired, invalid token)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access. Token expired or invalid.');
      // Clear stored user data (logout)
      localStorage.removeItem('user');
      // Update your global authentication state to logged out
      // Example: dispatch(logoutUser());
      // Redirect to login page
      window.location.href = '/login';
    }
    // Handle 403 Forbidden errors (permission denied)
    if (error.response && error.response.status === 403) {
        console.error('Forbidden: You do not have permission to perform this action.');
        // Display a user-friendly message on the UI
        alert("Permission Denied: You are not authorized to perform this action.");
    }
    // Re-throw the error so specific components can handle it
    return Promise.reject(error);
  }
);

export default apiClient;

