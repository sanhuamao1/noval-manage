import { buildFieldSchema } from "../context/field-schema";
import { formatNovelSection } from "../context/novel";
import {
  formatCharactersSection,
  formatOrganizationsSection,
  formatLocationsSection,
} from "../context/entities";
import {
  buildOperationOutputSection,
  buildOperationApiTable,
  buildOperationRulesSection,
} from "../operations-schema";

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
  parts.push(
    `\n---\n\n请根据以上小说设定和字段标准，分析并完善角色、组织、地点三个维度的设定。`,
  );

  // ── 输出格式（共享）──
  parts.push(buildOperationOutputSection(novelId));

  // ── API 对照表（共享）──
  parts.push(buildOperationApiTable());

  // ── 通用规则（共享）──
  parts.push(buildOperationRulesSection());

  // ── 工作流特有规则（不加序号）──
  parts.push(
    `\n**数量要求**：总共生成 5~8 条操作建议，优先修正逻辑矛盾、补充主角关键设定，至少要包含一个地点类型`,
  );
  parts.push(`\n**reason理由**：限制在200字以内`);

  return parts.join("\n");
}
