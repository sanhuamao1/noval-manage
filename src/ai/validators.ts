import type { EnrichOperation } from "@/types/data";

// ── 集中配置 ──

/** API 路由 → 标签名 + 允许的方法（单一数据源，同时驱动 validators 和 Prompt） */
export const OPERATION_ENTITIES: Record<
  string,
  { label: string; methods: readonly string[] }
> = {
  "/api/characters": { label: "角色", methods: ["POST", "PUT", "DELETE"] },
  "/api/organizations": { label: "组织/势力", methods: ["POST", "PUT", "DELETE"] },
  "/api/locations": { label: "地点", methods: ["POST", "PUT", "DELETE"] },
  "/api/relations/link": { label: "关系", methods: ["POST"] },
};

export const ALLOWED_APIS: readonly string[] = Object.keys(OPERATION_ENTITIES);

export function isAllowedApiMethod(api: string, method: string): boolean {
  const entry = OPERATION_ENTITIES[api];
  return !!entry && (entry.methods as readonly string[]).includes(method);
}

/** 校验单个操作是否合法 */
export function validateOperation(
  op: unknown,
  novelId: string,
): op is EnrichOperation {
  if (!op || typeof op !== "object") return false;
  const o = op as Record<string, unknown>;

  if (!["add", "update", "delete"].includes(o.changeType as string)) return false;
  if (typeof o.reason !== "string" || !o.reason) return false;
  if (typeof o.summary !== "string" || !o.summary) return false;
  if (typeof o.api !== "string" || !ALLOWED_APIS.includes(o.api)) return false;
  if (
    typeof o.method !== "string" ||
    !["POST", "PUT", "DELETE"].includes(o.method as string)
  )
    return false;
  if (!o.params || typeof o.params !== "object") return false;

  const api = o.api as string;
  const method = o.method as string;
  const params = o.params as Record<string, unknown>;

  if (!isAllowedApiMethod(api, method)) return false;
  if (!params.novelId || params.novelId !== novelId) return false;
  if ((method === "PUT" || method === "DELETE") && !params.id) return false;

  return true;
}