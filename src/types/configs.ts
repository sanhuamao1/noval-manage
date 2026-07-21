import type { ColorName } from "@/lib/colors";

export type FormItemInnerDispaly = "flex" | "grid-2" | "grid-3" | "grid-4" | "grid-5"
export type FormItemDisplay = "row" | "col" | "inline"

/** 配置项颜色，等价于 ColorName */
export type OptionColor = ColorName;

export interface ConfigOption {
  value: string;
  /** 显示标签（可选，默认显示 value） */
  label?: string;
  /** Lucide icon 名称（可选） */
  icon?: string;
  /** 选项颜色（可选） */
  color?: OptionColor;
  /** 选项说明文案（可选） */
  description?: string;
}

export interface ListSubField {
  /** 输入框占位文本 */
  placeholder: string;
  /** Tailwind 宽度类，如 "w-1/3"、"flex-1"（可选，默认 "flex-1"） */
  width?: string;
  /** 子字段控件类型（可选，默认 "text"） */
  type?: "text" | "select";
  /** type="select" 时，引用的字段 key，选项从该字段的 list 值中提取（与 entity 互斥） */
  optionsFrom?: string;
  /** type="select" 时，引用的实体 key，选项从全局 store 中获取（如 "characters"、"organizations"，与 optionsFrom 互斥） */
  entity?: string;
}

/** 字段控件类型 */
export type FieldType = "single" | "multi" | "toggle" | "list" | "text" | "longtext" | "tagselect" | "tags";

export interface ConfigFieldDef<K extends string = string> {
  key: K;
  label: string;
  type: FieldType;
  noLabel?: boolean;

  // formitem 相关
  display?: FormItemDisplay;
  innerDisplay?: FormItemInnerDispaly;
  mergeCells?: boolean;

  icon?: string;

  // text
  placeholder?: string;

  // single / multi
  options?: ConfigOption[];
  max?: number;
  variant?: string;

  // longtext
  maxLength?: number;
  // list
  subFields?: ListSubField[];

  // tagselect
  entity?: string;
  optionValue?: string;
  optionLabel?: string;

  /** 字段默认值，优先级高于根据 type 自动推导的默认值 */
  defaultValue?: unknown;
}

export interface TabGroup<K extends string = string> {
  key: K;
  label: string;
  icon?: string;
  type: "tab-group";
  children: ConfigFieldDef[];
  /** 该 tab 内容区域的自定义 Tailwind 类名 */
  class?: string;
}

export interface SectionBase {
  title: string;
  icon?: string;
  class?: string; // 内容自定义样式
  children: (ConfigFieldDef | TabGroup)[];
  /** 从 config 中取值的 key，用于动态标题（如使用角色姓名作为卡片标题） */
  titleKey?: string;
  /** 标题是否可编辑（需配合 titleKey 使用） */
  titleEditable?: boolean;
}

export interface CardSection extends SectionBase {
  type: "card";
}

export interface TabsSection extends SectionBase {
  type: "tabs";
}

export interface GridSection {
  type: "grid";
  cols: number;
  class?: string;
  sections: ConfigSection[];
}

export type ConfigSection = CardSection | TabsSection | GridSection;

// ─── 类型推导 ───

/** 字段类型 → 值类型 映射表 */
interface TypeValueMap {
  toggle: boolean;
  multi: string[];
  single: string | undefined;
  list: string[];
  text: string | undefined;
  longtext: string | undefined;
  tagselect: string[];
  tags: string[];
}

/** 从字段定义数组推导配置对象类型 */
export type ConfigOf<T extends readonly { key: string; type: FieldType }[]> = {
  [K in T[number] as K["key"]]: TypeValueMap[K["type"]];
};
