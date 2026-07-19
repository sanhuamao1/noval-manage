import { NextRequest } from "next/server";
import { getNovel, list, genId, getFactoryConversation, saveFactoryConversation, getRelations } from "@/lib/store";
import { callAIChat, type ChatMessage } from "@/lib/ai";
import { extractJSON } from "@/lib/ai/json-parser";
import { buildGenOutlinePrompt } from "@/lib/ai/prompt/gen-outline";

export async function POST(req: NextRequest) {
  try {
    const { novelId, prompt: userPrompt, framework, convId } = (await req.json()) as {
      novelId: string;
      prompt?: string;
      framework?: string;
      convId?: string;
    };

    if (!novelId) {
      return Response.json({ error: "请提供 novelId" }, { status: 400 });
    }

    if (!framework) {
      return Response.json({ error: "请选择大纲框架" }, { status: 400 });
    }

    const novel = getNovel(novelId);
    if (!novel) {
      return Response.json({ error: "未找到该小说" }, { status: 404 });
    }

    let context: ChatMessage[] = [];
    let id = convId ?? genId();

    if (convId) {
      // 已有会话 → 读取历史
      context = getFactoryConversation(novelId, convId);

      // 历史丢失 → 回退为首轮模式重建完整上下文
      if (context.length === 0) {
        const characters = list("character", novelId) as Record<string, unknown>[];
        const organizations = list("organization", novelId) as Record<string, unknown>[];
        const locations = list("location", novelId) as Record<string, unknown>[];
        const { links: relations } = getRelations(novelId);

        const fullPrompt = buildGenOutlinePrompt(
          novelId,
          novel,
          characters,
          organizations,
          locations,
          relations,
          framework,
          userPrompt,
        );

        context = [{ role: "user", content: fullPrompt }];
      }

      // 追加本轮 prompt（附带格式约束）
      if (userPrompt) {
        const followUpPrompt = [
          userPrompt,
          "",
          "**注意**：你仍然必须以首轮的严格 JSON 格式输出，格式为：",
          "```json",
          `{ "analysis": "分析简述", "content": "# 完整的 markdown 大纲文档" }`,
          "```",
          "不要输出其他任何结构的 JSON，不要自创字段。",
        ].join("\n");
        context.push({ role: "user", content: followUpPrompt });
      }
    } else {
      // 首轮 → 构建完整上下文
      const characters = list("character", novelId) as Record<string, unknown>[];
      const organizations = list("organization", novelId) as Record<string, unknown>[];
      const locations = list("location", novelId) as Record<string, unknown>[];
      const { links: relations } = getRelations(novelId);

      const fullPrompt = buildGenOutlinePrompt(
        novelId,
        novel,
        characters,
        organizations,
        locations,
        relations,
        framework,
        userPrompt,
      );

      context = [{ role: "user", content: fullPrompt }];
    }

    const rawText = await callAIChat(context, {
      systemPrompt:
        "你是一个专业的小说创作助手。请根据用户的设定数据和框架模板，输出严格符合格式的结构化 JSON。",
      max_tokens: 16384,
    });

    // 解析 JSON
    const jsonStr = extractJSON(rawText);
    let parsed: { analysis?: string; content?: string };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return Response.json(
        { error: "AI 返回了非 JSON 格式的内容", rawText: rawText.slice(0, 500) },
        { status: 500 },
      );
    }

    if (typeof parsed.content !== "string" || !parsed.content.trim()) {
      return Response.json(
        { error: "AI 返回的 content 为空或不是字符串", raw: parsed },
        { status: 500 },
      );
    }

    // 追加 AI 回复并持久化
    context.push({ role: "assistant", content: rawText });
    saveFactoryConversation(novelId, id, context);

    return Response.json({
      analysis: parsed.analysis || "",
      content: parsed.content,
      convId: id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "服务器错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
