"use client";

import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/api";
import type { RefreshKey } from "@/stores/useAppStore";

/** 实体条目基础类型 */
export interface EntityItemBase {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * 根据实体 key 从全局 store 读取条目列表和创建函数。
 *
 * @example
 * ```ts
 * const { items, createFn } = useEntityItems<Character>("characters");
 * ```
 */
export function useEntityItems<T extends EntityItemBase = EntityItemBase>(entity: string) {
  const items = (useAppStore((s) => (s as any)[entity] ?? []) ?? []) as T[];
  const mutate = useAppStore((s) => s.mutate);

  const createFn = async (novelId: string, name: string): Promise<T> => {
    return mutate<T>(novelId, entity as RefreshKey, () =>
      api<T>({
        url: `/api/${entity}`,
        method: "POST",
        data: { novelId, name },
      }),
    );
  };

  return { items, createFn } as const;
}
