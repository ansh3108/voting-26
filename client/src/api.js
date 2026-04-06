import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach JWT from localStorage on every request.
// Login stores: { token, user: { ... } } under key 'user'
API.interceptors.request.use((req) => {
  const raw = localStorage.getItem('user');
  if (!raw) return req;
  try {
    const session = JSON.parse(raw);
    if (session?.token) {
      req.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch {
    /* ignore */
  }
  return req;
});

export default API;