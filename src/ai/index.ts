import { api } from "../lib/api";

// ---- 模块级配置（只读一次，避免每次调用重复读取 process.env） ----

const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL ?? "";
const AI_CHAT_URL = buildChatUrl();

function buildChatUrl(): string {
  const base = process.env.AI_BASE_URL || "";
  if (base.endsWith("/chat/completions")) return base;
  return base + "/chat/completions";
}

if (!AI_MODEL) {
  throw new Error("请配置 AI_MODEL 环境变量");
}

// ---- 辅助函数 ----

function getKey(overrideKey?: string): string {
  const key = overrideKey ?? AI_API_KEY;
  if (!key) throw new Error("请配置 AI_API_KEY 环境变量");
  return key;
}

// ---- 类型定义 ----

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatOptions {
  systemPrompt?: string;
  temperature?: number;
  max_tokens?: number;
  apiKey?: string;
}

// ---- 非流式多轮对话 ----

/**
 * 非流式多轮对话调用 AI，返回完整文本
 * messages 为标准 OpenAI 格式 [{ role, content }]
 */
export async function callAIChat(
  messages: ChatMessage[],
  options?: ChatOptions,
): Promise<string> {
  const key = getKey(options?.apiKey);
  const { systemPrompt, temperature = 0.7, max_tokens = 4096 } = options ?? {};

  const res = await api<{ choices: Array<{ message: { content: string } }> }>({
    url: AI_CHAT_URL,
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    data: {
      model: AI_MODEL,
      messages: systemPrompt
        ? [{ role: "system", content: systemPrompt }, ...messages]
        : messages,
      temperature,
      max_tokens,
    },
  });

  return res.choices[0].message.content;
}

// ---- 简化单轮调用（委托给 callAIChat） ----

/**
 * 单轮对话调用 AI（简版），内部委托给 callAIChat
 */
export async function callAI(prompt: string, apiKey?: string) {
  return callAIChat([{ role: "user", content: prompt }], {
    systemPrompt: "你是一个专业的小说创作助手。请根据用户的要求进行文本润色。",
    apiKey,
  });
}

// ---- 流式调用 ----

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

  const key = getKey(overrideKey);

  const res = await fetch(AI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
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
