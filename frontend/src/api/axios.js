import axios from "axios";
import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach Firebase ID token to every request.
// Uses forceRefresh=false so it returns the cached token instantly — avoiding
// a race condition on first load where the token isn't ready yet.
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken(false);
      config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      console.warn("Could not get Firebase ID token:", e.message);
    }
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
