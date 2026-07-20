import { NextRequest } from "next/server";
import { getNovel, list, getRelations } from "@/lib/store";
import { callAIChat } from "@/ai";
import { buildGenOutlinePrompt } from "@/ai/prompt/gen-outline";

/** 从 AI 原始输出中提取纯 markdown（兼容 JSON/代码块等格式） */
function extractMarkdown(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith("#")) return trimmed;

  const fenceMatch = trimmed.match(/^```(?:json|markdown|md)?\s*\n?([\s\S]*?)\n?```\s*$/);
  if (fenceMatch) return extractMarkdown(fenceMatch[1]);

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed.content === "string") {
      try {
        const inner = JSON.parse(parsed.content);
        if (Array.isArray(inner.contents) && inner.contents.every((s: unknown) => typeof s === "string")) {
          return inner.contents.join("\n\n");
        }
      } catch { /* content 就是纯文本 */ }
      return parsed.content;
    }
    if (Array.isArray(parsed.contents) && parsed.contents.every((s: unknown) => typeof s === "string")) {
      return parsed.contents.join("\n\n");
    }
  } catch { /* 不是 JSON */ }

  const dashIdx = trimmed.indexOf("\n---\n");
  if (dashIdx !== -1) return trimmed.slice(dashIdx + 5).trim();

  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const { novelId, prompt: userPrompt, framework, frameworkContent } = (await req.json()) as {
      novelId: string;
      prompt?: string;
      framework?: string;
      frameworkContent?: string;
    };

    if (!novelId) {
      return Response.json({ error: "请提供 novelId" }, { status: 400 });
    }

    if (!framework) {
      return Response.json({ error: "请选择大纲框架" }, { status: 400 });
    }

    const novel = await getNovel(novelId);
    if (!novel) {
      return Response.json({ error: "未找到该小说" }, { status: 404 });
    }

    const characters = await list("character", novelId) as Record<string, unknown>[];
    const organizations = await list("organization", novelId) as Record<string, unknown>[];
    const locations = await list("location", novelId) as Record<string, unknown>[];
    const { links: relations } = await getRelations(novelId);

    const fullPrompt = buildGenOutlinePrompt(
      novelId, novel, characters, organizations, locations, relations, framework, frameworkContent, userPrompt,
    );

    const rawText = await callAIChat([{ role: "user", content: fullPrompt }], {
      systemPrompt:
        "你是一个专业的小说创作助手。请根据用户的设定数据和框架模板生成大纲。直接输出完整的 markdown 文档，不要包裹在代码块或 JSON 中。",
      max_tokens: 16384,
    });

    return Response.json({ content: extractMarkdown(rawText) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "服务器错误";
    return Response.json({ error: message }, { status: 500 });
  }
}