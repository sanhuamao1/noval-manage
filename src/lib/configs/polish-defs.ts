import { buildDefaultValues, flattenFields, type ConfigOf, type ConfigSection } from "@/lib/configs/config-utils";

// ─── 风格样本 配置定义 ──
// 样本数据存储在 PolishRule.config JSON 中
export interface SampleConfig {
  scene_type: string  // 场景类型：战斗/对话/环境/心理
  text: string        // 样本正文（≤600字）
  is_negative: boolean // 是否为反例
}

export const SCENE_TYPE_OPTIONS = [
  { value: "战斗" },
  { value: "对话" },
  { value: "环境" },
  { value: "心理" },
  { value: "其他" },
] as const

export const SAMPLE_CONFIG_SECTIONS: ConfigSection[] = [
  {
    type: "card",
    title: "样本内容",
    class: "space-y-3",
    children: [
      {
        key: "scene_type",
        label: "场景类型",
        type: "single",
        options: SCENE_TYPE_OPTIONS as any,
        display: "flex",
      },
      {
        key: "text",
        label: "样本正文",
        type: "longtext",
        maxLength: 600,
        placeholder: "粘贴样本正文（不超过 600 字）...",
      },
      {
        key: "is_negative",
        label: "设为反例（请避免的风格）",
        type: "toggle",
        display: "between",
      },
    ],
  },
]

export const SAMPLE_CONFIG_FIELDS = flattenFields(SAMPLE_CONFIG_SECTIONS)
export const DEFAULT_SAMPLE_CONFIG = buildDefaultValues(SAMPLE_CONFIG_FIELDS) as unknown as SampleConfig & { prompt?: string }

// ─── 润色规则 配置定义（原有） ──

export const CONFIG_SECTIONS: ConfigSection[] = [
    {
        type: "grid",
        cols: 2,
        sections: [
            {
                title: "界限",
                type: "card",
                class: "space-y-4",

                children: [
                    {
                        key: "pace",
                        label: "节奏",
                        type: "single",
                        options: [{ value: "快" }, { value: "中" }, { value: "慢" }],
                        display: "flex",
                    },
                    {
                        key: "mood",
                        label: "情绪 / 氛围",
                        type: "multi",
                        max: 2,
                        options: [
                            { value: "紧张" },
                            { value: "压抑" },
                            { value: "温馨" },
                            { value: "荒诞" },
                            { value: "沉重" },
                            { value: "轻松" },
                            { value: "悬疑" },
                            { value: "悲怆" },
                        ],
                        display: "flex"
                    },
                    {
                        key: "narrative",
                        label: "叙事手法",
                        type: "single",
                        options: [{ value: "展示" }, { value: "告知" }, { value: "混合" }],
                        display: "flex",
                    },
                ],
            },
            {
                title: "侧重点",
                type: "card",
                class: "space-y-4",
                children: [
                    {
                        key: "senses",
                        label: "五感",
                        type: "multi",
                        options: [
                            { value: "视觉" },
                            { value: "听觉" },
                            { value: "嗅觉" },
                            { value: "味觉" },
                            { value: "触觉" },
                        ],
                        display: "flex",
                    },
                    {
                        key: "character",
                        label: "人物描写",
                        type: "multi",
                        options: [
                            { value: "神态/微表情" },
                            { value: "动作/小动作" },
                            { value: "心理/内心独白" },
                            { value: "语言/语气" },
                        ],
                        display: "flex",
                    },
                    {
                        key: "environment",
                        label: "环境描写",
                        type: "multi",
                        options: [
                            {
                                value: "空间/陈设",
                                description: "精细化描写空间布局和物品陈设，烘托场景氛围",
                            },
                            { value: "光影/天气", description: "强化光影变化与天气对氛围的烘托作用" },
                            {
                                value: "气味/声音",
                                description: "利用环境中的气味与环境音增强场景真实感",
                            },
                        ],
                        display: "flex",
                    },
                ],
            },
        ],
    },
    {
        title: "高级设置",
        type: "tabs",
        children: [
            {
                key: "rhetoric",
                label: "修辞",
                type: "single",
                noLabel: true,
                options: [
                    { value: "可多用比喻/拟人" },
                    { value: "偏白描/克制" },
                    { value: "适度排比" },
                ],
                display: "flex",
            },
            {
                key: "timeVariation",
                label: "时间感与节奏变奏",
                type: "toggle",
                display: "between",
            },
            {
                key: "contrastInsertion",
                label: "对比/反差插入",
                type: "toggle",
                display: "between",
            },
        ],
    },
];

// ─── 推导 ───

// 兼容旧代码：CONFIG_FIELDS 是 CONFIG_SECTIONS 中所有字段的扁平数组
export const CONFIG_FIELDS = flattenFields(CONFIG_SECTIONS);

// 字段数组（用于类型推导）
const _allPolishFields = flattenFields(CONFIG_SECTIONS);
export type PolishConfig = ConfigOf<typeof _allPolishFields> & { prompt?: string };

export const DEFAULT_POLISH_CONFIG = buildDefaultValues(_allPolishFields);

// ─── 工具函数 ───

/** 从 config 生成 AI 指令 */
export function buildConfigInstructions(config: PolishConfig): string {
    const lines: string[] = [];
    for (const field of flattenFields(CONFIG_SECTIONS)) {
        const value = config[field.key as keyof typeof config];
        if (field.type === "toggle") {
            if (value) lines.push(`${field.label}：开启`);
        } else if (field.type === "single") {
            if (value) lines.push(`${field.label}：${value}`);
        } else if (field.type === "multi") {
            const arr = value as string[];
            if (arr.length > 0) {
                const descMap = Object.fromEntries(
                    (field.options || [])
                        .filter((o) => "description" in o)
                        .map((o) => [o.value, (o as any).description!]),
                );
                const parts = arr.map((l) => descMap[l] || l);
                lines.push(`${field.label}：${parts.join("；")}`);
            }
        }
    }
    if (config.prompt) lines.push(`自定义说明：${config.prompt}`);
    return lines.join("\n");
}