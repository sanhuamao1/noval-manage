import type { PolishSampleConfig } from "@/types/entityConfig";

/** 构建风格样本注入 Prompt（只塞标题 + 注释 + 原文，不塞数值特征） */
export function buildStylePrompt(samples: PolishSampleConfig[]): string {
  if (samples.length === 0) return "";

  let prompt = "【风格参考】\n\n";

  samples.forEach((s, i) => {
    if (s.isNegative) {
      prompt += `【反例 ${i + 1} - 请避免】${s.name}\n`;
    } else {
      prompt += `【样本 ${i + 1}】${s.name}\n`;
    }
    if (s.prompt) {
      prompt += `提示：${s.prompt}\n`;
    }
    prompt += `${s.text}\n\n`;
  });

  return prompt;
}