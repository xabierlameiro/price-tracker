import type { Theme } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // UI State
  theme: Theme;
  sidebarOpen: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      theme: "system",
      sidebarOpen: false,

      // Actions
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "app-store", // localStorage key
      // Only persist theme preference; UI transient state is not persisted
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
