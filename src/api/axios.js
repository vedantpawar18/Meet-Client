import axios from "axios";

// Default API base URL (can be overridden by config.json)
let API_BASE = "http://localhost:5000/api";

// Try to load API base URL from config.json file
(async () => {
  try {
    const response = await fetch("/config.json");
    const config = await response.json();
    if (config.apiBaseUrl) {
      API_BASE = config.apiBaseUrl;
    }
  } catch (error) {
    // If config.json doesn't exist or fails to load, use default URL
    console.warn("Could not load config.json, using default API URL");
  }
})();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000, // 15 second timeout
});

// Add authentication token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
