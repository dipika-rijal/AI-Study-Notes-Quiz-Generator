import axios from "axios";
import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 60000, // Increased timeout to 60s for slow AI requests
});

// Attach Firebase ID token to every outgoing request
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // Token fetch failed — let the request go without auth;
    // backend will return 401 and the app handles it gracefully.
  }
  return config;
});

// Do NOT auto-signout on 401. A 401 simply means the request was not
// authenticated — this can happen during loading races or token expiry.
// The app handles unauthenticated states via ProtectedRoute in App.jsx.
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;