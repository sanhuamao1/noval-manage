import { create } from "zustand";
import { api } from "@/lib/api";
import { useAppStore } from "./useAppStore";
import { useMenuStore } from "./useMenuStore";
import { usePanelStore } from "./usePanelStore";
import type { PolishRuleData, PolishSampleData } from "@/types/data";

interface PolishStore {
  selectedRuleId: string;
  selectedSampleIds: string[];
  polishResult: string;
  showResultPopover: boolean;

  setPolishResult: (val: string) => void;
  setSelectedRuleId: (id: string) => void;
  toggleSampleId: (id: string) => void;
  handlePolishClick: () => void;
  cancelPolish: () => void;
  refreshPolishData: () => Promise<void>;
}

export const usePolishStore = create<PolishStore>((set) => ({
  selectedRuleId: "",
  selectedSampleIds: [],
  polishResult: "",
  showResultPopover: false,

  setPolishResult: (val) => set({ polishResult: val }),
  setSelectedRuleId: (id) => set({ selectedRuleId: id }),

  toggleSampleId: (id) => {
    set((state) => {
      if (state.selectedSampleIds.includes(id)) {
        return { selectedSampleIds: state.selectedSampleIds.filter((s) => s !== id) };
      }
      if (state.selectedSampleIds.length >= 3) return state;
      return { selectedSampleIds: [...state.selectedSampleIds, id] };
    });
  },

  handlePolishClick: () => {
    useMenuStore.getState().hideMenu();
    usePanelStore.getState().setPanelOpen(true);
    set({
      showResultPopover: false,
      polishResult: "",
      selectedRuleId: "",
      selectedSampleIds: [],
    });
  },

  cancelPolish: () => {
    set({ showResultPopover: false });
  },

  refreshPolishData: async () => {
    const [rules, samples] = await Promise.all([
      api<PolishRuleData[]>({ url: "/api/polish/rules" }),
      api<PolishSampleData[]>({ url: "/api/polish/samples" }),
    ]);
    useAppStore.setState({ polishRules: rules, polishSamples: samples });
  },
}));
