import type { PolishSampleData } from "@/types/data";

/** 构建风格样本注入 Prompt（只塞标题 + 注释 + 原文，不塞数值特征） */
export function buildStylePrompt(samples: Record<string, unknown>[]): string {
  if (samples.length === 0) return "";

  let prompt = "【风格参考】\n\n";

  samples.forEach((s, i) => {
    if (s.isNegative) {
      prompt += `【反例 ${i + 1} - 请避免】${s.name || s.title}\n`;
    } else {
      prompt += `【样本 ${i + 1}】${s.name || s.title}\n`;
    }
    if (s.prompt || s.annotation) {
      prompt += `提示：${s.prompt || s.annotation}\n`;
    }
    prompt += `${s.text}\n\n`;
  });

  return prompt;
}