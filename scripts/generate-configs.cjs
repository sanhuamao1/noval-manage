// scripts/generate-configs.cjs
// 构建时执行：读取 configs/*.yml → 生成 src/types/entity.ts, src/types/entityConfig.ts, src/lib/configs/generated.ts
// 避免客户端 bundling 时遇到 fs/yaml 等 Node.js 模块

const { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } = require("fs");
const { resolve, dirname, basename } = require("path");
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
    innerDisplay: def.innerDisplay,
    mergeCells: def.mergeCells,
    icon: def.icon,
    noLabel: def.noLabel,
    variant: def.variant,
    cols: def.cols,
    subFields: def.subFields,
    entity: def.entity,
    optionValue: def.optionValue,
    optionLabel: def.optionLabel,
    defaultValue: def.defaultValue,
  };
  // 过滤掉 undefined 值，保持 generated 文件干净
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

const entities = ["novel", "character", "outline", "polish-rule", "polish-sample", "organization", "location"];
const configs = {};
for (const name of entities) {
  configs[name] = loadEntityConfig(name);
}

// ── 辅助 ──

/** "polish-rule" → "POLISH_RULE" */
function toScreamingSnake(kebab) {
  return kebab.replace(/-/g, "_").toUpperCase();
}

// ── 生成 src/types/entity.ts ──

function generateEntityFile() {
  let code = `// 自动生成于 ${new Date().toISOString()}，勿手动编辑
// 由 scripts/generate-configs.cjs 从 configs/*.yml 生成

export * from "./configs";

import type { ConfigSection, ConfigFieldDef } from "./configs";

export interface EntityConfig {
  entity: string;
  sections: ConfigSection[];
  fields: ConfigFieldDef[];
}

`;

  // ConfigEntity enum
  code += `/** 配置实体枚举（与 YAML 实体列表同源，由构建脚本自动生成） */\n`;
  code += `export enum ConfigEntity {\n`;
  code += entities.map(name => `  ${toScreamingSnake(name)} = "${name}"`).join(",\n");
  code += `\n}\n`;

  return code;
}

// ── 写出文件 ──

const configsJson = JSON.stringify(configs, null, 2);

// 生成 entity.ts
const entityContent = generateEntityFile();
const entityOutPath = resolve(ROOT, "src/types/entity.ts");
writeFileSync(entityOutPath, entityContent, "utf-8");
console.log(`Generated ${entityOutPath}`);

// 生成 generated.ts
const generatedContent = `${"// "}自动生成于 ${new Date().toISOString()}，勿手动编辑
// 由 scripts/generate-configs.cjs 从 configs/*.yml 生成

import { ConfigEntity, EntityConfig } from "@/types/entity";

export const CONFIGS: Record<ConfigEntity, EntityConfig> = ${configsJson};
`;

const generatedOutPath = resolve(ROOT, "src/lib/configs/generated.ts");
const generatedOutDir = dirname(generatedOutPath);
if (!existsSync(generatedOutDir)) mkdirSync(generatedOutDir, { recursive: true });
writeFileSync(generatedOutPath, generatedContent, "utf-8");
console.log(`Generated ${generatedOutPath} (${Object.keys(configs).length} entities)`);
