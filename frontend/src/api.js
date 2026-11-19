import axios from "axios";

// In development Vite proxies /api to the backend (see vite.config.js).
// In production on Render, a rewrite rule on the static site proxies /api/* to the backend,
// so the browser always talks to its own origin and the login cookie is first-party.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

export const errorMessage = (error, fallback = "Something went wrong") =>
  error.response?.data?.message || fallback;

export default api;
