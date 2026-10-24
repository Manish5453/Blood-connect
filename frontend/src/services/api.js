import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  
  if (!token) {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        token = parsed.token;
      } catch (e) {
        console.error('Error parsing userInfo', e);
      }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;