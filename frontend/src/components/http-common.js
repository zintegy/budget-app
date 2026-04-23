import axios from "axios";

const isProduction = process.env.NODE_ENV === 'production';

export default axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-type": "application/json",
    ...(isProduction && { "ngrok-skip-browser-warning": "123" }),
  }
});
