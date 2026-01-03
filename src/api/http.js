import axios from "axios";

const http = axios.create({
  baseURL: "https://stock-portfolio-dashboard-server.onrender.com/api",
  // baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

// Optional: global error logging
http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default http;
