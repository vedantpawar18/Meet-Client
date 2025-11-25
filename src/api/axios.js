import axios from 'axios';
let API_BASE = 'http://localhost:5000/api';
(async () => { try { const res = await fetch('/config.json'); const cfg = await res.json(); if (cfg.apiBaseUrl) API_BASE = cfg.apiBaseUrl; } catch (e) { } })();
const api = axios.create({ baseURL: API_BASE, timeout: 15000 });
api.interceptors.request.use(cfg => { const token = localStorage.getItem('token'); if (token) cfg.headers.Authorization = `Bearer ${token}`; return cfg; });
export default api;
