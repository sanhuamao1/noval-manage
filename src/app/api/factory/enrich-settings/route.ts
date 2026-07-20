import { NextRequest } from "next/server";
import {
  getNovel,
  list,
  genId,
  getFactoryConversation,
  saveFactoryConversation,
} from "@/lib/store";
import { callAIChat, type ChatMessage } from "@/ai";
import { extractJSON } from "@/ai/json-parser";
import { buildEnrichSettingPrompt } from "@/ai/prompt";
import { validateOperation } from "@/ai/validators";
import type { EnrichOperation } from "@/types/data";

export async function POST(req: NextRequest) {
  try {
    const {
      novelId,
      prompt: userPrompt,
      convId,
    } = (await req.json()) as {
      novelId: string;
      prompt?: string;
      convId?: string;
    };

    if (!novelId) {
      return Response.json({ error: "请提供 novelId" }, { status: 400 });
    }

    const novel = await getNovel(novelId);
    if (!novel) {
      return Response.json({ error: "未找到该小说" }, { status: 404 });
    }

    let context: ChatMessage[] = [];
    let id = convId ?? genId();

    if (convId) {
      // 已有会话 → 读取历史
      context = await getFactoryConversation(novelId, convId);

      // 历史丢失 → 回退为首轮模式重建完整上下文
      if (context.length === 0) {
        const characters = (await list("character", novelId)) as Record<string, unknown>[];
        const organizations = (await list("organization", novelId)) as Record<string, unknown>[];
        const locations = (await list("location", novelId)) as Record<string, unknown>[];

        const fullPrompt = buildEnrichSettingPrompt(
          novelId,
          novel,
          characters,
          organizations,
          locations,
          userPrompt,
        );

        context = [{ role: "user", content: fullPrompt }];
      }

      // 追加本轮 prompt（附带格式约束，确保 AI 输出 operations JSON）
      if (userPrompt) {
        const followUpPrompt = [
          userPrompt,
          "",
          "**注意**：你仍然必须以首轮的严格 JSON 格式输出，格式为：",
          "```json",
          `{ "analysis": "分析简述", "operations": [{ "changeType": "add|update|delete", "reason": "...", "summary": "...", "api": "/api/...", "method": "POST|PUT|DELETE", "params": { "novelId": "${novelId}", ... } }] }`,
          "```",
          "不要输出其他任何结构的 JSON，不要自创字段，不要输出 markdown 包裹外的内容。",
        ].join("\n");
        context.push({ role: "user", content: followUpPrompt });
      }
    } else {
      // 首轮 → 构建完整上下文
      const characters = (await list("character", novelId)) as Record<string, unknown>[];
      const organizations = (await list("organization", novelId)) as Record<string, unknown>[];
      const locations = (await list("location", novelId)) as Record<string, unknown>[];

      const fullPrompt = buildEnrichSettingPrompt(
        novelId,
        novel,
        characters,
        organizations,
        locations,
        userPrompt,
      );

      context = [{ role: "user", content: fullPrompt }];
    }

    const rawText = await callAIChat(context, {
      systemPrompt:
        "你是一个专业的小说创作助手。请根据用户的设定数据和字段约束，输出严格符合格式的结构化 JSON。",
      max_tokens: 16384,
    });

    // 解析 JSON
    const jsonStr = extractJSON(rawText);
    let parsed: { analysis?: string; operations?: unknown[] };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return Response.json(
        { error: "AI 返回了非 JSON 格式的内容", rawText: rawText.slice(0, 500) },
        { status: 500 },
      );
    }

    if (!Array.isArray(parsed.operations)) {
      return Response.json(
        { error: "AI 返回的 operations 不是数组", raw: parsed },
        { status: 500 },
      );
    }

    // 校验并过滤合法操作
    const validOps: EnrichOperation[] = [];
    const skipped: unknown[] = [];
    for (const op of parsed.operations) {
      if (validateOperation(op, novelId)) {
        validOps.push(op);
      } else {
        skipped.push(op);
      }
    }

    // 追加 AI 回复并持久化
    context.push({ role: "assistant", content: rawText });
    await saveFactoryConversation(novelId, id, context);

    return Response.json({
      operations: validOps,
      analysis: parsed.analysis || "",
      skipped: skipped.length > 0 ? skipped : undefined,
      convId: id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "服务器错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
