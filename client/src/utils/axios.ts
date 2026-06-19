import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // your backend URL
  withCredentials: true, // ✅ Sends cookies
});

export default API;
