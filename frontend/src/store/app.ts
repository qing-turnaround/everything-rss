import { create } from "zustand";

export type ViewType = "article" | "social" | "video";

interface AppState {
  activeView: ViewType;
  selectedFeedId: string | null;
  selectedEntryId: string | null;
  sidebarWidth: number;
  entryListWidth: number;
  setActiveView: (view: ViewType) => void;
  setSelectedFeedId: (id: string | null) => void;
  setSelectedEntryId: (id: string | null) => void;
  setSidebarWidth: (w: number) => void;
  setEntryListWidth: (w: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeView: "article",
  selectedFeedId: null,
  selectedEntryId: null,
  sidebarWidth: getStoredNumber("sidebarWidth", 220),
  entryListWidth: getStoredNumber("entryListWidth", 350),
  setActiveView: (view) => set({ activeView: view, selectedFeedId: null, selectedEntryId: null }),
  setSelectedFeedId: (id) => set({ selectedFeedId: id, selectedEntryId: null }),
  setSelectedEntryId: (id) => set({ selectedEntryId: id }),
  setSidebarWidth: (w) => {
    if (typeof window !== "undefined") localStorage.setItem("sidebarWidth", String(w));
    set({ sidebarWidth: w });
  },
  setEntryListWidth: (w) => {
    if (typeof window !== "undefined") localStorage.setItem("entryListWidth", String(w));
    set({ entryListWidth: w });
  },
}));

function getStoredNumber(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(key);
  return v ? parseInt(v, 10) : fallback;
}
