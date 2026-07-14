// scripts/generate-configs.cjs
// 构建时执行：读取 configs/*.yml → 生成 src/lib/configs/generated.ts
// 避免客户端 bundling 时遇到 fs/yaml 等 Node.js 模块

const { readFileSync, writeFileSync, mkdirSync, existsSync } = require("fs");
const { resolve, dirname } = require("path");
const yaml = require("js-yaml");

const ROOT = resolve(__dirname, "..");

// ── 共享选项 ──

function readYaml(path) {
  return yaml.load(readFileSync(path, "utf-8"));
}

const sharedOptions = readYaml(resolve(ROOT, "configs/shared-options.yml")) ?? {};
const presetStyles = (readYaml(resolve(ROOT, "configs/preset-styles.yml")))?.options ?? {};

function resolveOptions(ref, ownOptions) {
  if (!ref) return undefined;
  if (Array.isArray(ref)) return ref;
  return ownOptions[ref] ?? sharedOptions[ref] ?? presetStyles[ref] ?? [];
}

function buildField(key, def, ownOptions) {
  const field = {
    key,
    label: def.label ?? "",
    type: def.type,
    placeholder: def.placeholder,
    maxLength: def.maxLength,
    options: resolveOptions(def.options, ownOptions),
    max: def.max,
    display: def.display,
    icon: def.icon,
    noLabel: def.noLabel,
    variant: def.variant,
    className: def.className,
    cols: def.cols,
    subFields: def.subFields,
    entity: def.entity,
    optionValue: def.optionValue,
    optionLabel: def.optionLabel,
    defaultValue: def.defaultValue,
  };
  // 过滤掉 undefined 值，保持 generated.ts 干净
  return Object.fromEntries(
    Object.entries(field).filter(([, v]) => v !== undefined),
  );
}

function buildSections(nodes, fields, ownOptions) {
  return nodes.map((node) => {
    if (node.type === "grid") {
      return {
        type: "grid",
        cols: node.cols,
        colspan: node.colspan,
        class: node.class,
        sections: buildSections(node.sections ?? [], fields, ownOptions),
      };
    }
    if (node.type === "card") {
      return {
        type: "card",
        title: node.title,
        icon: node.icon,
        class: node.class,
        titleKey: node.titleKey,
        titleEditable: node.titleEditable,
        children: (node.fields ?? []).map((key) => buildField(key, fields[key], ownOptions)),
      };
    }
    // tabs
    return {
      type: "tabs",
      title: node.title,
      icon: node.icon,
      class: node.class,
      children: (node.children ?? []).map((child) => {
        const childFields = (child.fields ?? []).map((key) =>
          buildField(key, fields[key], ownOptions),
        );
        if (child.type === "tab-group") {
          return {
            key: child.key,
            label: child.label,
            type: "tab-group",
            class: child.class,
            children: childFields,
          };
        }
        return childFields[0] ?? { key: child.key, label: child.label, type: "text" };
      }),
    };
  });
}

function loadEntityConfig(name) {
  const raw = readYaml(resolve(ROOT, `configs/${name}.yml`));
  const ownOptions = raw.options ?? {};

  const fields = Object.entries(raw.fields).map(([key, def]) =>
    buildField(key, def, ownOptions),
  );

  const sections = buildSections(raw.sections, raw.fields, ownOptions);

  return {
    entity: raw.entity,
    sections,
    fields,
  };
}

// ── 加载所有实体 ──

const entities = ["novel", "character", "outline", "polish-rule", "polish-sample"];
const configs = {};
for (const name of entities) {
  configs[name] = loadEntityConfig(name);
}

// ── 生成 TS 文件 ──

const outPath = resolve(ROOT, "src/lib/configs/generated.ts");

const header = `// 自动生成于 ${new Date().toISOString()}，勿手动编辑
// 由 scripts/generate-configs.cjs 从 configs/*.yml 生成

import type { ConfigSection, ConfigFieldDef } from "./config-utils";

export interface EntityConfig {
  entity: string;
  sections: ConfigSection[];
  fields: ConfigFieldDef[];
}
`;

// ── 类型生成工具 ──

function typeToTsType(type) {
  switch (type) {
    case "toggle": return "boolean";
    case "multi":
    case "list":
    case "tagselect": return "string[]";
    case "single":
    case "text":
    case "longtext": return "string | undefined";
    default: return "string | undefined";
  }
}

/** "polish-rule" → "PolishRule" */
function toPascalCase(kebab) {
  return kebab.split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

/** "polish-rule" → "POLISH_RULE" */
function toScreamingSnake(kebab) {
  return kebab.replace(/-/g, "_").toUpperCase();
}

/** 从实体配置生成 TypeScript 接口 */
function generateConfigTypes() {
  let result = "// ── 配置类型接口（由 YAML 字段定义自动推导）──\n\n";
  for (const [entityName, cfg] of Object.entries(configs)) {
    const typeName = `${toPascalCase(entityName)}Config`;
    result += `/** ${cfg.entity} 配置类型 */\n`;
    result += `export interface ${typeName} {\n`;
    for (const field of cfg.fields) {
      result += `  ${field.key}?: ${typeToTsType(field.type)};\n`;
    }
    result += `}\n\n`;
  }
  // EntityKey → ConfigType 映射表，供 config-registry 做强类型分发
  // Key 引用 ConfigEntity 枚举，避免字符串重复
  result += `/** 实体 Key → 配置类型 映射表 */\n`;
  result += `export interface EntityConfigMap {\n`;
  for (const entityName of entities) {
    const typeName = `${toPascalCase(entityName)}Config`;
    result += `  [ConfigEntity.${toScreamingSnake(entityName)}]: ${typeName};\n`;
  }
  result += `}\n\n`;
  return result;
}

const configsJson = JSON.stringify(configs, null, 2);

const output = `${header}
${generateConfigTypes()}
/** 配置实体枚举（与 YAML 实体列表同源，由构建脚本自动生成） */
export enum ConfigEntity {
${entities.map(name => `  ${toScreamingSnake(name)} = "${name}"`).join(",\n")},
}

export const CONFIGS: Record<ConfigEntity, EntityConfig> = ${configsJson};
`;

const outDir = dirname(outPath);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, output, "utf-8");
console.log(`Generated ${outPath} (${Object.keys(configs).length} entities)`);
