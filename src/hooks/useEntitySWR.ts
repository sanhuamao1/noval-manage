import useSWR, { type SWRResponse } from "swr";
import { apiSWR, buildEntityKey } from "@/lib/swr-fetcher";

/**
 * 通用实体 SWR hook
 *
 * 替代 usePageData.ts 中的 13 个专用 hook、useEntityStore、dataVersion。
 *
 * @example
 * ```ts
 * // 列表
 * const { data: characters, mutate, isLoading } = useEntitySWR<CharacterData[]>('characters', novelId)
 *
 * // 单条（novel 比较特殊，返回的是对象而不是数组）
 * const { data: novel } = useEntitySWR<NovelData>('novel', id)
 *
 * // 全局实体（不需要 novelId）
 * const { data: frameworks } = useEntitySWR<FrameworkData[]>('frameworks')
 * ```
 */
export function useEntitySWR<T = unknown>(
  entity: string,
  novelId?: string,
): SWRResponse<T, Error> {
  const key = buildEntityKey(entity, novelId);
  return useSWR<T>(key, apiSWR, {
    dedupingInterval: 3000,
    revalidateOnFocus: false,
  });
}
