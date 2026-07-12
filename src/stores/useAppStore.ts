import { create } from "zustand";
import type { NovelData } from "@/types/novel";
import { api } from "@/lib/api";

export type RefreshKey = "novel" | "characters" | "locations" | "foreshadowings" | "outlines";

const KEY_API: Record<RefreshKey, (novelId: string) => string> = {
  novel:          (id) => `/api/novels?id=${id}`,
  characters:     (id) => `/api/characters?novelId=${id}`,
  locations:      (id) => `/api/locations?novelId=${id}`,
  foreshadowings: (id) => `/api/foreshadowings?novelId=${id}`,
  outlines:       (id) => `/api/outlines?novelId=${id}`,
};

interface AppStore {
  novel: NovelData | null;

  characters: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  foreshadowings: { id: string; name: string }[];
  outlines: Record<string, unknown>[];

  // 初始化：并行加载 novel + 实体列表
  init: (novelId: string) => Promise<void>;
  setOutlines: (os: Record<string, unknown>[]) => void;

  // 通用 mutate：执行 apiCall + 自动刷新对应 key 的数据
  mutate: <T>(
    novelId: string,
    refreshKey: RefreshKey,
    apiCall: () => Promise<T>,
  ) => Promise<T>;

  reset: () => void;
}

const initial = {
  novel: null as NovelData | null,
  characters: [] as { id: string; name: string }[],
  locations: [] as { id: string; name: string }[],
  foreshadowings: [] as { id: string; name: string }[],
  outlines: [] as Record<string, unknown>[],
};

export const useAppStore = create<AppStore>((set) => ({
  ...initial,

  init: async (novelId) => {
    const [novel, characters, locations, foreshadowings] = await Promise.all([
      api<NovelData>({ url: `/api/novels?id=${novelId}` }),
      api<{ id: string; name: string }[]>({ url: `/api/characters?novelId=${novelId}` }),
      api<{ id: string; name: string }[]>({ url: `/api/locations?novelId=${novelId}` }),
      api<{ id: string; name: string }[]>({ url: `/api/foreshadowings?novelId=${novelId}` }),
    ]);
    set({ novel, characters, locations, foreshadowings });
  },

  setOutlines: (outlines) => set({ outlines }),

  mutate: async <T>(
    novelId: string,
    refreshKey: RefreshKey,
    apiCall: () => Promise<T>,
  ): Promise<T> => {
    const result = await apiCall();
    const url = KEY_API[refreshKey](novelId);
    const freshData = await api<unknown>({ url });
    set({ [refreshKey]: freshData });
    return result;
  },

  reset: () => set(initial),
}));
