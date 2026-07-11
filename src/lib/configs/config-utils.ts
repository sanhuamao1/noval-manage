// ─── 类型定义 ───
export type OptionColor = "primary" | "success" | "warn" | "default"

export interface ConfigOption {
  value: string
  /** Lucide icon 名称（可选） */
  icon?: string
  /** 选项颜色（可选） */
  color?: OptionColor
  /** 选项说明文案（可选，无 description 则直接用 value） */
  description?: string
}

export interface ListSubField {
  /** 输入框占位文本 */
  placeholder: string
  /** Tailwind 宽度类，如 "w-1/3"、"flex-1"（可选，默认 "flex-1"） */
  width?: string
}

export interface ConfigFieldDef<K extends string = string> {
  key: K
  label: string
  type: "single" | "multi" | "toggle" | "list" | "text"
  options?: readonly ConfigOption[]
  max?: number
  display?: "default" | "flex" | "grid" | "between"
  handler?: string
  /** display="grid" 时的列数，默认 3 */
  cols?: number
  /** 字段图标（lucide 组件名），在 tabs 中显示在 tab trigger 上 */
  icon?: string
  /** type="text" 时输入框的占位文本 */
  placeholder?: string
  /** type="list" 时的子字段定义 */
  subFields?: ListSubField[]
  /** 自定义 Tailwind 类名，会附加到 FormItem 的外层 div 上 */
  className?: string
  /** 不显示 label，优先级高于 renderField 的 noLabel 参数 */
  noLabel?: boolean
  /** 控件变体，如 "box"（multi/single 类型适用） */
  variant?: string
}

export interface TabGroup<K extends string = string> {
  key: K
  label: string
  icon?: string
  type: "tab-group"
  children: ConfigFieldDef[]
  /** 该 tab 内容区域的自定义 Tailwind 类名 */
  class?: string
}

export interface SectionBase {
  title: string
  icon?: string
  class?: string
  children: (ConfigFieldDef | TabGroup)[]
  /** 在 grid 布局中跨越的列数，默认 1 */
  colspan?: number
  /** 从 config 中取值的 key，用于动态标题（如使用角色姓名作为卡片标题） */
  titleKey?: string
  /** 标题是否可编辑（需配合 titleKey 使用） */
  titleEditable?: boolean
}

export interface CardSection extends SectionBase {
  type: "card"
}

export interface TabsSection extends SectionBase {
  type: "tabs"
}

export interface GridSection {
  type: "grid"
  cols: number
  class?: string
  sections: ConfigSection[]
  /** 在 grid 布局中跨越的列数，默认 1 */
  colspan?: number
}

export type ConfigSection = CardSection | TabsSection | GridSection

/** 递归展开 sections 中的所有字段定义 */
export function flattenFields(sections: ConfigSection[]): ConfigFieldDef[] {
  const result: ConfigFieldDef[] = []
  for (const section of sections) {
    if (section.type === "grid") {
      result.push(...flattenFields(section.sections))
    } else {
      for (const child of section.children) {
        if (child.type === "tab-group") {
          result.push(...child.children)
        } else {
          result.push(child)
        }
      }
    }
  }
  return result
}

// ─── 类型推导 ───

/** 字段类型 → 值类型 映射表 */
interface TypeValueMap {
  toggle: boolean
  multi: string[]
  single: string | undefined
  list: string[]
  text: string | undefined
}

/** 从字段定义数组推导配置对象类型 */
export type ConfigOf<
  T extends readonly { key: string; type: "single" | "multi" | "toggle" | "list" | "text" }[],
> = {
  [K in T[number] as K["key"]]: TypeValueMap[K["type"]]
}

// ─── 运行时函数 ───

/**
 * 根据字段定义列表生成默认值对象。
 * toggle → false, multi → [], list → [], single → undefined, text → undefined
 */
export function buildDefaultValues<
  T extends readonly { key: string; type: "single" | "multi" | "toggle" | "list" | "text" }[],
>(fields: T): ConfigOf<T> & { prompt?: string } {
  const result: Record<string, unknown> = {}
  for (const field of fields) {
    if (field.type === "toggle") {
      result[field.key] = false
    } else if (field.type === "multi" || field.type === "list") {
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

