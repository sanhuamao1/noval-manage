"use client";

import { useAppStore } from "@/stores/useAppStore";
import { ENTITY_META } from "@/lib/entities";

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
 * const { items, createFn } = useEntityItems<Character>(entity);
 * ```
 */
export function useEntityItems<T extends EntityItemBase = EntityItemBase>(entity: string) {
  const meta = ENTITY_META[entity];
  const items = (useAppStore((s) => (s as any)[meta.storeKey] ?? []) ?? []) as T[];
  const createFn = useAppStore((s) => (s as any)[meta.createAction]) as (
    novelId: string,
    name: string,
  ) => Promise<T>;
  return { items, createFn } as const;
}
