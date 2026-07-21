import { create } from "zustand";
import type { NovelData, CharacterData, OutlineData, ChapterSummary, PolishRuleData, PolishSampleData, OrganizationData, LocationData, RelationData, RelationsData, FrameworkData } from "@/types/data";
import type { EventNodeData, EventConnectionData } from "@/types/event-data";
import { api } from "@/lib/api";
import { useEntityStore } from "./useEntityStore";
import { usePolishStore } from "./usePolishStore";

export type RefreshKey = "novel" | "characters" | "organizations" | "locations" | "foreshadowings" | "outlines" | "chapters" | "polishRules" | "polishSamples" | "relations" | "frameworks" | "eventNodes" | "eventConnections" | "outlineEvents";

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
  frameworks: () => `/api/frameworks`,
  eventNodes: (id) => `/api/event-nodes?novelId=${id}`,
  eventConnections: (id) => `/api/event-connections?novelId=${id}`,
  outlineEvents: (id) => `/api/outline-events?novelId=${id}`,
};



interface NovelStore {
  novel: NovelData | null;
  init: (novelId: string) => Promise<void>;
  mutate: <T>(novelId: string, refreshKey: RefreshKey | RefreshKey[], apiCall: () => Promise<T>) => Promise<T>;
  reset: () => void;
}

export const useNovelStore = create<NovelStore>((set) => ({
  novel: null,

  init: async (novelId) => {
    const [novel, characters, organizations, locations, foreshadowings, outlines, chapters, polishRules, polishSamples, relations, frameworks, eventNodes, eventConnections, outlineEvents] = await Promise.all([
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
      api<FrameworkData[]>({ url: `/api/frameworks` }),
      api<EventNodeData[]>({ url: `/api/event-nodes?novelId=${novelId}` }),
      api<EventConnectionData[]>({ url: `/api/event-connections?novelId=${novelId}` }),
      api<{ id: string; outlineId: string; eventId: string; sortOrder: number }[]>({ url: `/api/outline-events?novelId=${novelId}` }),
    ]);
    set({ novel });
    useEntityStore.getState().setAll({
      characters, organizations, locations, foreshadowings,
      outlines, chapters, relations, frameworks,
      eventNodes, eventConnections, outlineEvents,
    });
    usePolishStore.getState().setMeta({ polishRules, polishSamples });
  },

  mutate: async <T>(novelId: string, refreshKey: RefreshKey | RefreshKey[], apiCall: () => Promise<T>): Promise<T> => {
    const result = await apiCall();
    const keys: RefreshKey[] = Array.isArray(refreshKey) ? refreshKey : [refreshKey];
    const updates = await Promise.all(
      keys.map((k) => api<unknown>({ url: KEY_API[k](novelId) })),
    );
    const entityPatch: Record<string, unknown> = {};
    const polishPatch: Record<string, unknown> = {};
    keys.forEach((k, i) => {
      if (k === "novel") {
        set({ novel: updates[i] as NovelData });
      } else if (k === "polishRules" || k === "polishSamples") {
        polishPatch[k] = updates[i];
      } else {
        entityPatch[k] = updates[i];
      }
    });
    if (Object.keys(entityPatch).length) {
      useEntityStore.getState().updateAll(entityPatch);
    }
    if (Object.keys(polishPatch).length) {
      usePolishStore.getState().updateMeta(polishPatch);
    }
    return result;
  },

  reset: () => {
    set({ novel: null });
    useEntityStore.getState().resetAll();
    usePolishStore.getState().resetMeta();
  },
}));
