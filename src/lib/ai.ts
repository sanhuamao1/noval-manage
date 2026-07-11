import { DEFAULT_POLISH_CONFIG, buildConfigInstructions } from "@/lib/configs/polish-defs"
import { parseConfig } from "@/lib/configs/config-utils"

export async function callAI(prompt: string, apiKey?: string, baseUrl?: string) {
  const url = process.env.AI_BASE_URL || ""
  const model = process.env.AI_MODEL
  const key = process.env.AI_API_KEY

  console.log(url,model)

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



/** 构建风格样本注入 Prompt（只塞标题 + 注释 + 原文，不塞数值特征） */
export function buildStylePrompt(
  samples: { title: string; annotation?: string | null; text: string; is_negative: boolean }[],
): string {
  if (samples.length === 0) return ""

  let prompt = "【风格参考】\n\n"

  samples.forEach((s, i) => {
    if (s.is_negative) {
      prompt += `【反例 ${i + 1} - 请避免】${s.title}\n`
    } else {
      prompt += `【样本 ${i + 1}】${s.title}\n`
    }
    if (s.annotation) {
      prompt += `提示：${s.annotation}\n`
    }
    prompt += `${s.text}\n\n`
  })

  return prompt
}

export function buildPolishPrompt(
  rule: { name: string; description?: string | null; prompt?: string; config?: string },
  text: string,
): string {
  const parts: string[] = []
  parts.push(`请按照以下要求对文本进行润色（结果需要缩进，每段不需要换行）：`)

  if (rule.description) {
    parts.push(`\n规则说明：${rule.description}`)
  }

  if (rule.config) {
    const parsed = parseConfig(rule.config, DEFAULT_POLISH_CONFIG)
    const section = buildConfigInstructions(parsed)
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
