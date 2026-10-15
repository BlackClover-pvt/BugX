import axios from 'axios';

// Pre-configured axios instance for all API calls
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // sends session cookies with every request
});

export default api;
