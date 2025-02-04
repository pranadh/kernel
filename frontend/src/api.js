import axios from "axios";

const baseURL = process***REMOVED***.NODE_ENV === 'production' 
  ? 'https://exlt.tech'
  : 'http://localhost:5000';

  const instance = axios.create({ 
    baseURL,
    withCredentials: true
  });

// Add token to all requests if it exists
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 301 || error.response?.status === 302) {
      window.location.replace(error.response.headers.location);
    }
    return Promise.reject(error);
  }
);

export default instance;