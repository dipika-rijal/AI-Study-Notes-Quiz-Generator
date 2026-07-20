import { useEffect, useState } from "react";
import api from "../api/axios";

export function useStreak() {
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, doneToday: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get("/streak");
        if (!cancelled) setStreak(res.data);
      } catch (err) {
        console.error("Failed to load streak", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...streak, loading };
}
