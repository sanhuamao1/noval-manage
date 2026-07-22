import { create } from "zustand";
import type {
  OrganizationData,
  LocationData,
  OutlineData,
  ChapterSummary,
  RelationsData,
  FrameworkData,
} from "@/types/data";
import type { EventNodeData, EventConnectionData } from "@/types/event-data";

interface EntityState {
  characters: { id: string; name: string }[];
  organizations: OrganizationData[];
  locations: LocationData[];
  outlines: OutlineData[];
  chapters: ChapterSummary[];
  relations: RelationsData;
  frameworks: FrameworkData[];
  eventNodes: EventNodeData[];
  eventConnections: EventConnectionData[];
  outlineEvents: { id: string; outlineId: string; eventId: string; sortOrder: number }[];
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
  outlines: [],
  chapters: [],
  relations: { links: [], positions: {} },
  frameworks: [],
  eventNodes: [],
  eventConnections: [],
  outlineEvents: [],
};

export const useEntityStore = create<EntityState & EntityActions>((set) => ({
  ...initial,

  setAll: (data) => set(data),

  updateAll: (patch) => set(patch as Partial<EntityState>),

  setOutlines: (outlines) => set({ outlines }),

  setFrameworks: (frameworks) => set({ frameworks }),

  resetAll: () => set(initial),
}));
