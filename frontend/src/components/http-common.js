import axios from "axios";

const isProduction = process.env.NODE_ENV === 'production';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-type": "application/json",
    ...(isProduction && { "ngrok-skip-browser-warning": "123" }),
  }
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
