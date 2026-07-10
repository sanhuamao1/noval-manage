export interface PolishRuleConfig {
  /** 用户自定义补充说明 */
  prompt?: string
  // ── 界限 ──
  pace?: "快" | "中" | "慢"
  mood: string[]       // 最多2项
  narrative?: "展示" | "告知" | "混合"
  // ── 侧重点 ──
  senses: string[]
  character: string[]
  environment: string[]
  // ── 手法 ──
  rhetoric?: string
  // ── 高级设置 ──
  timeVariation: boolean
  contrastInsertion: boolean
}

export const DEFAULT_POLISH_CONFIG: PolishRuleConfig = {
  prompt: "",
  pace: undefined,
  mood: [],
  narrative: undefined,
  senses: [],
  character: [],
  environment: [],
  rhetoric: "",
  timeVariation: false,
  contrastInsertion: false,
}

/** 安全解析 config JSON，缺失字段用默认值补齐 */
export function parsePolishConfig(raw: string | null | undefined): PolishRuleConfig {
  if (!raw) return { ...DEFAULT_POLISH_CONFIG }
  try {
    const p = JSON.parse(raw)
    return {
      prompt: p.prompt ?? DEFAULT_POLISH_CONFIG.prompt,
      pace: p.pace ?? DEFAULT_POLISH_CONFIG.pace,
      mood: p.mood ?? DEFAULT_POLISH_CONFIG.mood,
      narrative: p.narrative ?? DEFAULT_POLISH_CONFIG.narrative,
      senses: p.senses ?? DEFAULT_POLISH_CONFIG.senses,
      character: p.character ?? DEFAULT_POLISH_CONFIG.character,
      environment: p.environment ?? DEFAULT_POLISH_CONFIG.environment,
      rhetoric: p.rhetoric ?? DEFAULT_POLISH_CONFIG.rhetoric,
      timeVariation: p.timeVariation ?? DEFAULT_POLISH_CONFIG.timeVariation,
      contrastInsertion: p.contrastInsertion ?? DEFAULT_POLISH_CONFIG.contrastInsertion,
    }
  } catch {
    return { ...DEFAULT_POLISH_CONFIG }
  }
}
