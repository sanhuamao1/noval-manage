import { buildConfigInstructions, ConfigEntity, getEntry } from "@/lib/configs/config-registry"
import { fillConfig } from "@/lib/configs/config-utils"
import { PolishRuleConfig, PolishSampleConfig } from '@/lib/configs/generated'
import { api } from './api'

export async function callAI(prompt: string, apiKey?: string, baseUrl?: string) {
  const url = (process.env.AI_BASE_URL || "") + "/chat/completions"
  const model = process.env.AI_MODEL
  const key = apiKey ?? process.env.AI_API_KEY

  if (!key) {
    throw new Error('请配置 AI API Key（在 .env.local 中设置 AI_API_KEY）')
  }

  const res = await api<{ choices: Array<{ message: { content: string } }> }>({
    url,
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    data: {
      model,
      messages: [
        { role: 'system', content: '你是一个专业的小说创作助手。请根据用户的要求进行文本润色。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    },
  })

  return res.choices[0].message.content
}



/** 构建风格样本注入 Prompt（只塞标题 + 注释 + 原文，不塞数值特征） */
export function buildStylePrompt(
  samples: PolishSampleConfig[],
): string {
  if (samples.length === 0) return ""

  let prompt = "【风格参考】\n\n"

  samples.forEach((s, i) => {
    if (s.isNegative) {
      prompt += `【反例 ${i + 1} - 请避免】${s.name}\n`
    } else {
      prompt += `【样本 ${i + 1}】${s.name}\n`
    }
    if (s.prompt) {
      prompt += `提示：${s.prompt}\n`
    }
    prompt += `${s.text}\n\n`
  })

  return prompt
}

/** 润色规则构建 */
export function buildPolishPrompt(
  rule: PolishRuleConfig,
  text: string,
): string {
  const parts: string[] = []
  parts.push(`请按照以下要求对文本进行润色（结果需要缩进，每段不需要换行）：`)

  if (rule.description) {
    parts.push(`\n规则说明：${rule.description}`)
  }

  // 从注册表获取字段定义和默认值，只填充合法字段
  const { fields, defaults } = getEntry(ConfigEntity.POLISH_RULE)
  const config = fillConfig(rule, defaults, fields) as Record<string, unknown>
  const section = buildConfigInstructions(config, fields)
  if (section.trim()) {
    parts.push(`\n${section}`)
  }

  if (rule.prompt && !section) {
    parts.push(`\n规则补充：${rule.prompt}`)
  }

  parts.push(`\n原文：\n${text}`)
  parts.push(`\n请直接返回润色后的结果，不要添加任何解释。`)

  return parts.join('\n')
}
