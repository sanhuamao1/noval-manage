import { create } from "zustand";
import type { CharacterData, OrganizationData, LocationData, OutlineData, ChapterSummary, RelationsData, FrameworkData } from "@/types/data";



interface EntityState {
  characters: { id: string; name: string }[];
  organizations: OrganizationData[];
  locations: LocationData[];
  foreshadowings: { id: string; name: string }[];
  outlines: OutlineData[];
  chapters: ChapterSummary[];
  relations: RelationsData;
  frameworks: FrameworkData[];
}

interface EntityActions {
  setAll: (data: Partial<EntityState>) => void;
  updateAll: (patch: Record<string, unknown>) => void;
  setOutlines: (os: OutlineData[]) => void;
  setFrameworks: (frameworks: FrameworkData[]) => void;
  resetAll: () => void;
}

export type { EntityState };

const initial: EntityState = {
  characters: [],
  organizations: [],
  locations: [],
  foreshadowings: [],
  outlines: [],
  chapters: [],
  relations: { links: [], positions: {} },
  frameworks: [],
};

export const useEntityStore = create<EntityState & EntityActions>((set) => ({
  ...initial,

  setAll: (data) => set(data),

  updateAll: (patch) => set(patch as Partial<EntityState>),

  setOutlines: (outlines) => set({ outlines }),

  setFrameworks: (frameworks) => set({ frameworks }),

  resetAll: () => set(initial),
}));
