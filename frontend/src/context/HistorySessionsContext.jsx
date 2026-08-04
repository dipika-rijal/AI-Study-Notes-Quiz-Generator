import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getHistory } from "../api/historyApi";

const HistorySessionsContext = createContext(null);

export function HistorySessionsProvider({ userId, children }) {
  const [data, setData] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");
  const requestRef = useRef(null);
  const dataRef = useRef(null);

  const updateData = useCallback((nextData) => {
    dataRef.current = nextData;
    setData(nextData);
  }, []);

  const refresh = useCallback(async ({ initial = false } = {}) => {
    if (!userId) return null;
    if (requestRef.current) return requestRef.current;

    if (initial) setIsInitialLoading(true);
    setError("");

    const request = getHistory()
      .then((nextData) => {
        updateData(nextData);
        return nextData;
      })
      .catch((requestError) => {
        console.error("Could not load history", requestError);
        // A background refresh must not replace existing sessions with an error state.
        if (!dataRef.current) setError("History could not load. Please try again.");
        return null;
      })
      .finally(() => {
        requestRef.current = null;
        if (initial) setIsInitialLoading(false);
      });

    requestRef.current = request;
    return request;
  }, [updateData, userId]);

  useEffect(() => {
    updateData(null);
    setError("");
    setIsInitialLoading(Boolean(userId));
    if (userId) refresh({ initial: true });
  }, [userId, refresh, updateData]);

  return (
    <HistorySessionsContext.Provider value={{ data, isInitialLoading, error, refresh, setData: updateData }}>
      {children}
    </HistorySessionsContext.Provider>
  );
}

export function useHistorySessions() {
  const context = useContext(HistorySessionsContext);
  if (!context) throw new Error("useHistorySessions must be used within HistorySessionsProvider");
  return context;
}
