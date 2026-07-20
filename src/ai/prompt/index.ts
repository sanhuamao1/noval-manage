import { formatNovelSection } from "../context/novel";
import {
  formatCharactersSection,
  formatOrganizationsSection,
  formatLocationsSection,
} from "../context/entities";
import { buildFieldSchema } from "../context/field-schema";
import { formatRelationsSection } from "../context/relations";
import buildRandomizationRules from "./buildRandomizationRules";
import buildOperationOutputSection from "./buildOperationOutputSection";
import { GEN_OUTLINE_OUTPUT_TEMPLATE } from "./templates/gen-outline-output";

import { ConfigEntity, getEntry } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import { buildConfigInstructions } from "@/lib/configs/config-registry";

/** 组装"生成大纲"完整 Prompt */
export function buildGenOutlinePrompt(
  novel: Record<string, unknown>,
  characters: Record<string, unknown>[],
  organizations: Record<string, unknown>[],
  locations: Record<string, unknown>[],
  relations: { source: string; target: string; description: string }[],
  framework: string,
  frameworkContent?: string,
  userPrompt?: string,
): string {
  const parts: string[] = [];

  // ── 任务头部 ──
  parts.push("# 任务：根据小说设定和大纲架构类型，生成大纲");
  if (userPrompt) {
    parts.push(`\n> **额外要求**：${userPrompt}`);
  }
  parts.push(`\n> **选中的大纲框架**：${framework}`);

  // ── 大纲架构模板 ──
  const template = frameworkContent ?? `（框架模板内容为空）`;
  parts.push(`\n---`);
  parts.push(`\n## 大纲框架模板`);
  parts.push(`\n${template}`);

  // ── 小说基本信息 ──
  parts.push(`\n---`);
  parts.push(formatNovelSection(novel));

  // ── 实体数据 ──
  parts.push(formatCharactersSection(characters));
  parts.push(formatOrganizationsSection(organizations));
  parts.push(formatLocationsSection(locations));

  // ── 角色关系网络 ──
  parts.push(formatRelationsSection(relations));

  // ── 情节生成规则 ──
  parts.push(`\n---`);
  parts.push(buildRandomizationRules());

  // ── 输出格式 ──
  parts.push(GEN_OUTLINE_OUTPUT_TEMPLATE);

  return parts.join("\n");
}

/** 组装"完善设定"完整 Prompt */
export function buildEnrichSettingPrompt(
  novelId: string,
  novel: Record<string, unknown>,
  characters: Record<string, unknown>[],
  organizations: Record<string, unknown>[],
  locations: Record<string, unknown>[],
  userPrompt?: string,
): string {
  const parts: string[] = [];

  // ── 请求上下文 ──
  parts.push("# 任务：完善小说设定");
  if (userPrompt) {
    parts.push(`\n> **额外要求**：${userPrompt}`);
  }

  // ── 字段标准 + 参数模板 ──
  parts.push(buildFieldSchema(novelId));

  // ── 小说基本信息（共享）──
  parts.push(`\n---`);
  parts.push(formatNovelSection(novel));

  // ── 实体 Context ──
  parts.push(formatCharactersSection(characters));
  parts.push(formatOrganizationsSection(organizations));
  parts.push(formatLocationsSection(locations));

  // ── 任务描述 ──
  parts.push(`\n---\n\n请根据以上小说设定和字段标准，分析并完善角色、组织、地点三个维度的设定。`);

  // ── 输出格式（共享，含 JSON 模板、API 对照表、通用规则）──
  parts.push(buildOperationOutputSection(novelId));

  // ── 工作流特有规则（不加序号）──
  parts.push(
    `\n**数量要求**：总共生成 5~8 条操作建议，优先修正逻辑矛盾、补充主角关键设定，至少要包含一个地点类型`,
  );
  parts.push(`\n**reason理由**：限制在200字以内`);

  return parts.join("\n");
}

/** 润色规则构建 Prompt */
export function buildPolishPrompt(rule: Record<string, unknown>, text: string): string {
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
