import { create } from "zustand";
import { useMenuStore } from "./useMenuStore";
import { usePanelStore } from "./usePanelStore";

/**
 * 润色相关 UI 状态（数据部分已迁移到 SWR）
 */
interface PolishStore {
  selectedRuleId: string;
  selectedSampleIds: string[];
  polishResult: string;
  showResultPopover: boolean;

  setPolishResult: (val: string) => void;
  setSelectedRuleId: (id: string) => void;
  toggleSampleId: (id: string) => void;
  cancelPolish: () => void;
  handlePolishClick: () => void;
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

  cancelPolish: () => {
    set({ showResultPopover: false });
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
}));
