import axios from 'axios';
import { ENV } from '../config/env';

const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* 🔐 REQUEST INTERCEPTOR */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* 🚨 RESPONSE INTERCEPTOR */
axiosInstance.interceptors.response.use(
  (response) => {
    // Some backends return 200 OK with a custom error payload for token expiration
    if (response.data && response.data.status === false) {
      const msg = (response.data.message || '').toLowerCase();
      const errMsg = (response.data.error_message || '').toLowerCase();
      if (
        msg.includes('jwt expired') || 
        msg.includes('token expired') || 
        msg.includes('invalid token') ||
        errMsg.includes('jwt expired') ||
        errMsg.includes('token expired') ||
        errMsg.includes('invalid token')
      ) {
        localStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Token Expired'));
      }
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest.isRetry) {
      originalRequest.isRetry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error("No refresh token available");

        const res = await axios.post(
          `${ENV.API_BASE_URL}/refresh-token`,
          { refreshToken }
        );

        const newToken = res.data.token;
        if (!newToken) throw new Error("No new token received");

        localStorage.setItem('authToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        // Refresh token failed, clear storage and logout
        localStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }

    // Catch generic 401s if not retrying. 
    // We ignore 403 here because the backend uses 403 for business logic rules (like insufficient credits).
    if (error.response?.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
