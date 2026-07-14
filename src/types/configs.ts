import type { ColorName } from "@/lib/colors";

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
}

/** 字段控件类型 */
export type FieldType = "single" | "multi" | "toggle" | "list" | "text" | "longtext" | "tagselect";

export interface ConfigFieldDef<K extends string = string> {
  key: K;
  label: string;
  type: FieldType;
  options?: ConfigOption[];
  max?: number;
  display?: "default" | "flex" | "grid" | "between";
  /** display="grid" 时的列数，默认 3 */
  cols?: number;
  /** 字段图标（lucide 组件名），在 tabs 中显示在 tab trigger 上 */
  icon?: string;
  /** type="text"/"longtext" 时输入框的占位文本 */
  placeholder?: string;
  /** type="longtext" 时的文本最大长度 */
  maxLength?: number;
  /** type="list" 时的子字段定义 */
  subFields?: ListSubField[];
  /** 自定义 Tailwind 类名，会附加到 FormItem 的外层 div 上 */
  className?: string;
  /** 不显示 label，优先级高于 renderField 的 noLabel 参数 */
  noLabel?: boolean;
  /** 控件变体，如 "box"（multi/single 类型适用） */
  variant?: string;
  /** type="tagselect" 时对应的实体 key，选项从 store 动态获取 */
  entity?: string;
  /** type="tagselect" 时，选项对象中用作 value 的 key，默认 "id" */
  optionValue?: string;
  /** type="tagselect" 时，选项对象中用作 label 的 key，默认 "name" */
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
  class?: string;
  children: (ConfigFieldDef | TabGroup)[];
  /** 在 grid 布局中跨越的列数，默认 1 */
  colspan?: number;
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
  /** 在 grid 布局中跨越的列数，默认 1 */
  colspan?: number;
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
}

/** 从字段定义数组推导配置对象类型 */
export type ConfigOf<T extends readonly { key: string; type: FieldType }[]> = {
  [K in T[number] as K["key"]]: TypeValueMap[K["type"]];
};
