import { ConfigEntity, getEntry } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import { buildConfigInstructions } from "@/lib/configs/config-registry";
import type { PolishRuleConfig } from "@/types/entityConfig";

/** 润色规则构建 Prompt */
export function buildPolishPrompt(rule: PolishRuleConfig, text: string): string {
  const parts: string[] = [];
  parts.push(`请按照以下要求对文本进行润色（结果需要缩进，每段不需要换行）：`);

  if (rule.description) {
    parts.push(`\n规则说明：${rule.description}`);
  }

  // 从注册表获取字段定义和默认值，只填充合法字段
  const { fields, defaults } = getEntry(ConfigEntity.POLISH_RULE);
  const config = fillConfig(rule, defaults, fields) as Record<string, unknown>;
  const section = buildConfigInstructions(config, fields);
  if (section.trim()) {
    parts.push(`\n${section}`);
  }

  if (rule.prompt && !section) {
    parts.push(`\n规则补充：${rule.prompt}`);
  }

  parts.push(`\n原文：\n${text}`);
  parts.push(`\n请直接返回润色后的结果，不要添加任何解释。`);

  return parts.join("\n");
}