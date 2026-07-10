// ─── 类型定义 ───

export interface ConfigOption {
  value: string
  /** AI-readable meta（可选，无 meta 则直接用 value） */
  meta?: string
}

export interface ConfigFieldDef<K extends string = string> {
  key: K
  label: string
  section: string
  type: "single" | "multi" | "toggle"
  options?: ConfigOption[]
  max?: number
}

// ─── 类型推导 ───

/** 字段类型 → 值类型 映射表 */
interface TypeValueMap {
  toggle: boolean
  multi: string[]
  single: string | undefined
}

/** 从字段定义数组推导配置对象类型 */
export type ConfigOf<
  T extends readonly { key: string; type: "single" | "multi" | "toggle" }[],
> = {
  [K in T[number] as K["key"]]: TypeValueMap[K["type"]]
}

// ─── 运行时函数 ───

/**
 * 根据字段定义列表生成默认值对象。
 * toggle → false, multi → [], single → undefined
 */
export function buildDefaultValues<
  T extends readonly { key: string; type: "single" | "multi" | "toggle" }[],
>(fields: T): ConfigOf<T> & { prompt?: string } {
  const result: Record<string, unknown> = {}
  for (const field of fields) {
    if (field.type === "toggle") {
      result[field.key] = false
    } else if (field.type === "multi") {
      result[field.key] = []
    } else {
      result[field.key] = undefined
    }
  }
  return { ...result, prompt: "" } as ConfigOf<T> & { prompt?: string }
}

/** 安全解析 JSON 配置字符串，缺失字段用默认值补齐 */
export function parseConfig<T extends Record<string, unknown>>(
  raw: string | null | undefined,
  defaults: T,
): T {
  if (!raw) return { ...defaults }
  try {
    const parsed = JSON.parse(raw)
    return { ...defaults, ...parsed }
  } catch {
    return { ...defaults }
  }
}

/** 从字段定义数组生成 key → label 映射 */
export function buildLabelMap(
  fields: readonly { key: string; label: string }[],
): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [f.key, f.label]))
}

/** 根据运行时值类型生成摘要文本数组（通用，不依赖 type 字段） */
export function buildBadgeTexts(
  config: Record<string, unknown>,
  labels: Record<string, string>,
): string[] {
  const badges: string[] = []
  for (const [key, value] of Object.entries(config)) {
    const label = labels[key]
    if (!label) continue
    if (typeof value === "boolean") {
      if (value) badges.push(label)
    } else if (typeof value === "string") {
      if (value) badges.push(`${label}：${value}`)
    } else if (Array.isArray(value)) {
      if (value.length > 0) badges.push(`${label}：${value.join("/")}`)
    }
  }
  return badges
}
