import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// This piece of code automatically attaches your token to every request
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;