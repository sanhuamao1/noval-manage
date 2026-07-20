"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useMemo } from "react";
import type { EnrichOperation } from "@/types/data";
import type { ReactNode } from "react";
import type { SimpleTab } from "@/components/ui/tabs";
import { Wand2, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import type { HttpMethod } from "@/lib/api";
import { useNovelStore } from "@/stores/useNovelStore";

// ── Types ──────────────────────────────────────────────

export interface EnrichResult {
  operations: EnrichOperation[];
  analysis: string;
}

export interface FactoryState {
  activeTab: string;
  changeTab: (key: string) => void;
  tabs: SimpleTab[];
  prompt: string;
  setPrompt: (v: string) => void;
  loading: boolean;
  error: string | null;
  result: EnrichResult | null;
  content: string;
  analysis: string;
  applied: Set<number>;
  applying: Set<number>;
  applyErrors: Map<number, string>;
  discarded: Set<number>;
  editedParams: Map<number, Record<string, unknown>>;
  setEditedParams: (index: number, params: Record<string, unknown>) => void;
  drawerIndex: number | null;
  setDrawerIndex: (index: number | null) => void;
  opsCount: number;
  appliedCount: number;
  reset: () => void;
  handleGenerate: (body?: Record<string, unknown>) => Promise<void>;
  handleApply: (index: number) => Promise<void>;
  handleDiscard: (index: number) => void;
}

/** 单个 tab 的缓存数据，数组形式存储以便 Zustand 精确比对 */
export interface TabCache {
  prompt: string;
  result: EnrichResult | null;
  convId: string | null;
  applied: number[];
  applying: number[];
  applyErrors: [number, string][];
  discarded: number[];
  editedParams: [number, Record<string, unknown>][];
  drawerIndex: number | null;
  loading: boolean;
  error: string | null;
  outlineContent: string;
  outlineAnalysis: string;
}

// ── Constants ──────────────────────────────────────────

export const TABS_MAP: Record<string, { url: string; label: string; icon: ReactNode }> = {
  "enrich-settings": {
    url: "/api/factory/enrich-settings",
    label: "完善设定",
    icon: <Wand2 className="h-3.5 w-3.5" />,
  },
  "gen-outline": {
    url: "/api/factory/gen-outline",
    label: "生成大纲",
    icon: <BookOpen className="h-3.5 w-3.5" />,
  },
};

export const TABS: SimpleTab[] = Object.keys(TABS_MAP).map((key) => {
  const item = TABS_MAP[key];
  return { key, label: item.label, icon: item.icon };
});

// ── Helpers ────────────────────────────────────────────

function emptyCache(): TabCache {
  return {
    prompt: "",
    result: null,
    convId: null,
    applied: [],
    applying: [],
    applyErrors: [],
    discarded: [],
    editedParams: [],
    drawerIndex: null,
    loading: false,
    error: null,
    outlineContent: "",
    outlineAnalysis: "",
  };
}

// ── Store ──────────────────────────────────────────────

export interface FactoryStore {
  activeTab: string;
  /** 按 tabKey 维度缓存各 tab 的操作状态 */
  cache: Record<string, TabCache>;

  changeTab: (key: string) => void;
  setPrompt: (v: string) => void;
  setDrawerIndex: (index: number | null) => void;
  setEditedParams: (index: number, params: Record<string, unknown>) => void;
  resetCurrentTab: () => void;
  handleGenerate: (body?: Record<string, unknown>) => Promise<void>;
  handleApply: (index: number) => Promise<void>;
  handleDiscard: (index: number) => void;
}

/** 当前持久化数据的 schema 版本号 */
const STORAGE_VERSION = 1;

export const useFactoryStore = create<FactoryStore>()(
  persist(
    (set, get) => {
      /** 更新当前 activeTab 对应的缓存 */
      const patchCurrentTab = (updater: (cur: TabCache) => Partial<TabCache>) => {
        set((s) => {
          const tab = s.activeTab;
          const cur = s.cache[tab] ?? emptyCache();
          return {
            cache: {
              ...s.cache,
              [tab]: { ...cur, ...updater(cur) },
            },
          };
        });
      };

      return {
        activeTab: "enrich-settings",
        cache: { "enrich-settings": emptyCache() },

        changeTab: (key) => {
          set((s) => {
            if (!s.cache[key]) {
              return { activeTab: key, cache: { ...s.cache, [key]: emptyCache() } };
            }
            return { activeTab: key };
          });
        },

        setPrompt: (v) => patchCurrentTab(() => ({ prompt: v })),

        setDrawerIndex: (index) => patchCurrentTab(() => ({ drawerIndex: index })),

        setEditedParams: (index, params) => {
          set((s) => {
            const tab = s.activeTab;
            const cur = s.cache[tab] ?? emptyCache();
            return {
              cache: {
                ...s.cache,
                [tab]: {
                  ...cur,
                  editedParams: [
                    ...cur.editedParams.filter(([k]) => k !== index),
                    [index, params] as [number, Record<string, unknown>],
                  ],
                },
              },
            };
          });
        },

        resetCurrentTab: () =>
          patchCurrentTab(() => ({
            result: null,
            applied: [],
            applying: [],
            applyErrors: [],
            discarded: [],
            editedParams: [],
            drawerIndex: null,
            loading: false,
            error: null,
          })),

        handleGenerate: async (body) => {
          const tab = get().activeTab;
          const url = TABS_MAP[tab]?.url;
          if (!url) return;

          const cur = get().cache[tab];
          const novelId = useNovelStore.getState().novel?.id;
          const finalBody: Record<string, unknown> = {
            novelId,
            prompt: cur?.prompt ?? "",
            ...body,
          };

          // 如果是后续轮次，传入 convId
          if (cur.convId) {
            finalBody.convId = cur.convId;
          }

          // 仅设置 loading（保留旧 result，失败时不会丢失）
          patchCurrentTab(() => ({
            loading: true,
            error: null,
          }));

          try {
            const data = await api<{
              operations?: EnrichOperation[];
              content?: string;
              analysis?: string;
              convId?: string;
              error?: string;
            }>({
              url,
              method: "POST",
              data: finalBody,
            });

            if (data.error) throw new Error(data.error);

            // 大纲 tab 返回 content + analysis，完善设定 tab 返回 operations
            if (typeof data.content === "string") {
              patchCurrentTab(() => ({
                loading: false,
                outlineContent: data.content!,
                outlineAnalysis: data.analysis || "",
                convId: data.convId ?? cur.convId ?? null,
              }));
            } else {
              const ops: EnrichOperation[] = data.operations || [];
              patchCurrentTab(() => ({
                loading: false,
                result: { operations: ops, analysis: data.analysis || "" },
                convId: data.convId ?? cur.convId ?? null,
                applied: [],
                applying: [],
                applyErrors: [],
                discarded: [],
                editedParams: [],
                drawerIndex: ops.length > 0 ? 0 : null,
              }));
            }
          } catch (e) {
            patchCurrentTab(() => ({
              loading: false,
              error: e instanceof Error ? e.message : "发生未知错误",
            }));
          }
        },

        handleApply: async (index) => {
          const tab = get().activeTab;
          const cur = get().cache[tab];
          if (!cur?.result) return;

          const op = cur.result.operations[index];
          if (!op) return;

          // 标记正在应用
          patchCurrentTab((c) => ({
            applying: c.applying.includes(index) ? c.applying : [...c.applying, index],
            applyErrors: c.applyErrors.filter(([k]) => k !== index),
          }));

          const edited = cur.editedParams.find(([k]) => k === index)?.[1];
          const opData = edited ?? op.params;

          // DELETE 请求参数通过 query string 传递
          const apiParams =
            op.method === "DELETE"
              ? {
                  id: String(op.params.id ?? ""),
                  novelId: String(op.params.novelId ?? ""),
                }
              : undefined;

          try {
            const novelId = String(op.params.novelId ?? "");

            await useNovelStore.getState().mutate(
              novelId,
              ["characters", "relations"],
              () =>
                api({
                  url: op.api,
                  method: op.method as HttpMethod,
                  params: apiParams,
                  data: op.method !== "DELETE" ? opData : undefined,
                }),
            );

            patchCurrentTab((c) => ({
              applied: c.applied.includes(index) ? c.applied : [...c.applied, index],
              applying: c.applying.filter((v) => v !== index),
            }));
          } catch (e) {
            patchCurrentTab((c) => ({
              applying: c.applying.filter((v) => v !== index),
              applyErrors: [
                ...c.applyErrors.filter(([k]) => k !== index),
                [index, e instanceof Error ? e.message : "应用失败"] as [number, string],
              ],
            }));
          }
        },

        handleDiscard: (index) => {
          patchCurrentTab((c) => ({
            discarded: c.discarded.includes(index) ? c.discarded : [...c.discarded, index],
          }));
        },
      };
    },
    {
      name: "factory-store",
      version: STORAGE_VERSION,
      migrate: (persistedState, version) => {
        // schema v0 → v1: no breaking change, just acknowledging version
        // Future migrations: switch(version) { case 0: /* migrate v0→v1 */ }
        return persistedState as unknown as FactoryStore;
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const cleanCache: Record<string, TabCache> = {};
        for (const [key, tab] of Object.entries(state.cache)) {
          cleanCache[key] = {
            prompt: tab.prompt,
            result: tab.result,
            convId: tab.convId,
            applied: tab.applied,
            applying: [],
            applyErrors: [],
            discarded: tab.discarded,
            editedParams: tab.editedParams,
            drawerIndex: tab.drawerIndex,
            loading: false,
            error: null,
            outlineContent: tab.outlineContent,
            outlineAnalysis: tab.outlineAnalysis,
          };
        }
        return {
          activeTab: state.activeTab,
          cache: cleanCache,
        };
      },
    },
  ),
);

// ── Hook ───────────────────────────────────────────────

/** 工厂页面状态 hook，从 Zustand store 读取当前 tab 数据并转为 Set/Map */
export function useFactory(): FactoryState {
  const activeTab = useFactoryStore((s) => s.activeTab);
  const changeTab = useFactoryStore((s) => s.changeTab);
  const handleGenerate = useFactoryStore((s) => s.handleGenerate);
  const handleApply = useFactoryStore((s) => s.handleApply);
  const handleDiscard = useFactoryStore((s) => s.handleDiscard);
  const setDrawerIndex = useFactoryStore((s) => s.setDrawerIndex);
  const setEditedParams = useFactoryStore((s) => s.setEditedParams);
  const setPrompt = useFactoryStore((s) => s.setPrompt);
  const resetCurrentTab = useFactoryStore((s) => s.resetCurrentTab);

  const cacheEntry = useFactoryStore((s) => s.cache[s.activeTab]);

        const {
          prompt = "",
          result = null,
          convId = null,
          applied: appliedArr = [],
          applying: applyingArr = [],
          applyErrors: applyErrorsArr = [],
          discarded: discardedArr = [],
          editedParams: editedParamsArr = [],
          drawerIndex = null,
          loading = false,
          error = null,
          outlineContent = "",
          outlineAnalysis = "",
        } = cacheEntry ?? {};

  const applied = useMemo(() => new Set(appliedArr), [appliedArr]);
  const applying = useMemo(() => new Set(applyingArr), [applyingArr]);
  const applyErrors = useMemo(() => new Map(applyErrorsArr), [applyErrorsArr]);
  const discarded = useMemo(() => new Set(discardedArr), [discardedArr]);
  const editedParams = useMemo(() => new Map(editedParamsArr), [editedParamsArr]);

  const opsCount = result?.operations.length ?? 0;
  const appliedCount = applied.size;

  return {
    activeTab,
    changeTab,
    tabs: TABS,
    prompt,
    setPrompt,
    loading,
    error,
    result,
    content: outlineContent,
    analysis: outlineAnalysis,
    applied,
    applying,
    applyErrors,
    discarded,
    editedParams,
    setEditedParams,
    drawerIndex,
    setDrawerIndex,
    opsCount,
    appliedCount,
    reset: resetCurrentTab,
    handleGenerate,
    handleApply,
    handleDiscard,
  };
}