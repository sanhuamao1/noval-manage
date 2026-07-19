import { create } from "zustand";
import type { NovelData, CharacterData, OutlineData, ChapterSummary, PolishRuleData, PolishSampleData, OrganizationData, LocationData, RelationData, RelationsData } from "@/types/data";
import { api } from "@/lib/api";

export type RefreshKey = "novel" | "characters" | "organizations" | "locations" | "foreshadowings" | "outlines" | "chapters" | "polishRules" | "polishSamples" | "relations";

const KEY_API: Record<RefreshKey, (novelId: string) => string> = {
  novel: (id) => `/api/novels?id=${id}`,
  characters: (id) => `/api/characters?novelId=${id}`,
  organizations: (id) => `/api/organizations?novelId=${id}`,
  locations: (id) => `/api/locations?novelId=${id}`,
  outlines: (id) => `/api/outlines?novelId=${id}`,
  foreshadowings: (id) => `/api/foreshadowings?novelId=${id}`,
  chapters: (id) => `/api/chapters?novelId=${id}`,
  polishRules: () => "/api/polish/rules",
  polishSamples: () => "/api/polish/samples",
  relations: (id) => `/api/relations?novelId=${id}`,
};

interface AppStore {
  novel: NovelData | null;

  characters: CharacterData[];
  organizations: OrganizationData[];
  locations: LocationData[];
  foreshadowings: { id: string; name: string }[];
  outlines: OutlineData[];
  chapters: ChapterSummary[];
  polishRules: PolishRuleData[];
  polishSamples: PolishSampleData[];
  relations: RelationsData;

  // 初始化：并行加载 novel + 实体列表
  init: (novelId: string) => Promise<void>;
  setOutlines: (os: OutlineData[]) => void;

  // 通用 mutate：执行 apiCall + 自动刷新对应 key(s) 的数据
  mutate: <T>(novelId: string, refreshKey: RefreshKey | RefreshKey[], apiCall: () => Promise<T>) => Promise<T>;

  reset: () => void;
}

const initial = {
  novel: null as NovelData | null,
  characters: [] as CharacterData[],
  organizations: [] as OrganizationData[],
  locations: [] as LocationData[],
  foreshadowings: [] as { id: string; name: string }[],
  outlines: [] as OutlineData[],
  chapters: [] as ChapterSummary[],
  polishRules: [] as PolishRuleData[],
  polishSamples: [] as PolishSampleData[],
  relations: { links: [] as RelationData[], positions: {} as Record<string, { x: number; y: number }> },
};

export const useAppStore = create<AppStore>((set) => ({
  ...initial,

  init: async (novelId) => {
    const [novel, characters, organizations, locations, foreshadowings, outlines, chapters, polishRules, polishSamples, relations] = await Promise.all([
      api<NovelData>({ url: `/api/novels?id=${novelId}` }),
      api<{ id: string; name: string }[]>({ url: `/api/characters?novelId=${novelId}` }),
      api<OrganizationData[]>({ url: `/api/organizations?novelId=${novelId}` }),
      api<LocationData[]>({ url: `/api/locations?novelId=${novelId}` }),
      api<{ id: string; name: string }[]>({ url: `/api/foreshadowings?novelId=${novelId}` }),
      api<OutlineData[]>({ url: `/api/outlines?novelId=${novelId}` }),
      api<ChapterSummary[]>({ url: `/api/chapters?novelId=${novelId}` }),
      api<PolishRuleData[]>({ url: "/api/polish/rules" }),
      api<PolishSampleData[]>({ url: "/api/polish/samples" }),
      api<RelationsData>({ url: `/api/relations?novelId=${novelId}` }),
    ]);
    set({ novel, characters, organizations, locations, foreshadowings, outlines, chapters, polishRules, polishSamples, relations });
  },

  setOutlines: (outlines) => set({ outlines }),

  mutate: async <T>(
    novelId: string,
    refreshKey: RefreshKey | RefreshKey[],
    apiCall: () => Promise<T>,
  ): Promise<T> => {
    const result = await apiCall();
    const keys = Array.isArray(refreshKey) ? refreshKey : [refreshKey];
    const updates = await Promise.all(
      keys.map((k) => api<unknown>({ url: KEY_API[k](novelId) })),
    );
    const patch: Record<string, unknown> = {};
    keys.forEach((k, i) => { patch[k] = updates[i]; });
    set(patch as Partial<AppStore>);
    return result;
  },

  reset: () => set(initial),
}));
