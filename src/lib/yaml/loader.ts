import { readFileSync } from "fs";
import { resolve } from "path";
import yaml from "js-yaml";
import type {
  ConfigFieldDef,
  ConfigOption,
  ConfigSection,
  TabGroup,
} from "@/types";

// ── YAML 结构定义 ──

interface YamlFieldDef {
  type: string;
  label: string;
  placeholder?: string;
  maxLength?: number;
  options?: string | ConfigOption[];
  max?: number;
  display?: "default" | "flex" | "grid" | "between";
  icon?: string;
  noLabel?: boolean;
  variant?: string;
  className?: string;
  class?: string;
  cols?: number;
  storeKey?: string;
  subFields?: { placeholder: string; width?: string }[];
  titleKey?: string;
  titleEditable?: boolean;
}

interface YamlTabChild {
  key: string;
  label: string;
  type?: "tab-group";
  class?: string;
  fields?: string[];
}

interface YamlSection {
  type: "card" | "tabs" | "grid";
  title?: string;
  icon?: string;
  class?: string;
  fields?: string[];
  cols?: number;
  colspan?: number;
  sections?: YamlSection[];
  children?: YamlTabChild[];
  titleKey?: string;
  titleEditable?: boolean;
}

interface YamlConfig {
  entity: string;
  fields: Record<string, YamlFieldDef>;
  sections: YamlSection[];
  options?: Record<string, ConfigOption[]>;
}

// ── 共享选项缓存 ──

let _sharedOptions: Record<string, ConfigOption[]> | null = null;
let _presetStyles: Record<string, ConfigOption[]> | null = null;

const CONFIGS_DIR = resolve(process.cwd(), "configs");

function getSharedOptions(): Record<string, ConfigOption[]> {
  if (!_sharedOptions) {
    const raw = readFileSync(resolve(CONFIGS_DIR, "shared-options.yml"), "utf-8");
    _sharedOptions = (yaml.load(raw) as Record<string, ConfigOption[]>) ?? {};
  }
  return _sharedOptions!;
}

function getPresetStyles(): Record<string, ConfigOption[]> {
  if (!_presetStyles) {
    const raw = readFileSync(resolve(CONFIGS_DIR, "preset-styles.yml"), "utf-8");
    const parsed = yaml.load(raw) as { options: Record<string, ConfigOption[]> };
    _presetStyles = parsed.options ?? {};
  }
  return _presetStyles!;
}

/** 解析选项引用：字符串 → 从 shared/preset 查找；数组 → 直接使用 */
function resolveOptions(
  ref: string | ConfigOption[] | undefined,
  ownOptions: Record<string, ConfigOption[]>,
): ConfigOption[] | undefined {
  if (!ref) return undefined;
  if (Array.isArray(ref)) return ref;
  return ownOptions[ref]
    ?? getSharedOptions()[ref]
    ?? getPresetStyles()[ref]
    ?? [];
}

/** 将 YAML 字段定义转为 ConfigFieldDef */
function buildField(
  key: string,
  def: YamlFieldDef,
  ownOptions: Record<string, ConfigOption[]>,
): ConfigFieldDef {
  return {
    key,
    label: def.label,
    type: def.type as ConfigFieldDef["type"],
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
    storeKey: def.storeKey,
    subFields: def.subFields,
  } as ConfigFieldDef;
}

/** 将 YAML sections 转为 ConfigSection[] */
function buildSections(
  nodes: YamlSection[],
  fields: Record<string, YamlFieldDef>,
  ownOptions: Record<string, ConfigOption[]>,
): ConfigSection[] {
  return nodes.map((node) => {
    if (node.type === "grid") {
      return {
        type: "grid",
        cols: node.cols!,
        class: node.class,
        sections: buildSections(node.sections ?? [], fields, ownOptions),
      } as ConfigSection;
    }

    if (node.type === "card") {
      return {
        type: "card",
        title: node.title!,
        icon: node.icon,
        class: node.class,
        titleKey: node.titleKey,
        titleEditable: node.titleEditable,
        children: (node.fields ?? []).map((key) =>
          buildField(key, fields[key], ownOptions),
        ),
      } as ConfigSection;
    }

    // tabs
    return {
      type: "tabs",
      title: node.title!,
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
          } as TabGroup;
        }
        // 非 tab-group 的 tab 子项：直接作为字段
        return childFields[0] ?? { key: child.key, label: child.label, type: "text" };
      }),
    } as ConfigSection;
  });
}

// ── 对外接口 ──

export interface LoadedConfig {
  entity: string;
  sections: ConfigSection[];
  fields: ConfigFieldDef[];
}

const _cache = new Map<string, LoadedConfig>();

/** 加载实体配置 YAML，返回 sections + 扁平字段数组 */
export function loadYamlConfig(entity: string): LoadedConfig {
  if (_cache.has(entity)) return _cache.get(entity)!;

  const raw = readFileSync(resolve(CONFIGS_DIR, `${entity}.yml`), "utf-8");
  const config = yaml.load(raw) as YamlConfig;
  const ownOptions = config.options ?? {};

  const fields: ConfigFieldDef[] = Object.entries(config.fields).map(([key, def]) =>
    buildField(key, def, ownOptions),
  );

  const sections = buildSections(config.sections, config.fields, ownOptions);

  const result: LoadedConfig = { entity: config.entity, sections, fields };
  _cache.set(entity, result);
  return result;
}

/** 从加载的配置中根据 value 查找 ConfigOption */
export function findOptionInConfig(entity: string, value: string): ConfigOption | undefined {
  const { fields } = loadYamlConfig(entity);
  for (const field of fields) {
    const opt = field.options?.find((o) => o.value === value);
    if (opt) return opt;
  }
  return undefined;
}
