import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't automatically follow redirects - we want to see the actual response
  maxRedirects: 0,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 307 redirect - retry with the same method
    if (error.response?.status === 307) {
      const redirectUrl = error.response.headers.location;
      if (redirectUrl) {
        // Clone the request and retry to the redirect URL
        return api.request({
          ...error.config,
          url: redirectUrl,
        });
      }
    }
    
    const isAuthError = error.response?.status === 401;
    const hasToken = !!localStorage.getItem('token');
    
    if (isAuthError && hasToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
