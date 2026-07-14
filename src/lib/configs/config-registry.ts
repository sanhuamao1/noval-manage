import { CONFIGS } from "./generated";
import { ConfigEntity } from "@/types";
export { ConfigEntity } from "@/types";
import type { EntityConfigMap } from "@/types";
import { buildDefaultValues } from "./config-utils";
import type { ConfigFieldDef, ConfigSection } from "@/types";

// ── 注册表 ──

/** 实体配置缓存项 */
interface ConfigEntry<T> {
  fields: ConfigFieldDef[];
  fieldsMap: Record<string, ConfigFieldDef>;
  sections: ConfigSection[];
  defaults: T;
}

const registry = new Map<ConfigEntity, ConfigEntry<any>>();

function buildEntry<K extends ConfigEntity>(key: K): ConfigEntry<EntityConfigMap[K]> {
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
export function getEntry<K extends ConfigEntity>(key: K): ConfigEntry<EntityConfigMap[K]> {
  if (!registry.has(key)) registry.set(key, buildEntry(key));
  return registry.get(key)!;
}

// ── AI 指令生成 ──

/** 根据润色规则配置构建 AI 可读的指令文本 */
export function buildConfigInstructions(
  config: Record<string, unknown>,
  fields: ConfigFieldDef[],
): string {
  const lines: string[] = [];

  for (const field of fields) {
    const value = config[field.key];
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

  return lines.join("\n");
}
