import axios from "axios";

const baseURL = process***REMOVED***.NODE_ENV === 'production' 
  ? 'http://170.64.128.155:5000'
  : 'http://localhost:5000';

const instance = axios.create({ baseURL });

// Add token to all requests if it exists
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;