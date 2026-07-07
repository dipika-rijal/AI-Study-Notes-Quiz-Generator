import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useUIStore } from "../store/uiStore";

// This layout removes the sidebar/navbar for distraction-free studying
export const FocusLayout = () => {
  const setFocusMode = useUIStore((state) => state.setFocusMode);

  useEffect(() => {
    setFocusMode(true);
    return () => setFocusMode(false); // Reset on unmount
  }, [setFocusMode]);

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: "800px", 
      margin: "0 auto", 
      background: "#fff", 
      minHeight: "100vh",
      boxShadow: "0 0 20px rgba(0,0,0,0.05)"
    }}>
      <Outlet />
    </div>
  );
};
