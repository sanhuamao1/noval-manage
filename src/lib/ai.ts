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

export function buildPolishPrompt(rule: { name: string; prompt: string }, text: string): string {
  return `请按照以下规则对文本进行润色：

润色规则：${rule.name}
规则说明：${rule.prompt}

原文：
${text}

请直接返回润色后的结果，不要添加任何解释。`
}
