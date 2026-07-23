import { api } from "./api";

/** SWR fetcher 包装 — 自动泛型推断 */
export async function apiSWR<T>(url: string): Promise<T> {
  return api<T>({ url });
}

/** 实体 key 生成器 */
const ENTITY_URLS: Record<string, (id?: string) => string | null> = {
  novel: (id) => (id ? `/api/novels?id=${id}` : null),
  characters: (id) => (id ? `/api/characters?novelId=${id}` : null),
  organizations: (id) => (id ? `/api/organizations?novelId=${id}` : null),
  locations: (id) => (id ? `/api/locations?novelId=${id}` : null),
  outlines: (id) => (id ? `/api/outlines?novelId=${id}` : null),
  chapters: (id) => (id ? `/api/chapters?novelId=${id}` : null),
  relations: (id) => (id ? `/api/relations?novelId=${id}` : null),
  frameworks: () => "/api/frameworks",
  eventNodes: (id) => (id ? `/api/event-nodes?novelId=${id}` : null),
  eventConnections: (id) => (id ? `/api/event-connections?novelId=${id}` : null),
  outlineEvents: (id) => (id ? `/api/outline-events?novelId=${id}` : null),
  polishRules: () => "/api/polish/rules",
  polishSamples: () => "/api/polish/samples",
};

/** 构建 entity key（返回 null 表示缺少必要参数，SWR 跳过请求） */
export function buildEntityKey(entity: string, novelId?: string): string | null {
  const builder = ENTITY_URLS[entity];
  return builder ? builder(novelId) : null;
}
