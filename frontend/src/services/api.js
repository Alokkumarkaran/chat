import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:5000',
  withCredentials: true
});

export const setToken = (token) => {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
};

export const saveTokenLocal = (token) => {
  localStorage.setItem('skillchat_token', token);
  setToken(token);
};

export const getToken = () => localStorage.getItem('skillchat_token');

export const logout = () => {
  localStorage.removeItem('skillchat_token');
  setToken(null);
};

export default API;
