import {
  buildDefaultValues,
  flattenFields,
  type ConfigOf,
  type ConfigOption,
  type ConfigSection,
} from "@/lib/configs/config-utils";
import { PRESET_STYLES } from "@/lib/configs/preset-styles";

// ─── 预设文风选项 ──

const presetStyleOptions: ConfigOption[] = PRESET_STYLES.map((s) => ({
  value: s.name,
  icon: s.icon,
  description: s.description,
}));

// ─── 题材选项（icon 为 lucide 组件名，color 可选） ──

const genreOptions = [
  { value: "玄幻", icon: "Sparkles" },
  { value: "仙侠", icon: "BookMarked" },
  { value: "科幻", icon: "Rocket" },
  { value: "都市", icon: "Building2" },
  { value: "言情", icon: "Heart" },
  { value: "历史", icon: "Book" },
  { value: "悬疑", icon: "Search" },
  { value: "奇幻", icon: "Wand2" },
  { value: "武侠", icon: "Sword" },
  { value: "军事", icon: "Shield" },
  { value: "游戏", icon: "Gamepad2" },
  { value: "现实", icon: "Globe" },
];

// ─── 状态选项（带 color 和 icon） ──

const statusOptions: ConfigOption[] = [
  { value: "连载中", icon: "Zap", color: "primary" },
  { value: "已完结", icon: "CircleCheck", color: "success" },
  { value: "暂停", icon: "Clock", color: "warn" },
];

// ─── 基调选项 ──

const toneOptions: ConfigOption[] = [
  {
    value: "沉郁黑暗",
    icon: "Moon",
    description: "压抑、阴郁、道德灰色，适合末世/克苏鲁/暗黑奇幻",
  },
  {
    value: "轻松幽默",
    icon: "Laugh",
    description: "调侃、戏谑、反差萌，适合都市/轻小说/吐槽向",
  },
  {
    value: "悬疑紧张",
    icon: "SearchX",
    description: "节奏紧、伏笔多、信息差，适合推理/惊悚/谍战",
  },
  {
    value: "史诗宏大",
    icon: "Crown",
    description: "苍凉、厚重、格局感，适合史诗奇幻/历史/战争",
  },
  {
    value: "温馨治愈",
    icon: "Sun",
    description: "温暖、治愈、日常感，适合治愈/日常/言情甜文",
  },
  {
    value: "热血激昂",
    icon: "Flame",
    description: "高燃、爆发、爽感，适合玄幻/竞技/少年漫",
  },
  {
    value: "哀伤悲剧",
    icon: "HeartBroken",
    description: "宿命感、悲剧美学，适合虐文/古风悲剧",
  },
  {
    value: "荒诞戏谑",
    icon: "CircleDot",
    description: "黑色幽默、解构、反套路，适合后现代/讽刺",
  },
  {
    value: "唯美浪漫",
    icon: "Heart",
    description: "唯美、抒情、氛围感，适合言情/古风/青春",
  },
  {
    value: "冷峻克制",
    icon: "Scissors",
    description: "零度叙事、白描、克制，适合严肃文学/悬疑",
  },
  {
    value: "诡谲神秘",
    icon: "Ghost",
    description: "诡异、神秘、不安感，适合克苏鲁/民俗恐怖",
  },
  {
    value: "诙谐反讽",
    icon: "Face",
    description: "讽刺、调侃、社会批判，适合讽刺小说/王朔体",
  },
];

const worldTypeOptions: ConfigOption[] = [
  { value: "架空修仙", icon: "Sparkles", description: "灵气/功法/境界/宗门" },
  { value: "都市现实", icon: "Building2", description: "现代都市背景" },
  { value: "星际科幻", icon: "Rocket", description: "太空/星际/科技" },
  { value: "西幻魔法", icon: "Wand2", description: "魔法/种族/神祇" },
  { value: "末日废土", icon: "Skull", description: "灾难后/生存" },
  { value: "历史架空", icon: "Book", description: "真实历史+虚构" },
  { value: "赛博朋克", icon: "Cpu", description: "高科技低生活" },
  { value: "东方玄幻", icon: "Dragon", description: "洪荒/神话/山海经" },
];

// ─── 配置定义（单一数据源） ──

export const NOVEL_CONFIG_SECTIONS: ConfigSection[] = [
  {
    title: "作品设定",
    type: "tabs",
    children: [
      {
        key: "preset_style",
        label: "预设文风",
        type: "tab-group",
        class: "space-y-2",
        children: [
          {
            key: "enable_preset",
            label: "启用预设文风",
            type: "toggle",
            display: "between",
          },
          {
            key: "preset_style",
            label: "预设文风",
            type: "single",
            options: presetStyleOptions,
            icon: "BookMarked",
            display: "flex",
            noLabel: true,
            className: "grid grid-cols-3 gap-2",
          },
        ],
      },
      {
        key: "primary_tone",
        label: "主基调",
        type: "single",
        options: toneOptions,
        display: "flex",
        icon: "Palette",
        noLabel: true,
        className: "grid grid-cols-4 gap-2",
      },
      {
        key: "secondary_tones",
        label: "副基调",
        type: "multi",
        options: toneOptions,
        max: 2,
        display: "flex",
        noLabel: true,
        icon: "Layers",
        className: "grid grid-cols-4 gap-2",
      },
      {
        key: "status",
        label: "状态",
        type: "single",
        options: statusOptions,
        icon: "Activity",
        className: "grid grid-cols-3 gap-1",
      },
    ],
  },
  {
    title: "世界观",
    type: "tabs",
    children: [
      {
        key: "genre",
        label: "题材",
        type: "multi",
        max: 2,
        options: genreOptions,
        display: "flex",
        variant: "box",
        noLabel: true,
        className: "gap-2",
      },
      {
        key: "world",
        label: "世界",
        type: "tab-group",
        class: "grid grid-cols-2 gap-2",
        children: [
          {
            key: "world_type",
            label: "世界类型",
            type: "single",
            options: worldTypeOptions,
            className: "grid grid-cols-2 gap-2",
          },
          {
            key: "world_shape",
            label: "世界形态",
            type: "single",
            options: [
              { value: "大陆", icon: "Map" },
              { value: "群岛", icon: "Waves" },
              { value: "星球", icon: "Globe" },
              { value: "星系", icon: "Orbit" },
              { value: "多重位面", icon: "Layers" },
            ],
            className: "grid grid-cols-2 gap-2",
          },
        ],
      },
    ],
  },
];

// ─── 推导 ───

// 字段数组（用于类型推导）
const _allNovelFields = flattenFields(NOVEL_CONFIG_SECTIONS);
export type NovelConfig = ConfigOf<typeof _allNovelFields> & { prompt?: string };

export const DEFAULT_NOVEL_CONFIG = buildDefaultValues(_allNovelFields);

// ─── 工具函数 ───

/** 根据 value 在 NOVEL_CONFIG_SECTIONS 中查找 ConfigOption */
export function findOption(value: string): ConfigOption | undefined {
  for (const field of flattenFields(NOVEL_CONFIG_SECTIONS)) {
    const opt = field.options?.find((o: ConfigOption) => o.value === value);
    if (opt) return opt;
  }
  return undefined;
}
