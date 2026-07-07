import axios from 'axios';
import { refreshToken } from './authApi';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('[Axios Interceptor] Token in localStorage:', token);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const res = await refreshToken();
      
      const newToken = res?.data?.accessToken;
      console.log('refresh token response: ', res);

      if (newToken) {
        localStorage.setItem('accessToken', newToken);
      }
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest)
    }
    return Promise.reject(error);
  }
);


export default api;
