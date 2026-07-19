import { readFileSync } from "fs";
import { resolve } from "path";
import { formatNovelSection } from "../context/novel";
import {
  formatCharactersSection,
  formatOrganizationsSection,
  formatLocationsSection,
} from "../context/entities";
import { formatRelationsSection } from "../context/relations";

/** 读取指定名称的大纲框架模板 */
function readFrameworkTemplate(framework: string): string {
  const path = resolve(process.cwd(), "configs", "frameworks", `${framework}.md`);
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return `（无法读取框架模板：${framework}）`;
  }
}

/** 组装"生成大纲"完整 Prompt */
export function buildGenOutlinePrompt(
  novelId: string,
  novel: Record<string, unknown>,
  characters: Record<string, unknown>[],
  organizations: Record<string, unknown>[],
  locations: Record<string, unknown>[],
  relations: { source: string; target: string; description: string }[],
  framework: string,
  userPrompt?: string,
): string {
  const parts: string[] = [];
  const f = "```";

  // ── 任务头部 ──
  parts.push("# 任务：根据小说设定和大纲架构类型，生成大纲");
  if (userPrompt) {
    parts.push(`\n> **额外要求**：${userPrompt}`);
  }
  parts.push(`\n> **选中的大纲框架**：${framework}`);

  // ── 大纲架构模板 ──
  const template = readFrameworkTemplate(framework);
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
  parts.push(formatRelationsSection(relations, characters));

  // ── 任务描述 ──
  parts.push(`\n---`);
  parts.push(`\n请根据以上小说设定、角色关系网络和大纲框架模板，生成 ${framework} 风格的小说大纲。`);

  // ── 输出格式 ──
  parts.push(`\n---`);
  parts.push(`\n## 输出要求`);
  parts.push(`\n你必须以**严格 JSON** 格式输出，不要包裹在 markdown 代码块中。`);
  parts.push(`\n${f}json`);
  parts.push(`{`);
  parts.push(`  "analysis": "整体分析简述，说明大纲生成的核心思路和框架适配方式",`);
  parts.push(`  "content": "# 小说大纲：\\\\n\\\\n## 第1章 标题\\\\n- 情节要点\\\\n- 冲突设计\\\\n\\\\n## 第2章 标题\\\\n..."`);
  parts.push(`}`);
  parts.push(f);

  parts.push(`\n### 字段说明`);
  parts.push(`\n| 字段 | 类型 | 说明 |`);
  parts.push(`|------|------|------|`);
  parts.push(`| analysis | string | 整体分析简述，限制200字以内 |`);
  parts.push(`| content | string | 完整的 markdown 格式大纲文档，使用 # 标题划分章节 |`);

  parts.push(`\n### 内容要求`);
  parts.push(`\n- **content 必须是完整的 markdown 大纲文档**，使用 \`#\` / \`##\` 标题层级组织章节`);
  parts.push(`- 使用 markdown 列表描述各章节的核心情节点`);
  parts.push(`- 使用加粗或强调标注关键冲突和转折`);
  parts.push(`- 引用实体时使用 **name** 列中的名称`);
  parts.push(`- 充分利用角色关系网络信息来设计剧情冲突和发展`);
  parts.push(`- 大纲内容要结合小说具体设定，不能泛泛而谈`);

  // ── 规则约束 ──
  parts.push(`\n### 规则约束`);
  parts.push(`\n1. 必须输出纯 JSON，不能包裹在 markdown 代码块中`);
  parts.push(`2. analysis 限制在 200 字以内`);
  parts.push(`3. content 必须是合法的 markdown 格式文本，使用转义换行符 \\\\n`);
  parts.push(`4. 大纲内容要结合小说具体设定，不能泛泛而谈`);

  return parts.join("\n");
}
