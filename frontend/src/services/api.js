import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  let token = null;
  const isAdminRequest = config.url?.startsWith('/admin/');
  const storedSession = localStorage.getItem(isAdminRequest ? 'adminInfo' : 'userInfo');
  if (storedSession) {
    try {
      token = JSON.parse(storedSession).token;
    } catch {
      localStorage.removeItem(isAdminRequest ? 'adminInfo' : 'userInfo');
    }
  }

  // Support older sessions, but never let a stale legacy token override the
  // currently signed-in account stored in the relevant session record.
  if (!token && !storedSession && !isAdminRequest) {
    token = localStorage.getItem('token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
