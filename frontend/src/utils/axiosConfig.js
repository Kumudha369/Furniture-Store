import axios from 'axios';

// Use environment variable for API URL in production, default to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Set base URL
axios.defaults.baseURL = API_URL;

// Request interceptor for adding auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jothi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jothi_token');
      localStorage.removeItem('jothi_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
