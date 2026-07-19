import { readFileSync } from "fs";
import { resolve } from "path";
import { load } from "js-yaml";

interface FieldMeta {
  type?: string;
  label?: string;
  placeholder?: string;
  options?: string;
  max?: number;
  subFields?: unknown[];
}

interface EntityConfig {
  file: string;
  name: string;
}

const ENTITIES: EntityConfig[] = [
  { file: "character.yml", name: "角色 (Character)" },
  { file: "organization.yml", name: "组织/势力 (Organization)" },
  { file: "location.yml", name: "地点 (Location)" },
];

/** 读取 configs 目录下的字段定义，生成字段表 + 类型示例 */
export function buildFieldSchema(novelId: string): string {
  const configDir = resolve(process.cwd(), "configs");
  const parts: string[] = [];

  parts.push(
    `\n> **重要**：如下是所有实体的可用字段定义。生成的 operations 必须严格使用下面列出的字段名，不要自创字段。\n如果你需要表达一个不在列表中的信息，请在已有字段的 placeholder 方向去发挥，而不是新增字段。`,
  );

  for (const entity of ENTITIES) {
    const path = resolve(configDir, entity.file);
    let raw: Record<string, unknown> = {};
    try {
      raw = load(readFileSync(path, "utf-8")) as Record<string, unknown>;
    } catch {
      continue;
    }

    const fields = raw.fields as Record<string, FieldMeta> | undefined;
    if (!fields) continue;

    parts.push(`\n## ${entity.name} 可用字段`);
    parts.push(`\n| 字段名 | 标签 | 类型 | 说明 |`);
    parts.push(`|--------|------|------|------|`);

    for (const [key, meta] of Object.entries(fields)) {
      const label = meta.label || "";
      const type = meta.type || "";

      const descParts: string[] = [];
      if (meta.options) descParts.push(`可选值参考: \`${meta.options}\``);
      if (meta.max) descParts.push(`最多选 ${meta.max} 项`);
      if (meta.placeholder) descParts.push(`${meta.placeholder}`);
      if (meta.subFields) {
        const subLabels = meta.subFields
          .map((s: unknown) => (s as Record<string, string>)?.placeholder || "")
          .filter(Boolean);
        if (subLabels.length) descParts.push(`子字段: [${subLabels.join(", ")}]`);
      }
      const desc = descParts.join("；");

      parts.push(`| \`${key}\` | ${label} | ${type} | ${desc} |`);
    }
    parts.push("");

    // ── 字段类型示例 ──
    buildFieldTypeExample(parts, fields);
  }

  // ── 关系 API 模板 ──
  buildRelationsParamsTemplate(parts, novelId);

  parts.push(...buildSharedOptionsSection(configDir));
  return parts.join("\n");
}

/** 根据字段类型生成一个填充示例，展示各类型在 params 中的格式 */
function buildFieldTypeExample(
  parts: string[],
  fields: Record<string, FieldMeta>,
): void {
  // 每种类型取一个典型字段
  const typeFields: Record<string, { key: string; subFields?: string[] }> = {};
  for (const [key, meta] of Object.entries(fields)) {
    const t = meta.type || "";
    if (!typeFields[t]) {
      typeFields[t] = {
        key,
        subFields: meta.subFields
          ?.map((s: unknown) => (s as Record<string, string>)?.placeholder || "")
          .filter(Boolean),
      };
    }
  }

  const f = "```";
  parts.push(`### 字段类型示例`);
  parts.push(`\nparams 中字段值格式：`);
  parts.push(`\n${f}json`);
  parts.push(`{`);

  const order = ["text", "longtext", "single", "multi", "tags", "list"];
  for (const type of order) {
    const ex = typeFields[type];
    if (!ex) continue;

    let val: string;
    let comment: string;

    switch (type) {
      case "text":
        val = `"示例文本"`;
        comment = `// text：普通字符串`;
        break;
      case "longtext":
        val = `"较长文本..."`;
        comment = `// longtext：长文本字符串`;
        break;
      case "single":
        val = `"选项值"`;
        comment = `// single：从上方可选值中选择一个`;
        break;
      case "multi":
        val = `["选项1", "选项2"]`;
        comment = `// multi：从上方可选值中选择多项，JSON数组`;
        break;
      case "tags":
        val = `["标签1", "标签2"]`;
        comment = `// tags：自由标签，JSON数组`;
        break;
      case "list":
        if (ex.subFields && ex.subFields.length > 0) {
          const joined = ex.subFields.join(";");
          val = `["${joined}", "${joined}"]`;
          comment = `// list：数组，每项内部用分号分隔子字段`;
        } else {
          val = `["项1", "项2"]`;
          comment = `// list：字符串数组`;
        }
        break;
      default:
        continue;
    }

    parts.push(`  "${ex.key}": ${val}, ${comment}`);
  }

  parts.push(`}`);
  parts.push(f);
  parts.push("");
}

/** 关系 API 的 operations 模板（仅支持新增） */
function buildRelationsParamsTemplate(parts: string[], novelId: string): void {
  parts.push(`\n## 关系 操作参数模板`);
  parts.push(`\nAPI 路径：\`/api/relations/link\`（仅支持新增单条关系）`);
  parts.push(`\n关系的 source 和 target 必须使用上文实体标题括号内的 id，不能编造`);

  const f = "```";
  parts.push(`\n**新增关系 (changeType: "add", method: "POST")**`);
  parts.push(`${f}json`);
  parts.push(`{`);
  parts.push(`  "changeType": "add",`);
  parts.push(`  "reason": "说明为什么需要建立这个关系",`);
  parts.push(`  "summary": "一句话描述关系内容",`);
  parts.push(`  "api": "/api/relations/link",`);
  parts.push(`  "method": "POST",`);
  parts.push(`  "params": {`);
  parts.push(`    "novelId": "${novelId}",`);
  parts.push(`    "link": {`);
  parts.push(`      "source": "源实体id",`);
  parts.push(`      "target": "目标实体id",`);
  parts.push(`      "description": "关系描述"`);
  parts.push(`    }`);
  parts.push(`  }`);
  parts.push(`}`);
  parts.push(f);
}

function buildSharedOptionsSection(configDir: string): string[] {
  const parts: string[] = [];
  const sharedPath = resolve(configDir, "shared-options.yml");

  const optionRefs: Record<string, string> = {
    gender: "性别选项",
    role: "角色类型选项",
    "emotion-expression": "情感表达方式选项",
    "narrative-function": "叙事功能原型选项",
    "inner-motivation": "内在动机原型选项",
    "org-type": "组织类型选项",
    "org-status": "组织状态选项",
    "location-type": "地点类型选项",
  };

  try {
    const shared = load(readFileSync(sharedPath, "utf-8")) as Record<string, unknown>;
    parts.push(`\n## 字段可选值参考（shared-options）`);
    for (const [key, label] of Object.entries(optionRefs)) {
      const values = shared[key];
      if (Array.isArray(values)) {
        parts.push(
          `- **${key}**（${label}）：${values.map((v: Record<string, unknown>) => v.value || v).join(" / ")}`,
        );
      }
    }
  } catch {
    // ignore
  }
  return parts;
}