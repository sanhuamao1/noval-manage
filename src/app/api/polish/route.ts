import { NextRequest, NextResponse } from "next/server";
import { get, list, put } from "@/lib/store";
import { callAI, buildPolishPrompt, buildStylePrompt } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { type, ruleId, sampleIds, text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "请提供要润色的文本" }, { status: 400 });
    }

    // 规则模式
    if (type === "rule") {
      const rule = get<Record<string, unknown>>("polish-rule", ruleId);
      if (!rule) {
        return NextResponse.json({ error: "未找到润色规则" }, { status: 400 });
      }

      const prompt = buildPolishPrompt(rule, text);
      const polishedText = await callAI(prompt);

      put('polish-rule', ruleId, { ...rule, useCount: ((rule.useCount as number) ?? 0) + 1 })
      return NextResponse.json({ originalText: text, polishedText })
    }

    // 样本模式
    if (type === "sample") {
      const allSamples = list<Record<string, unknown>>("polish-sample");
      const samples = sampleIds?.length ? allSamples.filter((r) => sampleIds.includes(r.id)) : [];

      const styleSamples = samples.map((s) => ({
        title: s.name as string,
        annotation: (s.prompt as string) || null,
        text: (s.text as string) || "",
        isNegative: !!s.isNegative,
      }));

      const prompt =
        buildStylePrompt(styleSamples) +
        `\n请参考以上风格对以下文本进行润色（结果需要缩进，每段不需要换行）：\n原文：\n${text}\n\n请直接返回润色后的结果，不要添加任何解释。`;

      const polishedText = await callAI(prompt);

      // increment useCount for each sample
      if (sampleIds?.length > 0) {
        for (const sid of sampleIds) {
          const s = get<Record<string, unknown>>("polish-sample", sid);
          if (s) put("polish-sample", sid, { ...s, useCount: ((s.useCount as number) ?? 0) + 1 });
        }
      }

      return NextResponse.json({ originalText: text, polishedText });
    }

    return NextResponse.json({ error: "请指定润色规则或风格样本" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
