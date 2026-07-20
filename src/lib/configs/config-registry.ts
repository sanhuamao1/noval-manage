import { CONFIGS } from "./generated";
import { ConfigEntity } from "@/types";
export { ConfigEntity } from "@/types";
import { buildDefaultValues } from "./config-utils";
import type { ConfigFieldDef, ConfigSection } from "@/types";

// ── 注册表 ──

/** 实体配置缓存项 */
interface ConfigEntry {
  fields: ConfigFieldDef[];
  fieldsMap: Record<string, ConfigFieldDef>;
  sections: ConfigSection[];
  defaults: Record<string, unknown>;
}

const registry = new Map<ConfigEntity, ConfigEntry>();

function buildEntry(key: ConfigEntity): ConfigEntry {
  const config = CONFIGS[key];
  if (!config) throw new Error(`Unknown config entity: "${String(key)}"`);
  return {
    fields: config.fields,
    fieldsMap: config.fields.reduce((acc: Record<string, ConfigFieldDef>, field) => {
      acc[field.key] = field;
      return acc;
    }, {}),
    sections: config.sections,
    defaults: buildDefaultValues(config.fields),
  };
}

/** 获取实体完整配置（字段定义 + sections + 默认值） */
export function getEntry(key: ConfigEntity): ConfigEntry {
  if (!registry.has(key)) registry.set(key, buildEntry(key));
  return registry.get(key)!;
}

// ── AI 指令生成 ──

type LineFormatter = (label: string, value: unknown, field: ConfigFieldDef) => string | null;

const LINE_FORMATTERS: Record<string, LineFormatter> = {
  toggle: (label, value) => (value ? `- ${label}：开启` : null),
  multi:  (label, value, field) => {
    const arr = value as string[] | undefined;
    if (!arr?.length) return null;
    const descMap: Record<string, string> = {};
    for (const o of field.options || []) {
      if ((o as any).description) descMap[o.value] = (o as any).description;
    }
    return `- ${label}：${arr.map((l) => descMap[l] || l).join("；")}`;
  },
  longtext: (label, value) =>
    value ? `- ${label}：${String(value).replace(/\n/g, "")}` : null,
  default: (label, value) => (value ? `- ${label}：${value}` : null),
};

/** 根据润色规则配置构建 AI 可读的指令文本 */
export function buildConfigInstructions(
  config: Record<string, unknown>,
  fields: ConfigFieldDef[],
): string {
  return fields
    .map((field) => {
      const fmt = LINE_FORMATTERS[field.type] ?? LINE_FORMATTERS.default;
      return fmt(field.label, config[field.key], field);
    })
    .filter(Boolean)
    .join("\n");
}
