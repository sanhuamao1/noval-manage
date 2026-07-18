import { create } from "zustand";

interface PanelStore {
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

export const usePanelStore = create<PanelStore>((set) => ({
  panelOpen: false,
  setPanelOpen: (open) => set({ panelOpen: open }),
}));
