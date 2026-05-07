import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("top20_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasToken = !!localStorage.getItem("top20_token");
    const status = error?.response?.status;

    if (hasToken && status === 401) {
      localStorage.removeItem("top20_token");
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
