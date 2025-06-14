
// API Configuration
console.log('🌍 Environment check:', process.env.NODE_ENV);

export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : 'http://localhost:8085';

console.log('🔗 API Base URL configured as:', API_BASE_URL);

export const API_ENDPOINTS = {
  DASHBOARD_SUMMARY: '/api/dashboard',
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🛠️ Built API URL:', fullUrl);
  return fullUrl;
};
