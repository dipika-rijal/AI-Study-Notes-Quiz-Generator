import { create } from "zustand";

export const useUIStore = create((set) => ({
  isSidebarOpen: true,
  focusMode: false, // Used for distraction-free reading/quizzes
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setFocusMode: (isFocus) => set({ focusMode: isFocus }),
}));
