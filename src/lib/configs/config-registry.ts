import { CONFIGS, ConfigEntity } from "./generated";
export { ConfigEntity } from "./generated";
import type { EntityConfigMap } from "./generated";
import { buildDefaultValues, fillConfigFrom, flattenFields } from "./config-utils";
import type { ConfigFieldDef, ConfigSection, ConfigData } from "./config-utils";

// ── 注册表 ──

/** 实体配置缓存项 */
interface ConfigEntry<T> {
  fields: ConfigFieldDef[];
  sections: ConfigSection[];
  defaults: T;
}

const registry = new Map<ConfigEntity, ConfigEntry<ConfigData>>();

function buildEntry(key: ConfigEntity): ConfigEntry<ConfigData> {
  const config = CONFIGS[key];
  if (!config) throw new Error(`Unknown config entity: "${String(key)}"`);
  return {
    fields: config.fields,
    sections: config.sections,
    defaults: buildDefaultValues(config.fields),
  };
}


/** 获取实体完整配置（字段定义 + sections + 默认值） */
export function getEntry<K extends ConfigEntity>(key: K): ConfigEntry<EntityConfigMap[K]> {
  return (registry.get(key) ?? buildEntry(key)) as ConfigEntry<EntityConfigMap[K]>
}

/** 获取实体默认配置值 */
export function getDefaults<K extends ConfigEntity>(key: K): EntityConfigMap[K] {
  return getEntry(key).defaults;
}

/** 获取实体字段定义 */
export function getFields(key: ConfigEntity): ConfigFieldDef[] {
  return getEntry(key).fields;
}

/** 获取实体 sections */
export function getSections(key: ConfigEntity): ConfigSection[] {
  return getEntry(key).sections;
}

/** 将外部数据填充到默认值上，只保留合法字段 */
export function fillConfig<K extends ConfigEntity>(key: K, data: ConfigData): EntityConfigMap[K] {
  const { fields, defaults } = getEntry(key);
  return fillConfigFrom(data, defaults as ConfigData, fields) as EntityConfigMap[K];
}

// ── AI 指令生成 ──

import type { PolishRuleConfig } from "./generated";

/** 根据润色规则配置构建 AI 可读的指令文本 */
export function buildConfigInstructions(config: PolishRuleConfig): string {
  const lines: string[] = [];

  const sampleFields = getEntry(ConfigEntity.POLISH_SAMPLE).fields;
  const sampleKeySet = new Set(sampleFields.map((f) => f.key));

  for (const field of flattenFields(getEntry(ConfigEntity.POLISH_RULE).sections)) {
    if (sampleKeySet.has(field.key)) continue;

    const value = (config as ConfigData)[field.key];
    if (field.type === "toggle") {
      if (value) lines.push(`${field.label}：开启`);
    } else if (field.type === "single" && value) {
      lines.push(`${field.label}：${value}`);
    } else if (field.type === "multi") {
      const arr = value as string[] | undefined;
      if (arr && arr.length > 0) {
        const descMap: Record<string, string> = {};
        for (const o of field.options || []) {
          if ("description" in o && (o as any).description) {
            descMap[o.value] = (o as any).description!;
          }
        }
        const parts = arr.map((l) => descMap[l] || l);
        lines.push(`${field.label}：${parts.join("；")}`);
      }
    }
  }

  if (config.prompt) lines.push(`自定义说明：${config.prompt}`);
  return lines.join("\n");
}
