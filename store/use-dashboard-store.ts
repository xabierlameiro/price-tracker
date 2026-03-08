import { create } from "zustand";

type SortBy = "name" | "price-asc" | "price-desc" | "date-desc";

interface DashboardState {
  // Products list UI state
  sortBy: SortBy;
  filterByStore: string | null;

  // Actions
  setSortBy: (sortBy: SortBy) => void;
  setFilterByStore: (storeSlug: string | null) => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  sortBy: "date-desc",
  filterByStore: null,

  setSortBy: (sortBy) => set({ sortBy }),
  setFilterByStore: (filterByStore) => set({ filterByStore }),
  resetFilters: () => set({ sortBy: "date-desc", filterByStore: null }),
}));
