import { CONFIGS } from "@/lib/configs/generated";
import type { ConfigFieldDef } from "@/types/configs";
import { ConfigEntity } from "@/types/entity";
import { RELATIONS_PARAMS_TEMPLATE } from "../prompt/templates/relations-params";

const ENTITIES: { configKey: ConfigEntity; name: string }[] = [
  { configKey: ConfigEntity.CHARACTER, name: "角色 (Character)" },
  { configKey: ConfigEntity.ORGANIZATION, name: "组织/势力 (Organization)" },
  { configKey: ConfigEntity.LOCATION, name: "地点 (Location)" },
];

/** 从 CONFIGS 生成字段定义表 + 类型示例。默认输出全部实体，可传 entities 筛选 */
export function buildFieldSchema(novelId: string, entities?: ConfigEntity[]): string {
  const parts: string[] = [];

  const entitySet = entities ? new Set(entities) : null;
  const filtered = entitySet ? ENTITIES.filter((e) => entitySet.has(e.configKey)) : ENTITIES;

  for (const { configKey, name } of filtered) {
    const entityConfig = CONFIGS[configKey];
    if (!entityConfig) continue;

    const fields = entityConfig.fields;
    if (!fields || fields.length === 0) continue;

    parts.push(`\n## ${name} 可用字段`);
    parts.push(`\n| 字段名 | 标签 | 类型 | 说明 |`);
    parts.push(`|--------|------|------|------|`);

    for (const field of fields) {
      const label = field.label || "";
      const type = field.type || "";

      const descParts: string[] = [];
      if (field.options && field.options.length > 0) {
        const values = field.options.map((o) => o.value).join(" / ");
        descParts.push(`可选值: ${values}`);
      }
      if (field.max) descParts.push(`最多选 ${field.max} 项`);
      if (field.placeholder) descParts.push(`${field.placeholder}`);
      if (field.subFields) {
        const subLabels = field.subFields.map((s) => s.placeholder || "").filter(Boolean);
        if (subLabels.length) descParts.push(`子字段: [${subLabels.join(", ")}]`);
      }
      const desc = descParts.join("；");

      parts.push(`| \`${field.key}\` | ${label} | ${type} | ${desc} |`);
    }
    parts.push("");

    buildFieldTypeExample(parts, fields);
  }

  buildRelationsParamsTemplate(parts, novelId);

  return parts.join("\n");
}

// ── 类型 → 示例值 查找表 ──

type ExEntry = { key: string; subFields?: string[] };

const TYPE_SAMPLES: Record<string, (ex: ExEntry) => [string, string]> = {
  text: () => [`"示例文本"`, `// text：普通字符串`],
  longtext: () => [`"较长文本..."`, `// longtext：长文本字符串`],
  single: () => [`"选项值"`, `// single：从上方可选值中选择一个`],
  multi: () => [`["选项1", "选项2"]`, `// multi：从上方可选值中选择多项，JSON数组`],
  tags: () => [`["标签1", "标签2"]`, `// tags：自由标签，JSON数组`],
  list: (ex) => {
    if (ex.subFields?.length) {
      const joined = ex.subFields.join(";");
      return [`["${joined}", "${joined}"]`, `// list：数组，每项内部用分号分隔子字段`];
    }
    return [`["项1", "项2"]`, `// list：字符串数组`];
  },
};

/** 根据字段类型生成一个填充示例，展示各类型在 params 中的格式 */
function buildFieldTypeExample(parts: string[], fields: ConfigFieldDef[]): void {
  const EXAMPLE_TYPE_ORDER = ["text", "longtext", "single", "multi", "tags", "list"];
  const typeFields: Record<string, ExEntry> = {};
  for (const field of fields) {
    const t = field.type || "";
    typeFields[t] ??= {
      key: field.key,
      subFields: field.subFields?.map((s) => s.placeholder || "").filter(Boolean),
    };
  }

  const lines: string[] = [];
  for (const type of EXAMPLE_TYPE_ORDER) {
    const ex = typeFields[type];
    const fn = TYPE_SAMPLES[type];
    if (!ex || !fn) continue;
    const [val, comment] = fn(ex);
    lines.push(`  "${ex.key}": ${val}, ${comment}`);
  }

  parts.push(`### 字段类型示例`);
  parts.push(`\n\`\`\`json`);
  parts.push(`{`);
  for (const line of lines) parts.push(line);
  parts.push(`}`);
  parts.push(`\`\`\``);
  parts.push("");
}

/** 关系 API 的 operations 模板（仅支持新增） */
function buildRelationsParamsTemplate(parts: string[], novelId: string): void {
  parts.push(RELATIONS_PARAMS_TEMPLATE.replace("{{novelId}}", novelId));
}
