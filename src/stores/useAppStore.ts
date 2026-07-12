import { create } from "zustand";
import type { NovelData } from "@/types/novel";
import { api } from "@/lib/api";

interface AppStore {
  novel: NovelData | null;

  characters: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  foreshadowings: { id: string; name: string }[];
  outlines: Record<string, unknown>[];

  // 初始化：并行加载 novel + 实体列表
  init: (novelId: string) => Promise<void>;
  setOutlines: (os: Record<string, unknown>[]) => void;

  // 实体变更 action（内部处理 API + store）
  updateNovel: (novelId: string, data: Record<string, any>) => Promise<void>;
  createCharacter: (novelId: string, name: string) => Promise<{ id: string; name: string }>;
  createLocation: (novelId: string, name: string) => Promise<{ id: string; name: string }>;
  createForeshadowing: (novelId: string, name: string) => Promise<{ id: string; name: string }>;

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

  updateNovel: async (novelId, data) => {
    await api({ url: `/api/novels/${novelId}`, method: "PATCH", data });
    const novel = await api<NovelData>({ url: `/api/novels?id=${novelId}` });
    set({ novel });
  },

  createCharacter: async (novelId, name) => {
    const created = await api<{ id: string; name: string }>({
      url: "/api/characters",
      method: "POST",
      data: { novelId, name },
    });
    set((s) => ({ characters: [...s.characters, created] }));
    return created;
  },
  createLocation: async (novelId, name) => {
    const created = await api<{ id: string; name: string }>({
      url: "/api/locations",
      method: "POST",
      data: { novelId, name },
    });
    set((s) => ({ locations: [...s.locations, created] }));
    return created;
  },
  createForeshadowing: async (novelId, name) => {
    const created = await api<{ id: string; name: string }>({
      url: "/api/foreshadowings",
      method: "POST",
      data: { novelId, name },
    });
    set((s) => ({ foreshadowings: [...s.foreshadowings, created] }));
    return created;
  },

  reset: () => set(initial),
}));
