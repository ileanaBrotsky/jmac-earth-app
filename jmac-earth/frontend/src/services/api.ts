import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  // Only set multipart headers when a FormData payload is being sent.
  if (config.data instanceof FormData) {
    config.headers.set('Content-Type', 'multipart/form-data');
  } else if (!config.headers.getContentType() && config.method !== 'get') {
    config.headers.set('Content-Type', 'application/json');
  }
  return config;
});
