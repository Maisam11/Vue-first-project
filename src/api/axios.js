import axios from 'axios';
import { auth } from '@/firebase';

// Create Axios instance for Firestore REST API
const api = axios.create({
  baseURL: 'https://firestore.googleapis.com/v1/projects/practice-7f029/databases/(default)/documents',
});

// Interceptor to add Firebase token automatically to every request
api.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios Interceptor: Added token to request', token.slice(0, 10) + '...');
    } else {
      console.log('Axios Interceptor: No user logged in, no token added');
    }
    return config;
  },
  (error) => {
    console.log('Axios Interceptor: Request error', error.message);
    return Promise.reject(error);
  }
);

export default api;