import { create } from "zustand";
import { api } from "@/lib/api";
import { useMenuStore } from "./useMenuStore";
import { usePanelStore } from "./usePanelStore";
import type { PolishRuleData, PolishSampleData } from "@/types/data";

interface PolishStore {
  // UI 状态（原有）
  selectedRuleId: string;
  selectedSampleIds: string[];
  polishResult: string;
  showResultPopover: boolean;

  // 元数据（从 useAppStore 迁移）
  polishRules: PolishRuleData[];
  polishSamples: PolishSampleData[];

  // 动作
  setPolishResult: (val: string) => void;
  setSelectedRuleId: (id: string) => void;
  toggleSampleId: (id: string) => void;
  handlePolishClick: () => void;
  cancelPolish: () => void;
  refreshPolishData: () => Promise<void>;
  setMeta: (data: { polishRules: PolishRuleData[]; polishSamples: PolishSampleData[] }) => void;
  updateMeta: (patch: Record<string, unknown>) => void;
  resetMeta: () => void;
}

export const usePolishStore = create<PolishStore>((set) => ({
  // UI 状态
  selectedRuleId: "",
  selectedSampleIds: [],
  polishResult: "",
  showResultPopover: false,

  // 元数据
  polishRules: [],
  polishSamples: [],

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

  // 自刷新（不再依赖 useAppStore.setState）
  refreshPolishData: async () => {
    const [rules, samples] = await Promise.all([
      api<PolishRuleData[]>({ url: "/api/polish/rules" }),
      api<PolishSampleData[]>({ url: "/api/polish/samples" }),
    ]);
    set({ polishRules: rules, polishSamples: samples });
  },

  // 供 useNovelStore.init / mutate 调用的跨 store 同步接口
  setMeta: (data) => set(data),
  updateMeta: (patch) => set(patch as Partial<Pick<PolishStore, "polishRules" | "polishSamples">>),
  resetMeta: () => set({ polishRules: [], polishSamples: [] }),
}));
