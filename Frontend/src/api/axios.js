import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.NODE_ENV === "production" ? "import.meta.env.SERVER" : "http://localhost:8080/api" ,
  withCredentials: true, // sends the httpOnly cookie automatically
});

// No request interceptor needed — cookie is sent by the browser
// Keep the 401 handler for redirecting on session expiry


export default api;