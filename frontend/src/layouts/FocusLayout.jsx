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
    <div className="min-h-screen w-full bg-[var(--theme-bg-primary)] flex flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-6xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
};
