import type { FieldType, ConfigOf } from "@/types";

/**
 * 根据字段定义列表生成默认值对象。
 * toggle → false, multi → [], list → [], single → undefined, text → undefined
 */
export function buildDefaultValues<
  T extends readonly { key: string; type: FieldType; defaultValue?: unknown }[],
>(fields: T): ConfigOf<T> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if ("defaultValue" in field && field.defaultValue !== undefined) {
      result[field.key] = field.defaultValue;
    } else if (field.type === "toggle") {
      result[field.key] = false;
    } else if (field.type === "multi" || field.type === "list" || field.type === "tagselect") {
      result[field.key] = [];
    } else {
      result[field.key] = undefined;
    }
  }
  return result as ConfigOf<T>;
}

/** 以 defaults 为底，只取 fields 中定义的 key 从 data 覆盖。自动解析数组字段。 */
export function fillConfig<T, S>(
  data: T,
  defaults: S,
  fields: readonly { key: string; type: string }[],
): S {
  const result = { ...defaults } as S;
  for (const field of fields) {
    if (field.key in (data as object)) {
      (result as any)[field.key] = (data as any)[field.key];
    }
  }
  return result;
}
