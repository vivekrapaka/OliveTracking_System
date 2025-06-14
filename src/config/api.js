
// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : 'http://localhost:8085'; // Updated to use port 8085

export const API_ENDPOINTS = {
  DASHBOARD_SUMMARY: '/api/dashboard', // Updated to match your backend endpoint
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
