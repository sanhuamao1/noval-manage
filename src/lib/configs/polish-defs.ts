import {
  buildDefaultValues,
  type ConfigOf,
} from "@/lib/configs/config-utils"
import type { ConfigFieldDef } from "@/lib/configs/config-utils"

// ─── 配置定义（单一数据源） ───

export const CONFIG_FIELDS = [
  // ── 界限 ──
  {
    key: "pace" as const,
    label: "节奏",
    section: "界限",
    type: "single" as const,
    options: [
      { value: "快" },
      { value: "中" },
      { value: "慢" },
    ],
  },
  {
    key: "mood" as const,
    label: "情绪 / 氛围",
    section: "界限",
    type: "multi" as const,
    max: 2,
    options: [
      { value: "紧张" },
      { value: "压抑" },
      { value: "温馨" },
      { value: "荒诞" },
      { value: "沉重" },
      { value: "轻松" },
      { value: "悬疑" },
      { value: "悲怆" },
    ],
  },
  {
    key: "narrative" as const,
    label: "叙事手法",
    section: "界限",
    type: "single" as const,
    options: [
      { value: "展示" },
      { value: "告知" },
      { value: "混合" },
    ],
  },

  // ── 侧重点 ──
  {
    key: "senses" as const,
    label: "五感",
    section: "侧重点",
    type: "multi" as const,
    options: [
      { value: "视觉" },
      { value: "听觉" },
      { value: "嗅觉" },
      { value: "味觉" },
      { value: "触觉" },
    ],
  },
  {
    key: "character" as const,
    label: "人物描写",
    section: "侧重点",
    type: "multi" as const,
    options: [
      { value: "神态/微表情" },
      { value: "动作/小动作" },
      { value: "心理/内心独白" },
      { value: "语言/语气" },
    ],
  },
  {
    key: "environment" as const,
    label: "环境描写",
    section: "侧重点",
    type: "multi" as const,
    options: [
      { value: "空间/陈设", meta: "精细化描写空间布局和物品陈设，烘托场景氛围" },
      { value: "光影/天气", meta: "强化光影变化与天气对氛围的烘托作用" },
      { value: "气味/声音", meta: "利用环境中的气味与环境音增强场景真实感" },
    ],
  },

  // ── 高级设置 ──
  {
    key: "rhetoric" as const,
    label: "修辞",
    section: "高级设置",
    type: "single" as const,
    options: [
      { value: "可多用比喻/拟人" },
      { value: "偏白描/克制" },
      { value: "适度排比" },
    ],
  },
  {
    key: "timeVariation" as const,
    label: "时间感与节奏变奏",
    section: "高级设置",
    type: "toggle" as const,
  },
  {
    key: "contrastInsertion" as const,
    label: "对比/反差插入",
    section: "高级设置",
    type: "toggle" as const,
  },
] as const satisfies readonly ConfigFieldDef<string>[]

// ─── 推导 ───

export type PolishConfig = ConfigOf<typeof CONFIG_FIELDS> & { prompt?: string }

export const DEFAULT_POLISH_CONFIG = buildDefaultValues(CONFIG_FIELDS)

// ─── 工具函数 ───

/** 从 config 生成 AI 指令 */
export function buildConfigInstructions(config: PolishConfig): string {
  const lines: string[] = []
  for (const field of CONFIG_FIELDS) {
    const value = config[field.key as keyof typeof config]
    if (field.type === "toggle") {
      if (value) lines.push(`${field.label}：开启`)
    } else if (field.type === "single") {
      if (value) lines.push(`${field.label}：${value}`)
    } else if (field.type === "multi") {
      const arr = value as string[]
      if (arr.length > 0) {
        const metaMap = Object.fromEntries(
          (field.options || []).filter((o) => "meta" in o).map((o) => [o.value, (o as any).meta!]),
        )
        const parts = arr.map((l) => metaMap[l] || l)
        lines.push(`${field.label}：${parts.join("；")}`)
      }
    }
  }
  if (config.prompt) lines.push(`自定义说明：${config.prompt}`)
  return lines.join("\n")
}
