import type { EnrichOperation } from "@/types/data";
import { ALLOWED_APIS, isAllowedApiMethod } from "./operations-schema";

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