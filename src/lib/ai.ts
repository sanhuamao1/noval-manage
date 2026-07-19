import { api } from "./api";

function buildChatUrl(): string {
  const base = process.env.AI_BASE_URL || "";
  if (base.endsWith("/chat/completions")) return base;
  return base + "/chat/completions";
}

export interface ChatMessage {
  role: string;
  content: string;
}

/**
 * 非流式多轮对话调用 AI，返回完整文本
 * messages 为标准 OpenAI 格式 [{ role, content }]
 */
export async function callAIChat(
  messages: ChatMessage[],
  options?: {
    systemPrompt?: string;
    temperature?: number;
    max_tokens?: number;
    apiKey?: string;
  },
): Promise<string> {
  const url = buildChatUrl();
  const model = process.env.AI_MODEL;
  const key = options?.apiKey ?? process.env.AI_API_KEY;

  if (!key) {
    throw new Error("请配置 AI API Key（在 .env.local 中设置 AI_API_KEY）");
  }

  const { systemPrompt, temperature = 0.7, max_tokens = 4096 } = options ?? {};

  const requestData: Record<string, unknown> = {
    model,
    messages: systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages,
    temperature,
    max_tokens,
  };

  const res = await api<{ choices: Array<{ message: { content: string } }> }>({
    url,
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    data: requestData as Record<string, unknown>,
  });

  return res.choices[0].message.content;
}

export async function callAI(prompt: string, apiKey?: string, baseUrl?: string) {
  const url = buildChatUrl();
  const model = process.env.AI_MODEL;
  const key = apiKey ?? process.env.AI_API_KEY;

  if (!key) {
    throw new Error("请配置 AI API Key（在 .env.local 中设置 AI_API_KEY）");
  }

  const res = await api<{ choices: Array<{ message: { content: string } }> }>({
    url,
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    data: {
      model,
      messages: [
        { role: "system", content: "你是一个专业的小说创作助手。请根据用户的要求进行文本润色。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    },
  });

  return res.choices[0].message.content;
}

export interface AIStreamOptions {
  prompt: string;
  /** system prompt，默认为通用创作助手 */
  systemPrompt?: string;
  temperature?: number;
  max_tokens?: number;
  apiKey?: string;
}

/**
 * 流式调用 AI，返回一个 AsyncGenerator 逐个产出文本块
 * 用法：for await (const chunk of callAIStream({ prompt })) { ... }
 */
export async function* callAIStream(options: AIStreamOptions): AsyncGenerator<string> {
  const {
    prompt,
    systemPrompt = "你是一个专业的小说创作助手。",
    temperature = 0.7,
    max_tokens = 4096,
    apiKey: overrideKey,
  } = options;

  const url = buildChatUrl();
  const model = process.env.AI_MODEL;
  const key = overrideKey ?? process.env.AI_API_KEY;

  if (!key) {
    throw new Error("请配置 AI API Key（在 .env.local 中设置 AI_API_KEY）");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature,
      max_tokens,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI 请求失败: ${res.status} ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("无法读取 AI 响应流");

  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;

      const dataStr = trimmed.slice(5).trim();
      if (dataStr === "[DONE]") return;

      try {
        const parsed = JSON.parse(dataStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // 跳过解析失败的行
      }
    }
  }
}