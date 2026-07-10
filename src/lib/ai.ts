import { parsePolishConfig } from "@/types/polish"

export async function callAI(prompt: string, apiKey?: string, baseUrl?: string) {
  const key = apiKey || process.env.AI_API_KEY || ''
  const url = baseUrl || process.env.AI_BASE_URL || 'https://api.deepseek.com/v1/chat/completions'
  const model = process.env.AI_MODEL || 'deepseek-chat'

  if (!key) {
    throw new Error('请配置 AI API Key（在 .env.local 中设置 AI_API_KEY）')
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是一个专业的小说创作助手。请根据用户的要求进行文本润色。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`AI API 调用失败: ${error}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}

/** 将 config 转为 AI 指令，有配置的直接 push */
function buildConfigSection(config: ReturnType<typeof parsePolishConfig>): string {
  const lines: string[] = []
  if (config.pace) lines.push(`叙事节奏：${config.pace}`)
  if (config.mood.length > 0) lines.push(`情绪氛围：${config.mood.join("、")}`)
  if (config.narrative) lines.push(`叙事手法：${config.narrative}`)
  if (config.senses.length > 0) lines.push(`侧重五感：${config.senses.join("、")}`)
  if (config.character.length > 0) lines.push(`侧重人物描写：${config.character.join("、")}`)
  if (config.environment.length > 0) lines.push(`侧重环境描写：${config.environment.join("、")}`)
  if (config.rhetoric) lines.push(`修辞风格：${config.rhetoric}`)
  if (config.timeVariation) lines.push('时间感与节奏变奏：开启')
  if (config.contrastInsertion) lines.push('对比/反差插入：开启')
  if (config.prompt) lines.push(`自定义说明：${config.prompt}`)
  return lines.join('\n')
}

export function buildPolishPrompt(
  rule: { name: string; description?: string | null; prompt?: string; config?: string },
  text: string,
): string {
  const parts: string[] = []
  parts.push(`请按照以下要求对文本进行润色：`)

  if (rule.description) {
    parts.push(`\n规则说明：${rule.description}`)
  }

  if (rule.config) {
    const parsed = parsePolishConfig(rule.config)
    const section = buildConfigSection(parsed)
    if (section.trim()) {
      parts.push(`\n${section}`)
    }
  }

  if (rule.prompt && !rule.config) {
    parts.push(`\n规则补充：${rule.prompt}`)
  }

  parts.push(`\n原文：\n${text}`)
  parts.push(`\n请直接返回润色后的结果，不要添加任何解释。`)

  return parts.join('\n')
}
