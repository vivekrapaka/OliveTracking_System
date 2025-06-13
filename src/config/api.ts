
// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : 'http://localhost:3001'; // Adjust this to your backend URL

export const API_ENDPOINTS = {
  DASHBOARD_SUMMARY: '/api/dashboard/summary',
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
