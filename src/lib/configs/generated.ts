// 自动生成于 2026-07-12T15:12:24.273Z，勿手动编辑
// 由 scripts/generate-configs.cjs 从 configs/*.yml 生成

import type { ConfigSection, ConfigFieldDef, ConfigOption } from "./config-utils";

export interface EntityConfig {
  entity: string;
  sections: ConfigSection[];
  fields: ConfigFieldDef[];
}

// ── 配置类型接口（由 YAML 字段定义自动推导）──

/** Novel 配置类型 */
export interface NovelConfig {
  title?: string | undefined;
  description?: string | undefined;
  status?: string | undefined;
  genre?: string[];
  enablePreset?: boolean;
  presetStyle?: string | undefined;
  primaryTone?: string | undefined;
  secondaryTones?: string[];
  worldType?: string | undefined;
  worldShape?: string | undefined;
}

/** Character 配置类型 */
export interface CharacterConfig {
  name?: string | undefined;
  gender?: string | undefined;
  role?: string | undefined;
  age?: string | undefined;
  identity?: string | undefined;
  item?: string | undefined;
  coreConflict?: string | undefined;
  emotionExpression?: string | undefined;
  abilities?: string[];
  growthArcs?: string[];
  relationships?: string[];
  notes?: string[];
  narrativeFunction?: string[];
  innerMotivation?: string[];
}

/** Outline 配置类型 */
export interface OutlineConfig {
  title?: string | undefined;
  contentBrief?: string | undefined;
  contentDetail?: string | undefined;
  status?: string | undefined;
  timeline?: string | undefined;
  tone?: string | undefined;
  characterIds?: string[];
  locationIds?: string[];
  foreshadowingIds?: string[];
}

/** PolishRule 配置类型 */
export interface PolishRuleConfig {
  name?: string | undefined;
  description?: string | undefined;
  prompt?: string | undefined;
  pace?: string | undefined;
  mood?: string[];
  narrative?: string | undefined;
  senses?: string[];
  character?: string[];
  environment?: string[];
  rhetoric?: string | undefined;
  timeVariation?: boolean;
  contrastInsertion?: boolean;
}

/** PolishSample 配置类型 */
export interface PolishSampleConfig {
  name?: string | undefined;
  prompt?: string | undefined;
  sceneType?: string | undefined;
  text?: string | undefined;
  isNegative?: boolean;
}

/** 实体 Key → 配置类型 映射表 */
export interface EntityConfigMap {
  [ConfigEntity.NOVEL]: NovelConfig;
  [ConfigEntity.CHARACTER]: CharacterConfig;
  [ConfigEntity.OUTLINE]: OutlineConfig;
  [ConfigEntity.POLISH_RULE]: PolishRuleConfig;
  [ConfigEntity.POLISH_SAMPLE]: PolishSampleConfig;
}


/** 配置实体枚举（与 YAML 实体列表同源，由构建脚本自动生成） */
export enum ConfigEntity {
  NOVEL = "novel",
  CHARACTER = "character",
  OUTLINE = "outline",
  POLISH_RULE = "polish-rule",
  POLISH_SAMPLE = "polish-sample",
}

export const CONFIGS: Record<ConfigEntity, EntityConfig> = {
  "novel": {
    "entity": "Novel",
    "sections": [
      {
        "type": "card",
        "title": "基本信息",
        "icon": "BookOpen",
        "class": "grid grid-cols-2 gap-4",
        "children": [
          {
            "key": "title",
            "label": "作品名称",
            "type": "text",
            "placeholder": "作品名称"
          },
          {
            "key": "status",
            "label": "状态",
            "type": "single",
            "options": [
              {
                "value": "连载中",
                "icon": "Zap",
                "color": "primary"
              },
              {
                "value": "已完结",
                "icon": "CircleCheck",
                "color": "success"
              },
              {
                "value": "暂停",
                "icon": "Clock",
                "color": "warn"
              }
            ],
            "display": "flex",
            "icon": "Activity",
            "className": "grid grid-cols-3 gap-1"
          },
          {
            "key": "description",
            "label": "简介 / 梗概",
            "type": "longtext",
            "placeholder": "用一段话描述你的作品...",
            "maxLength": 2000,
            "className": "col-span-full"
          }
        ]
      },
      {
        "type": "tabs",
        "title": "作品设定",
        "children": [
          {
            "key": "enablePreset",
            "label": "预设文风",
            "type": "tab-group",
            "class": "space-y-2",
            "children": [
              {
                "key": "enablePreset",
                "label": "启用预设文风",
                "type": "toggle",
                "display": "between"
              },
              {
                "key": "presetStyle",
                "label": "预设文风",
                "type": "single",
                "options": [
                  {
                    "value": "古龙体",
                    "icon": "Sword",
                    "description": "短句为主，多用对仗与排比，留白极多。善用极简动作描写刻画人物，气氛冷峻肃杀。对话干脆利落，常用一句一段制造节奏感。环境描写点到为止，重视意境胜过细节铺陈。"
                  },
                  {
                    "value": "金庸体",
                    "icon": "ScrollText",
                    "description": "文笔典雅厚重，融入古典诗词与历史典故。武功描写细腻生动，招式名目考究。叙事稳健，重情节跌宕与人物群像。对话贴合身份，方言与文言点缀其间。"
                  },
                  {
                    "value": "网文爽文体",
                    "icon": "Moon",
                    "description": "节奏明快，多用短段落与断句制造阅读爽感。重冲突推进与情绪爆发，常以悬念钩子收尾。心理活动直白，金手指与系统提示穿插其中。环境描写服务于氛围渲染，不冗长。"
                  },
                  {
                    "value": "传统文学体",
                    "icon": "BookOpen",
                    "description": "语言凝练考究，长句与短句交替。重心理刻画与环境烘托，叙事节奏舒缓。多用隐喻与象征，留有阐释空间。对话含蓄，潜台词丰富。"
                  },
                  {
                    "value": "王朔体",
                    "icon": "Theater",
                    "description": "京味口语化，调侃与反讽贯穿始终。叙述者带着戏谑距离感，正经话用痞气说。对话密集，机锋暗藏，常以插科打诨解构严肃。"
                  },
                  {
                    "value": "余华体",
                    "icon": "Wind",
                    "description": "冷峻克制，近乎零度叙事。情感不外露，靠白描动作与事件传递力量。语言朴素洗练，重复句式制造节奏。苦难叙事中带荒诞感。"
                  },
                  {
                    "value": "意识流体",
                    "icon": "Waves",
                    "description": "长句流动，心理活动与外部事件交织。时间非线性跳跃，记忆与当下叠印。感官细节浓密，主观感受压倒客观描写。"
                  },
                  {
                    "value": "极简白描体",
                    "icon": "Zap",
                    "description": "动词驱动，形容词极省。场景靠动作与对话搭建，不写情绪只写行为。句子短，信息密度高，留白由读者填充。"
                  },
                  {
                    "value": "影视画面体",
                    "icon": "Palette",
                    "description": "强烈的镜头感，场景切换明确。重视觉细节与运动描写，对话简短承担叙事。氛围渲染浓墨重彩，节奏快慢有度。"
                  },
                  {
                    "value": "散文诗体",
                    "icon": "Feather",
                    "description": "文笔优美抒情，节奏舒缓如歌。意象密集，修辞丰富，重视氛围与情绪渲染。叙事弱化，意境至上。"
                  },
                  {
                    "value": "克苏鲁翻译体",
                    "icon": "Snowflake",
                    "description": "欧化长句，形容词堆叠密集。常以'不可名状''亵渎''癫狂'等词渲染未知恐惧。叙述者神经质，反复强调恐惧与无力感。"
                  },
                  {
                    "value": "番剧轻小说体",
                    "icon": "MessageSquare",
                    "description": "对话密集，吐槽与内心戏穿插。短段落为主，常用括号补足心理活动。角色声口鲜明，节奏轻快，二次元梗自然嵌入。"
                  }
                ],
                "display": "flex",
                "icon": "BookMarked",
                "noLabel": true,
                "className": "grid grid-cols-3 gap-2"
              }
            ]
          },
          {
            "key": "primaryTone",
            "label": "主基调",
            "type": "single",
            "options": [
              {
                "value": "沉郁黑暗",
                "icon": "Moon",
                "description": "压抑、阴郁、道德灰色，适合末世/克苏鲁/暗黑奇幻"
              },
              {
                "value": "轻松幽默",
                "icon": "Laugh",
                "description": "调侃、戏谑、反差萌，适合都市/轻小说/吐槽向"
              },
              {
                "value": "悬疑紧张",
                "icon": "SearchX",
                "description": "节奏紧、伏笔多、信息差，适合推理/惊悚/谍战"
              },
              {
                "value": "史诗宏大",
                "icon": "Crown",
                "description": "苍凉、厚重、格局感，适合史诗奇幻/历史/战争"
              },
              {
                "value": "温馨治愈",
                "icon": "Sun",
                "description": "温暖、治愈、日常感，适合治愈/日常/言情甜文"
              },
              {
                "value": "热血激昂",
                "icon": "Flame",
                "description": "高燃、爆发、爽感，适合玄幻/竞技/少年漫"
              },
              {
                "value": "哀伤悲剧",
                "icon": "HeartBroken",
                "description": "宿命感、悲剧美学，适合虐文/古风悲剧"
              },
              {
                "value": "荒诞戏谑",
                "icon": "CircleDot",
                "description": "黑色幽默、解构、反套路，适合后现代/讽刺"
              },
              {
                "value": "唯美浪漫",
                "icon": "Heart",
                "description": "唯美、抒情、氛围感，适合言情/古风/青春"
              },
              {
                "value": "冷峻克制",
                "icon": "Scissors",
                "description": "零度叙事、白描、克制，适合严肃文学/悬疑"
              },
              {
                "value": "诡谲神秘",
                "icon": "Ghost",
                "description": "诡异、神秘、不安感，适合克苏鲁/民俗恐怖"
              },
              {
                "value": "诙谐反讽",
                "icon": "Face",
                "description": "讽刺、调侃、社会批判，适合讽刺小说/王朔体"
              }
            ],
            "display": "flex",
            "icon": "Palette",
            "noLabel": true,
            "className": "grid grid-cols-4 gap-2"
          },
          {
            "key": "secondaryTones",
            "label": "副基调",
            "type": "multi",
            "options": [
              {
                "value": "沉郁黑暗",
                "icon": "Moon",
                "description": "压抑、阴郁、道德灰色，适合末世/克苏鲁/暗黑奇幻"
              },
              {
                "value": "轻松幽默",
                "icon": "Laugh",
                "description": "调侃、戏谑、反差萌，适合都市/轻小说/吐槽向"
              },
              {
                "value": "悬疑紧张",
                "icon": "SearchX",
                "description": "节奏紧、伏笔多、信息差，适合推理/惊悚/谍战"
              },
              {
                "value": "史诗宏大",
                "icon": "Crown",
                "description": "苍凉、厚重、格局感，适合史诗奇幻/历史/战争"
              },
              {
                "value": "温馨治愈",
                "icon": "Sun",
                "description": "温暖、治愈、日常感，适合治愈/日常/言情甜文"
              },
              {
                "value": "热血激昂",
                "icon": "Flame",
                "description": "高燃、爆发、爽感，适合玄幻/竞技/少年漫"
              },
              {
                "value": "哀伤悲剧",
                "icon": "HeartBroken",
                "description": "宿命感、悲剧美学，适合虐文/古风悲剧"
              },
              {
                "value": "荒诞戏谑",
                "icon": "CircleDot",
                "description": "黑色幽默、解构、反套路，适合后现代/讽刺"
              },
              {
                "value": "唯美浪漫",
                "icon": "Heart",
                "description": "唯美、抒情、氛围感，适合言情/古风/青春"
              },
              {
                "value": "冷峻克制",
                "icon": "Scissors",
                "description": "零度叙事、白描、克制，适合严肃文学/悬疑"
              },
              {
                "value": "诡谲神秘",
                "icon": "Ghost",
                "description": "诡异、神秘、不安感，适合克苏鲁/民俗恐怖"
              },
              {
                "value": "诙谐反讽",
                "icon": "Face",
                "description": "讽刺、调侃、社会批判，适合讽刺小说/王朔体"
              }
            ],
            "max": 2,
            "display": "flex",
            "icon": "Layers",
            "noLabel": true,
            "className": "grid grid-cols-4 gap-2"
          }
        ]
      },
      {
        "type": "tabs",
        "title": "世界观",
        "children": [
          {
            "key": "genre",
            "label": "题材",
            "type": "multi",
            "options": [
              {
                "value": "玄幻",
                "icon": "Sparkles"
              },
              {
                "value": "仙侠",
                "icon": "BookMarked"
              },
              {
                "value": "科幻",
                "icon": "Rocket"
              },
              {
                "value": "都市",
                "icon": "Building2"
              },
              {
                "value": "言情",
                "icon": "Heart"
              },
              {
                "value": "历史",
                "icon": "Book"
              },
              {
                "value": "悬疑",
                "icon": "Search"
              },
              {
                "value": "奇幻",
                "icon": "Wand2"
              },
              {
                "value": "武侠",
                "icon": "Sword"
              },
              {
                "value": "军事",
                "icon": "Shield"
              },
              {
                "value": "游戏",
                "icon": "Gamepad2"
              },
              {
                "value": "现实",
                "icon": "Globe"
              }
            ],
            "max": 2,
            "display": "flex",
            "noLabel": true,
            "variant": "box",
            "className": "gap-2"
          },
          {
            "key": "world",
            "label": "世界",
            "type": "tab-group",
            "class": "grid grid-cols-2 gap-2",
            "children": [
              {
                "key": "worldType",
                "label": "世界类型",
                "type": "single",
                "options": [
                  {
                    "value": "架空修仙",
                    "icon": "Sparkles",
                    "description": "灵气/功法/境界/宗门"
                  },
                  {
                    "value": "都市现实",
                    "icon": "Building2",
                    "description": "现代都市背景"
                  },
                  {
                    "value": "星际科幻",
                    "icon": "Rocket",
                    "description": "太空/星际/科技"
                  },
                  {
                    "value": "西幻魔法",
                    "icon": "Wand2",
                    "description": "魔法/种族/神祇"
                  },
                  {
                    "value": "末日废土",
                    "icon": "Skull",
                    "description": "灾难后/生存"
                  },
                  {
                    "value": "历史架空",
                    "icon": "Book",
                    "description": "真实历史+虚构"
                  },
                  {
                    "value": "赛博朋克",
                    "icon": "Cpu",
                    "description": "高科技低生活"
                  },
                  {
                    "value": "东方玄幻",
                    "icon": "Dragon",
                    "description": "洪荒/神话/山海经"
                  }
                ],
                "className": "grid grid-cols-2 gap-2"
              },
              {
                "key": "worldShape",
                "label": "世界形态",
                "type": "single",
                "options": [
                  {
                    "value": "大陆",
                    "icon": "Map"
                  },
                  {
                    "value": "群岛",
                    "icon": "Waves"
                  },
                  {
                    "value": "星球",
                    "icon": "Globe"
                  },
                  {
                    "value": "星系",
                    "icon": "Orbit"
                  },
                  {
                    "value": "多重位面",
                    "icon": "Layers"
                  }
                ],
                "className": "grid grid-cols-2 gap-2"
              }
            ]
          }
        ]
      }
    ],
    "fields": [
      {
        "key": "title",
        "label": "作品名称",
        "type": "text",
        "placeholder": "作品名称"
      },
      {
        "key": "description",
        "label": "简介 / 梗概",
        "type": "longtext",
        "placeholder": "用一段话描述你的作品...",
        "maxLength": 2000,
        "className": "col-span-full"
      },
      {
        "key": "status",
        "label": "状态",
        "type": "single",
        "options": [
          {
            "value": "连载中",
            "icon": "Zap",
            "color": "primary"
          },
          {
            "value": "已完结",
            "icon": "CircleCheck",
            "color": "success"
          },
          {
            "value": "暂停",
            "icon": "Clock",
            "color": "warn"
          }
        ],
        "display": "flex",
        "icon": "Activity",
        "className": "grid grid-cols-3 gap-1"
      },
      {
        "key": "genre",
        "label": "题材",
        "type": "multi",
        "options": [
          {
            "value": "玄幻",
            "icon": "Sparkles"
          },
          {
            "value": "仙侠",
            "icon": "BookMarked"
          },
          {
            "value": "科幻",
            "icon": "Rocket"
          },
          {
            "value": "都市",
            "icon": "Building2"
          },
          {
            "value": "言情",
            "icon": "Heart"
          },
          {
            "value": "历史",
            "icon": "Book"
          },
          {
            "value": "悬疑",
            "icon": "Search"
          },
          {
            "value": "奇幻",
            "icon": "Wand2"
          },
          {
            "value": "武侠",
            "icon": "Sword"
          },
          {
            "value": "军事",
            "icon": "Shield"
          },
          {
            "value": "游戏",
            "icon": "Gamepad2"
          },
          {
            "value": "现实",
            "icon": "Globe"
          }
        ],
        "max": 2,
        "display": "flex",
        "noLabel": true,
        "variant": "box",
        "className": "gap-2"
      },
      {
        "key": "enablePreset",
        "label": "启用预设文风",
        "type": "toggle",
        "display": "between"
      },
      {
        "key": "presetStyle",
        "label": "预设文风",
        "type": "single",
        "options": [
          {
            "value": "古龙体",
            "icon": "Sword",
            "description": "短句为主，多用对仗与排比，留白极多。善用极简动作描写刻画人物，气氛冷峻肃杀。对话干脆利落，常用一句一段制造节奏感。环境描写点到为止，重视意境胜过细节铺陈。"
          },
          {
            "value": "金庸体",
            "icon": "ScrollText",
            "description": "文笔典雅厚重，融入古典诗词与历史典故。武功描写细腻生动，招式名目考究。叙事稳健，重情节跌宕与人物群像。对话贴合身份，方言与文言点缀其间。"
          },
          {
            "value": "网文爽文体",
            "icon": "Moon",
            "description": "节奏明快，多用短段落与断句制造阅读爽感。重冲突推进与情绪爆发，常以悬念钩子收尾。心理活动直白，金手指与系统提示穿插其中。环境描写服务于氛围渲染，不冗长。"
          },
          {
            "value": "传统文学体",
            "icon": "BookOpen",
            "description": "语言凝练考究，长句与短句交替。重心理刻画与环境烘托，叙事节奏舒缓。多用隐喻与象征，留有阐释空间。对话含蓄，潜台词丰富。"
          },
          {
            "value": "王朔体",
            "icon": "Theater",
            "description": "京味口语化，调侃与反讽贯穿始终。叙述者带着戏谑距离感，正经话用痞气说。对话密集，机锋暗藏，常以插科打诨解构严肃。"
          },
          {
            "value": "余华体",
            "icon": "Wind",
            "description": "冷峻克制，近乎零度叙事。情感不外露，靠白描动作与事件传递力量。语言朴素洗练，重复句式制造节奏。苦难叙事中带荒诞感。"
          },
          {
            "value": "意识流体",
            "icon": "Waves",
            "description": "长句流动，心理活动与外部事件交织。时间非线性跳跃，记忆与当下叠印。感官细节浓密，主观感受压倒客观描写。"
          },
          {
            "value": "极简白描体",
            "icon": "Zap",
            "description": "动词驱动，形容词极省。场景靠动作与对话搭建，不写情绪只写行为。句子短，信息密度高，留白由读者填充。"
          },
          {
            "value": "影视画面体",
            "icon": "Palette",
            "description": "强烈的镜头感，场景切换明确。重视觉细节与运动描写，对话简短承担叙事。氛围渲染浓墨重彩，节奏快慢有度。"
          },
          {
            "value": "散文诗体",
            "icon": "Feather",
            "description": "文笔优美抒情，节奏舒缓如歌。意象密集，修辞丰富，重视氛围与情绪渲染。叙事弱化，意境至上。"
          },
          {
            "value": "克苏鲁翻译体",
            "icon": "Snowflake",
            "description": "欧化长句，形容词堆叠密集。常以'不可名状''亵渎''癫狂'等词渲染未知恐惧。叙述者神经质，反复强调恐惧与无力感。"
          },
          {
            "value": "番剧轻小说体",
            "icon": "MessageSquare",
            "description": "对话密集，吐槽与内心戏穿插。短段落为主，常用括号补足心理活动。角色声口鲜明，节奏轻快，二次元梗自然嵌入。"
          }
        ],
        "display": "flex",
        "icon": "BookMarked",
        "noLabel": true,
        "className": "grid grid-cols-3 gap-2"
      },
      {
        "key": "primaryTone",
        "label": "主基调",
        "type": "single",
        "options": [
          {
            "value": "沉郁黑暗",
            "icon": "Moon",
            "description": "压抑、阴郁、道德灰色，适合末世/克苏鲁/暗黑奇幻"
          },
          {
            "value": "轻松幽默",
            "icon": "Laugh",
            "description": "调侃、戏谑、反差萌，适合都市/轻小说/吐槽向"
          },
          {
            "value": "悬疑紧张",
            "icon": "SearchX",
            "description": "节奏紧、伏笔多、信息差，适合推理/惊悚/谍战"
          },
          {
            "value": "史诗宏大",
            "icon": "Crown",
            "description": "苍凉、厚重、格局感，适合史诗奇幻/历史/战争"
          },
          {
            "value": "温馨治愈",
            "icon": "Sun",
            "description": "温暖、治愈、日常感，适合治愈/日常/言情甜文"
          },
          {
            "value": "热血激昂",
            "icon": "Flame",
            "description": "高燃、爆发、爽感，适合玄幻/竞技/少年漫"
          },
          {
            "value": "哀伤悲剧",
            "icon": "HeartBroken",
            "description": "宿命感、悲剧美学，适合虐文/古风悲剧"
          },
          {
            "value": "荒诞戏谑",
            "icon": "CircleDot",
            "description": "黑色幽默、解构、反套路，适合后现代/讽刺"
          },
          {
            "value": "唯美浪漫",
            "icon": "Heart",
            "description": "唯美、抒情、氛围感，适合言情/古风/青春"
          },
          {
            "value": "冷峻克制",
            "icon": "Scissors",
            "description": "零度叙事、白描、克制，适合严肃文学/悬疑"
          },
          {
            "value": "诡谲神秘",
            "icon": "Ghost",
            "description": "诡异、神秘、不安感，适合克苏鲁/民俗恐怖"
          },
          {
            "value": "诙谐反讽",
            "icon": "Face",
            "description": "讽刺、调侃、社会批判，适合讽刺小说/王朔体"
          }
        ],
        "display": "flex",
        "icon": "Palette",
        "noLabel": true,
        "className": "grid grid-cols-4 gap-2"
      },
      {
        "key": "secondaryTones",
        "label": "副基调",
        "type": "multi",
        "options": [
          {
            "value": "沉郁黑暗",
            "icon": "Moon",
            "description": "压抑、阴郁、道德灰色，适合末世/克苏鲁/暗黑奇幻"
          },
          {
            "value": "轻松幽默",
            "icon": "Laugh",
            "description": "调侃、戏谑、反差萌，适合都市/轻小说/吐槽向"
          },
          {
            "value": "悬疑紧张",
            "icon": "SearchX",
            "description": "节奏紧、伏笔多、信息差，适合推理/惊悚/谍战"
          },
          {
            "value": "史诗宏大",
            "icon": "Crown",
            "description": "苍凉、厚重、格局感，适合史诗奇幻/历史/战争"
          },
          {
            "value": "温馨治愈",
            "icon": "Sun",
            "description": "温暖、治愈、日常感，适合治愈/日常/言情甜文"
          },
          {
            "value": "热血激昂",
            "icon": "Flame",
            "description": "高燃、爆发、爽感，适合玄幻/竞技/少年漫"
          },
          {
            "value": "哀伤悲剧",
            "icon": "HeartBroken",
            "description": "宿命感、悲剧美学，适合虐文/古风悲剧"
          },
          {
            "value": "荒诞戏谑",
            "icon": "CircleDot",
            "description": "黑色幽默、解构、反套路，适合后现代/讽刺"
          },
          {
            "value": "唯美浪漫",
            "icon": "Heart",
            "description": "唯美、抒情、氛围感，适合言情/古风/青春"
          },
          {
            "value": "冷峻克制",
            "icon": "Scissors",
            "description": "零度叙事、白描、克制，适合严肃文学/悬疑"
          },
          {
            "value": "诡谲神秘",
            "icon": "Ghost",
            "description": "诡异、神秘、不安感，适合克苏鲁/民俗恐怖"
          },
          {
            "value": "诙谐反讽",
            "icon": "Face",
            "description": "讽刺、调侃、社会批判，适合讽刺小说/王朔体"
          }
        ],
        "max": 2,
        "display": "flex",
        "icon": "Layers",
        "noLabel": true,
        "className": "grid grid-cols-4 gap-2"
      },
      {
        "key": "worldType",
        "label": "世界类型",
        "type": "single",
        "options": [
          {
            "value": "架空修仙",
            "icon": "Sparkles",
            "description": "灵气/功法/境界/宗门"
          },
          {
            "value": "都市现实",
            "icon": "Building2",
            "description": "现代都市背景"
          },
          {
            "value": "星际科幻",
            "icon": "Rocket",
            "description": "太空/星际/科技"
          },
          {
            "value": "西幻魔法",
            "icon": "Wand2",
            "description": "魔法/种族/神祇"
          },
          {
            "value": "末日废土",
            "icon": "Skull",
            "description": "灾难后/生存"
          },
          {
            "value": "历史架空",
            "icon": "Book",
            "description": "真实历史+虚构"
          },
          {
            "value": "赛博朋克",
            "icon": "Cpu",
            "description": "高科技低生活"
          },
          {
            "value": "东方玄幻",
            "icon": "Dragon",
            "description": "洪荒/神话/山海经"
          }
        ],
        "className": "grid grid-cols-2 gap-2"
      },
      {
        "key": "worldShape",
        "label": "世界形态",
        "type": "single",
        "options": [
          {
            "value": "大陆",
            "icon": "Map"
          },
          {
            "value": "群岛",
            "icon": "Waves"
          },
          {
            "value": "星球",
            "icon": "Globe"
          },
          {
            "value": "星系",
            "icon": "Orbit"
          },
          {
            "value": "多重位面",
            "icon": "Layers"
          }
        ],
        "className": "grid grid-cols-2 gap-2"
      }
    ]
  },
  "character": {
    "entity": "Character",
    "sections": [
      {
        "type": "grid",
        "cols": 3,
        "sections": [
          {
            "type": "grid",
            "cols": 1,
            "colspan": 2,
            "sections": [
              {
                "type": "card",
                "title": "角色名称",
                "icon": "UserRound",
                "class": "grid grid-cols-2 gap-3 parent",
                "titleKey": "name",
                "titleEditable": true,
                "children": [
                  {
                    "key": "gender",
                    "label": "性别",
                    "type": "single",
                    "options": [
                      {
                        "value": "男",
                        "icon": "Mars"
                      },
                      {
                        "value": "女",
                        "icon": "Venus"
                      }
                    ],
                    "display": "flex"
                  },
                  {
                    "key": "role",
                    "label": "角色类型",
                    "type": "single",
                    "options": [
                      {
                        "value": "主角",
                        "icon": "Star",
                        "color": "primary"
                      },
                      {
                        "value": "配角",
                        "icon": "Users",
                        "color": "neutral"
                      },
                      {
                        "value": "反派",
                        "icon": "Skull",
                        "color": "danger"
                      }
                    ],
                    "display": "flex"
                  },
                  {
                    "key": "age",
                    "label": "年龄",
                    "type": "text",
                    "placeholder": "如：25岁"
                  },
                  {
                    "key": "identity",
                    "label": "身份",
                    "type": "text",
                    "placeholder": "身份/职业/组织归属"
                  },
                  {
                    "key": "item",
                    "label": "标志性物件",
                    "type": "text",
                    "placeholder": "一件有故事的随身物品"
                  },
                  {
                    "key": "coreConflict",
                    "label": "核心矛盾",
                    "type": "text",
                    "placeholder": "一句话概括"
                  },
                  {
                    "key": "emotionExpression",
                    "label": "情感表达方式",
                    "type": "single",
                    "options": [
                      {
                        "value": "成熟克制",
                        "icon": "ShieldCheck"
                      },
                      {
                        "value": "笨拙",
                        "icon": "TriangleAlert"
                      },
                      {
                        "value": "热烈",
                        "icon": "Flame"
                      },
                      {
                        "value": "压抑",
                        "icon": "CloudRain"
                      },
                      {
                        "value": "回避",
                        "icon": "ArrowBigLeftDash"
                      }
                    ],
                    "display": "flex",
                    "className": "col-span-full"
                  }
                ]
              },
              {
                "type": "tabs",
                "title": "能力与关系",
                "children": [
                  {
                    "key": "abilities",
                    "label": "能力",
                    "type": "list",
                    "noLabel": true,
                    "subFields": [
                      {
                        "placeholder": "擅长什么",
                        "width": "w-1/3"
                      },
                      {
                        "placeholder": "具体表现",
                        "width": "flex-1"
                      }
                    ]
                  },
                  {
                    "key": "growthArcs",
                    "label": "成长弧光",
                    "type": "list",
                    "noLabel": true,
                    "subFields": [
                      {
                        "placeholder": "缺陷",
                        "width": "w-1/4"
                      },
                      {
                        "placeholder": "表现",
                        "width": "w-1/3"
                      },
                      {
                        "placeholder": "成长方向",
                        "width": "w-1/3"
                      }
                    ]
                  },
                  {
                    "key": "relationships",
                    "label": "关系网络",
                    "type": "list",
                    "noLabel": true,
                    "subFields": [
                      {
                        "placeholder": "角色姓名",
                        "width": "w-1/3"
                      },
                      {
                        "placeholder": "与 TA 的关系",
                        "width": "flex-1"
                      }
                    ]
                  },
                  {
                    "key": "notes",
                    "label": "写作注意事项",
                    "type": "list",
                    "noLabel": true,
                    "subFields": [
                      {
                        "placeholder": "标签",
                        "width": "w-1/3"
                      },
                      {
                        "placeholder": "内容",
                        "width": "flex-1"
                      }
                    ],
                    "defaultValue": [
                      "破局方式;",
                      "关键行为模式;",
                      "角色危险性或潜力;"
                    ]
                  }
                ]
              }
            ]
          },
          {
            "type": "grid",
            "cols": 1,
            "colspan": 1,
            "sections": [
              {
                "type": "card",
                "title": "叙事功能原型（沃格勒体系）",
                "icon": "Shield",
                "children": [
                  {
                    "key": "narrativeFunction",
                    "label": "叙事功能原型",
                    "type": "multi",
                    "options": [
                      {
                        "value": "英雄",
                        "icon": "Shield",
                        "description": "故事核心推动者，为达成目标直面终极挑战，并愿意为集体利益做出关键牺牲。"
                      },
                      {
                        "value": "导师",
                        "icon": "GraduationCap",
                        "description": "向英雄提供智慧、装备、训练或精神指引的引导者，通常在前期登场，后期退场或升华。"
                      },
                      {
                        "value": "信使",
                        "icon": "Mail",
                        "description": "带来外部消息、发布冒险召唤、打破主角平静日常的角色。"
                      },
                      {
                        "value": "变形者",
                        "icon": "Sparkles",
                        "description": "立场、忠诚度或真实身份模糊不定的角色，制造悬念、怀疑与戏剧翻转。"
                      },
                      {
                        "value": "阴影",
                        "icon": "Skull",
                        "description": "与英雄核心价值观或目标直接对立的终极反派。"
                      },
                      {
                        "value": "伙伴",
                        "icon": "Users",
                        "description": "英雄的同行者，提供情感支持、战力互补或功能辅助。"
                      },
                      {
                        "value": "骗徒",
                        "icon": "Theater",
                        "description": "以狡黠、幽默或非正当手段搅动局势的角色，常打破常规逻辑。"
                      },
                      {
                        "value": "边界守卫",
                        "icon": "DoorOpen",
                        "description": "把守每一道关卡的测试者，负责筛选英雄资格。"
                      }
                    ],
                    "max": 3,
                    "display": "grid",
                    "noLabel": true,
                    "variant": "box"
                  }
                ]
              },
              {
                "type": "card",
                "title": "内在动机原型（皮尔逊体系）",
                "icon": "Heart",
                "children": [
                  {
                    "key": "innerMotivation",
                    "label": "内在动机原型",
                    "type": "multi",
                    "options": [
                      {
                        "value": "天真者",
                        "icon": "Heart",
                        "description": "追求安全与简单，赤子之心，相信世界本善。"
                      },
                      {
                        "value": "孤儿",
                        "icon": "Home",
                        "description": "追求归属与连接，学会在残酷现实中依靠同伴。"
                      },
                      {
                        "value": "战士",
                        "icon": "Sword",
                        "description": "追求胜利与征服，勇猛与纪律，以钢铁意志击溃障碍。"
                      },
                      {
                        "value": "照顾者",
                        "icon": "Hand",
                        "description": "追求奉献与保护，利他母性，以滋养他人为最高价值。"
                      },
                      {
                        "value": "探索者",
                        "icon": "Compass",
                        "description": "追求自由与真理，不安于现状，抗拒被困。"
                      },
                      {
                        "value": "爱人",
                        "icon": "Heart",
                        "description": "追求亲密与激情，强烈的感官与情感连接。"
                      },
                      {
                        "value": "叛逆者",
                        "icon": "Flag",
                        "description": "追求颠覆与变革，对旧秩序的愤怒，以打破枷锁为使命。"
                      },
                      {
                        "value": "创造者",
                        "icon": "Palette",
                        "description": "追求创新与自我表达，将内心幻景具象化。"
                      },
                      {
                        "value": "愚者",
                        "icon": "PartyPopper",
                        "description": "追求快乐与趣味，用幽默解构严肃，活在当下。"
                      },
                      {
                        "value": "统治者",
                        "icon": "Crown",
                        "description": "追求秩序与控制，责任与力量，渴望建立稳固的体系。"
                      },
                      {
                        "value": "魔术师",
                        "icon": "Wand2",
                        "description": "追求转化与洞察，掌握深层规律，将愿景转化为现实。"
                      },
                      {
                        "value": "贤者",
                        "icon": "BookOpen",
                        "description": "追求真理与智慧，无尽的好奇心，以认知世界为乐。"
                      }
                    ],
                    "max": 3,
                    "display": "grid",
                    "noLabel": true,
                    "variant": "box"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "fields": [
      {
        "key": "name",
        "label": "角色名称",
        "type": "text",
        "placeholder": "角色名称",
        "defaultValue": ""
      },
      {
        "key": "gender",
        "label": "性别",
        "type": "single",
        "options": [
          {
            "value": "男",
            "icon": "Mars"
          },
          {
            "value": "女",
            "icon": "Venus"
          }
        ],
        "display": "flex"
      },
      {
        "key": "role",
        "label": "角色类型",
        "type": "single",
        "options": [
          {
            "value": "主角",
            "icon": "Star",
            "color": "primary"
          },
          {
            "value": "配角",
            "icon": "Users",
            "color": "neutral"
          },
          {
            "value": "反派",
            "icon": "Skull",
            "color": "danger"
          }
        ],
        "display": "flex"
      },
      {
        "key": "age",
        "label": "年龄",
        "type": "text",
        "placeholder": "如：25岁"
      },
      {
        "key": "identity",
        "label": "身份",
        "type": "text",
        "placeholder": "身份/职业/组织归属"
      },
      {
        "key": "item",
        "label": "标志性物件",
        "type": "text",
        "placeholder": "一件有故事的随身物品"
      },
      {
        "key": "coreConflict",
        "label": "核心矛盾",
        "type": "text",
        "placeholder": "一句话概括"
      },
      {
        "key": "emotionExpression",
        "label": "情感表达方式",
        "type": "single",
        "options": [
          {
            "value": "成熟克制",
            "icon": "ShieldCheck"
          },
          {
            "value": "笨拙",
            "icon": "TriangleAlert"
          },
          {
            "value": "热烈",
            "icon": "Flame"
          },
          {
            "value": "压抑",
            "icon": "CloudRain"
          },
          {
            "value": "回避",
            "icon": "ArrowBigLeftDash"
          }
        ],
        "display": "flex",
        "className": "col-span-full"
      },
      {
        "key": "abilities",
        "label": "能力",
        "type": "list",
        "noLabel": true,
        "subFields": [
          {
            "placeholder": "擅长什么",
            "width": "w-1/3"
          },
          {
            "placeholder": "具体表现",
            "width": "flex-1"
          }
        ]
      },
      {
        "key": "growthArcs",
        "label": "成长弧光",
        "type": "list",
        "noLabel": true,
        "subFields": [
          {
            "placeholder": "缺陷",
            "width": "w-1/4"
          },
          {
            "placeholder": "表现",
            "width": "w-1/3"
          },
          {
            "placeholder": "成长方向",
            "width": "w-1/3"
          }
        ]
      },
      {
        "key": "relationships",
        "label": "关系网络",
        "type": "list",
        "noLabel": true,
        "subFields": [
          {
            "placeholder": "角色姓名",
            "width": "w-1/3"
          },
          {
            "placeholder": "与 TA 的关系",
            "width": "flex-1"
          }
        ]
      },
      {
        "key": "notes",
        "label": "写作注意事项",
        "type": "list",
        "noLabel": true,
        "subFields": [
          {
            "placeholder": "标签",
            "width": "w-1/3"
          },
          {
            "placeholder": "内容",
            "width": "flex-1"
          }
        ],
        "defaultValue": [
          "破局方式;",
          "关键行为模式;",
          "角色危险性或潜力;"
        ]
      },
      {
        "key": "narrativeFunction",
        "label": "叙事功能原型",
        "type": "multi",
        "options": [
          {
            "value": "英雄",
            "icon": "Shield",
            "description": "故事核心推动者，为达成目标直面终极挑战，并愿意为集体利益做出关键牺牲。"
          },
          {
            "value": "导师",
            "icon": "GraduationCap",
            "description": "向英雄提供智慧、装备、训练或精神指引的引导者，通常在前期登场，后期退场或升华。"
          },
          {
            "value": "信使",
            "icon": "Mail",
            "description": "带来外部消息、发布冒险召唤、打破主角平静日常的角色。"
          },
          {
            "value": "变形者",
            "icon": "Sparkles",
            "description": "立场、忠诚度或真实身份模糊不定的角色，制造悬念、怀疑与戏剧翻转。"
          },
          {
            "value": "阴影",
            "icon": "Skull",
            "description": "与英雄核心价值观或目标直接对立的终极反派。"
          },
          {
            "value": "伙伴",
            "icon": "Users",
            "description": "英雄的同行者，提供情感支持、战力互补或功能辅助。"
          },
          {
            "value": "骗徒",
            "icon": "Theater",
            "description": "以狡黠、幽默或非正当手段搅动局势的角色，常打破常规逻辑。"
          },
          {
            "value": "边界守卫",
            "icon": "DoorOpen",
            "description": "把守每一道关卡的测试者，负责筛选英雄资格。"
          }
        ],
        "max": 3,
        "display": "grid",
        "noLabel": true,
        "variant": "box"
      },
      {
        "key": "innerMotivation",
        "label": "内在动机原型",
        "type": "multi",
        "options": [
          {
            "value": "天真者",
            "icon": "Heart",
            "description": "追求安全与简单，赤子之心，相信世界本善。"
          },
          {
            "value": "孤儿",
            "icon": "Home",
            "description": "追求归属与连接，学会在残酷现实中依靠同伴。"
          },
          {
            "value": "战士",
            "icon": "Sword",
            "description": "追求胜利与征服，勇猛与纪律，以钢铁意志击溃障碍。"
          },
          {
            "value": "照顾者",
            "icon": "Hand",
            "description": "追求奉献与保护，利他母性，以滋养他人为最高价值。"
          },
          {
            "value": "探索者",
            "icon": "Compass",
            "description": "追求自由与真理，不安于现状，抗拒被困。"
          },
          {
            "value": "爱人",
            "icon": "Heart",
            "description": "追求亲密与激情，强烈的感官与情感连接。"
          },
          {
            "value": "叛逆者",
            "icon": "Flag",
            "description": "追求颠覆与变革，对旧秩序的愤怒，以打破枷锁为使命。"
          },
          {
            "value": "创造者",
            "icon": "Palette",
            "description": "追求创新与自我表达，将内心幻景具象化。"
          },
          {
            "value": "愚者",
            "icon": "PartyPopper",
            "description": "追求快乐与趣味，用幽默解构严肃，活在当下。"
          },
          {
            "value": "统治者",
            "icon": "Crown",
            "description": "追求秩序与控制，责任与力量，渴望建立稳固的体系。"
          },
          {
            "value": "魔术师",
            "icon": "Wand2",
            "description": "追求转化与洞察，掌握深层规律，将愿景转化为现实。"
          },
          {
            "value": "贤者",
            "icon": "BookOpen",
            "description": "追求真理与智慧，无尽的好奇心，以认知世界为乐。"
          }
        ],
        "max": 3,
        "display": "grid",
        "noLabel": true,
        "variant": "box"
      }
    ]
  },
  "outline": {
    "entity": "Outline",
    "sections": [
      {
        "type": "grid",
        "cols": 2,
        "sections": [
          {
            "type": "grid",
            "cols": 1,
            "colspan": 1,
            "sections": [
              {
                "type": "card",
                "title": "基本信息",
                "icon": "FileText",
                "class": "space-y-3",
                "children": [
                  {
                    "key": "title",
                    "label": "章纲标题",
                    "type": "text",
                    "placeholder": "章纲标题"
                  },
                  {
                    "key": "contentBrief",
                    "label": "概要",
                    "type": "text",
                    "placeholder": "一句话概括本章（最多80字）",
                    "maxLength": 80
                  },
                  {
                    "key": "contentDetail",
                    "label": "详细内容",
                    "type": "longtext",
                    "placeholder": "详细描述本章情节发展和关键节点...",
                    "maxLength": 400
                  },
                  {
                    "key": "status",
                    "label": "状态",
                    "type": "single",
                    "options": [
                      {
                        "value": "planned",
                        "label": "已规划",
                        "icon": "Calendar",
                        "color": "neutral"
                      },
                      {
                        "value": "in_progress",
                        "label": "进行中",
                        "icon": "Pen",
                        "color": "primary"
                      },
                      {
                        "value": "completed",
                        "label": "已完成",
                        "icon": "CheckCircle",
                        "color": "success"
                      }
                    ],
                    "display": "flex"
                  }
                ]
              }
            ]
          },
          {
            "type": "grid",
            "cols": 1,
            "colspan": 1,
            "sections": [
              {
                "type": "card",
                "title": "时空基调",
                "icon": "MapPin",
                "children": [
                  {
                    "key": "timeline",
                    "label": "时间",
                    "type": "text",
                    "placeholder": "如：春·清晨 / 天元历127年三月廿·深夜",
                    "icon": "Clock"
                  },
                  {
                    "key": "tone",
                    "label": "基调",
                    "type": "single",
                    "options": [
                      {
                        "value": "沉郁黑暗",
                        "icon": "Moon",
                        "description": "压抑、阴郁、道德灰色，适合末世/克苏鲁/暗黑奇幻"
                      },
                      {
                        "value": "轻松幽默",
                        "icon": "Laugh",
                        "description": "调侃、戏谑、反差萌，适合都市/轻小说/吐槽向"
                      },
                      {
                        "value": "悬疑紧张",
                        "icon": "SearchX",
                        "description": "节奏紧、伏笔多、信息差，适合推理/惊悚/谍战"
                      },
                      {
                        "value": "史诗宏大",
                        "icon": "Crown",
                        "description": "苍凉、厚重、格局感，适合史诗奇幻/历史/战争"
                      },
                      {
                        "value": "温馨治愈",
                        "icon": "Sun",
                        "description": "温暖、治愈、日常感，适合治愈/日常/言情甜文"
                      },
                      {
                        "value": "热血激昂",
                        "icon": "Flame",
                        "description": "高燃、爆发、爽感，适合玄幻/竞技/少年漫"
                      },
                      {
                        "value": "哀伤悲剧",
                        "icon": "HeartBroken",
                        "description": "宿命感、悲剧美学，适合虐文/古风悲剧"
                      },
                      {
                        "value": "荒诞戏谑",
                        "icon": "CircleDot",
                        "description": "黑色幽默、解构、反套路，适合后现代/讽刺"
                      },
                      {
                        "value": "唯美浪漫",
                        "icon": "Heart",
                        "description": "唯美、抒情、氛围感，适合言情/古风/青春"
                      },
                      {
                        "value": "冷峻克制",
                        "icon": "Scissors",
                        "description": "零度叙事、白描、克制，适合严肃文学/悬疑"
                      },
                      {
                        "value": "诡谲神秘",
                        "icon": "Ghost",
                        "description": "诡异、神秘、不安感，适合克苏鲁/民俗恐怖"
                      },
                      {
                        "value": "诙谐反讽",
                        "icon": "Face",
                        "description": "讽刺、调侃、社会批判，适合讽刺小说/王朔体"
                      }
                    ],
                    "display": "flex",
                    "className": "grid grid-cols-2 gap-2"
                  }
                ]
              },
              {
                "type": "card",
                "title": "关联实体",
                "icon": "Link",
                "children": [
                  {
                    "key": "characterIds",
                    "label": "出场人物",
                    "type": "tagselect",
                    "entity": "character"
                  },
                  {
                    "key": "locationIds",
                    "label": "地点",
                    "type": "tagselect",
                    "entity": "location"
                  },
                  {
                    "key": "foreshadowingIds",
                    "label": "伏笔",
                    "type": "tagselect",
                    "entity": "foreshadowing"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "fields": [
      {
        "key": "title",
        "label": "章纲标题",
        "type": "text",
        "placeholder": "章纲标题"
      },
      {
        "key": "contentBrief",
        "label": "概要",
        "type": "text",
        "placeholder": "一句话概括本章（最多80字）",
        "maxLength": 80
      },
      {
        "key": "contentDetail",
        "label": "详细内容",
        "type": "longtext",
        "placeholder": "详细描述本章情节发展和关键节点...",
        "maxLength": 400
      },
      {
        "key": "status",
        "label": "状态",
        "type": "single",
        "options": [
          {
            "value": "planned",
            "label": "已规划",
            "icon": "Calendar",
            "color": "neutral"
          },
          {
            "value": "in_progress",
            "label": "进行中",
            "icon": "Pen",
            "color": "primary"
          },
          {
            "value": "completed",
            "label": "已完成",
            "icon": "CheckCircle",
            "color": "success"
          }
        ],
        "display": "flex"
      },
      {
        "key": "timeline",
        "label": "时间",
        "type": "text",
        "placeholder": "如：春·清晨 / 天元历127年三月廿·深夜",
        "icon": "Clock"
      },
      {
        "key": "tone",
        "label": "基调",
        "type": "single",
        "options": [
          {
            "value": "沉郁黑暗",
            "icon": "Moon",
            "description": "压抑、阴郁、道德灰色，适合末世/克苏鲁/暗黑奇幻"
          },
          {
            "value": "轻松幽默",
            "icon": "Laugh",
            "description": "调侃、戏谑、反差萌，适合都市/轻小说/吐槽向"
          },
          {
            "value": "悬疑紧张",
            "icon": "SearchX",
            "description": "节奏紧、伏笔多、信息差，适合推理/惊悚/谍战"
          },
          {
            "value": "史诗宏大",
            "icon": "Crown",
            "description": "苍凉、厚重、格局感，适合史诗奇幻/历史/战争"
          },
          {
            "value": "温馨治愈",
            "icon": "Sun",
            "description": "温暖、治愈、日常感，适合治愈/日常/言情甜文"
          },
          {
            "value": "热血激昂",
            "icon": "Flame",
            "description": "高燃、爆发、爽感，适合玄幻/竞技/少年漫"
          },
          {
            "value": "哀伤悲剧",
            "icon": "HeartBroken",
            "description": "宿命感、悲剧美学，适合虐文/古风悲剧"
          },
          {
            "value": "荒诞戏谑",
            "icon": "CircleDot",
            "description": "黑色幽默、解构、反套路，适合后现代/讽刺"
          },
          {
            "value": "唯美浪漫",
            "icon": "Heart",
            "description": "唯美、抒情、氛围感，适合言情/古风/青春"
          },
          {
            "value": "冷峻克制",
            "icon": "Scissors",
            "description": "零度叙事、白描、克制，适合严肃文学/悬疑"
          },
          {
            "value": "诡谲神秘",
            "icon": "Ghost",
            "description": "诡异、神秘、不安感，适合克苏鲁/民俗恐怖"
          },
          {
            "value": "诙谐反讽",
            "icon": "Face",
            "description": "讽刺、调侃、社会批判，适合讽刺小说/王朔体"
          }
        ],
        "display": "flex",
        "className": "grid grid-cols-2 gap-2"
      },
      {
        "key": "characterIds",
        "label": "出场人物",
        "type": "tagselect",
        "entity": "character"
      },
      {
        "key": "locationIds",
        "label": "地点",
        "type": "tagselect",
        "entity": "location"
      },
      {
        "key": "foreshadowingIds",
        "label": "伏笔",
        "type": "tagselect",
        "entity": "foreshadowing"
      }
    ]
  },
  "polish-rule": {
    "entity": "PolishRule",
    "sections": [
      {
        "type": "card",
        "title": "基本信息",
        "icon": "BookOpen",
        "class": "grid grid-cols-2 gap-4",
        "children": [
          {
            "key": "name",
            "label": "规则名称",
            "type": "text",
            "placeholder": "如：口语化→书面化"
          },
          {
            "key": "description",
            "label": "规则描述",
            "type": "text",
            "placeholder": "简单描述这个规则的作用"
          },
          {
            "key": "prompt",
            "label": "自定义补充说明",
            "type": "longtext",
            "placeholder": "在此补充额外的润色要求...",
            "maxLength": 1000,
            "className": "col-span-full"
          }
        ]
      },
      {
        "type": "grid",
        "cols": 2,
        "sections": [
          {
            "type": "card",
            "title": "界限",
            "class": "space-y-4",
            "children": [
              {
                "key": "pace",
                "label": "节奏",
                "type": "single",
                "options": [
                  {
                    "value": "快"
                  },
                  {
                    "value": "中"
                  },
                  {
                    "value": "慢"
                  }
                ],
                "display": "flex"
              },
              {
                "key": "mood",
                "label": "情绪 / 氛围",
                "type": "multi",
                "options": [
                  {
                    "value": "紧张"
                  },
                  {
                    "value": "压抑"
                  },
                  {
                    "value": "温馨"
                  },
                  {
                    "value": "荒诞"
                  },
                  {
                    "value": "沉重"
                  },
                  {
                    "value": "轻松"
                  },
                  {
                    "value": "悬疑"
                  },
                  {
                    "value": "悲怆"
                  }
                ],
                "max": 2,
                "display": "flex"
              },
              {
                "key": "narrative",
                "label": "叙事手法",
                "type": "single",
                "options": [
                  {
                    "value": "展示"
                  },
                  {
                    "value": "告知"
                  },
                  {
                    "value": "混合"
                  }
                ],
                "display": "flex"
              }
            ]
          },
          {
            "type": "card",
            "title": "侧重点",
            "class": "space-y-4",
            "children": [
              {
                "key": "senses",
                "label": "五感",
                "type": "multi",
                "options": [
                  {
                    "value": "视觉"
                  },
                  {
                    "value": "听觉"
                  },
                  {
                    "value": "嗅觉"
                  },
                  {
                    "value": "味觉"
                  },
                  {
                    "value": "触觉"
                  }
                ],
                "display": "flex"
              },
              {
                "key": "character",
                "label": "人物描写",
                "type": "multi",
                "options": [
                  {
                    "value": "神态/微表情"
                  },
                  {
                    "value": "动作/小动作"
                  },
                  {
                    "value": "心理/内心独白"
                  },
                  {
                    "value": "语言/语气"
                  }
                ],
                "display": "flex"
              },
              {
                "key": "environment",
                "label": "环境描写",
                "type": "multi",
                "options": [
                  {
                    "value": "空间/陈设",
                    "description": "精细化描写空间布局和物品陈设，烘托场景氛围"
                  },
                  {
                    "value": "光影/天气",
                    "description": "强化光影变化与天气对氛围的烘托作用"
                  },
                  {
                    "value": "气味/声音",
                    "description": "利用环境中的气味与环境音增强场景真实感"
                  }
                ],
                "display": "flex"
              }
            ]
          }
        ]
      },
      {
        "type": "tabs",
        "title": "高级设置",
        "children": [
          {
            "key": "rhetoric",
            "label": "修辞",
            "type": "single",
            "options": [
              {
                "value": "可多用比喻/拟人"
              },
              {
                "value": "偏白描/克制"
              },
              {
                "value": "适度排比"
              }
            ],
            "display": "flex",
            "noLabel": true
          },
          {
            "key": "timeVariation",
            "label": "时间感与节奏变奏",
            "type": "toggle",
            "display": "between"
          },
          {
            "key": "contrastInsertion",
            "label": "对比/反差插入",
            "type": "toggle",
            "display": "between"
          }
        ]
      }
    ],
    "fields": [
      {
        "key": "name",
        "label": "规则名称",
        "type": "text",
        "placeholder": "如：口语化→书面化"
      },
      {
        "key": "description",
        "label": "规则描述",
        "type": "text",
        "placeholder": "简单描述这个规则的作用"
      },
      {
        "key": "prompt",
        "label": "自定义补充说明",
        "type": "longtext",
        "placeholder": "在此补充额外的润色要求...",
        "maxLength": 1000,
        "className": "col-span-full"
      },
      {
        "key": "pace",
        "label": "节奏",
        "type": "single",
        "options": [
          {
            "value": "快"
          },
          {
            "value": "中"
          },
          {
            "value": "慢"
          }
        ],
        "display": "flex"
      },
      {
        "key": "mood",
        "label": "情绪 / 氛围",
        "type": "multi",
        "options": [
          {
            "value": "紧张"
          },
          {
            "value": "压抑"
          },
          {
            "value": "温馨"
          },
          {
            "value": "荒诞"
          },
          {
            "value": "沉重"
          },
          {
            "value": "轻松"
          },
          {
            "value": "悬疑"
          },
          {
            "value": "悲怆"
          }
        ],
        "max": 2,
        "display": "flex"
      },
      {
        "key": "narrative",
        "label": "叙事手法",
        "type": "single",
        "options": [
          {
            "value": "展示"
          },
          {
            "value": "告知"
          },
          {
            "value": "混合"
          }
        ],
        "display": "flex"
      },
      {
        "key": "senses",
        "label": "五感",
        "type": "multi",
        "options": [
          {
            "value": "视觉"
          },
          {
            "value": "听觉"
          },
          {
            "value": "嗅觉"
          },
          {
            "value": "味觉"
          },
          {
            "value": "触觉"
          }
        ],
        "display": "flex"
      },
      {
        "key": "character",
        "label": "人物描写",
        "type": "multi",
        "options": [
          {
            "value": "神态/微表情"
          },
          {
            "value": "动作/小动作"
          },
          {
            "value": "心理/内心独白"
          },
          {
            "value": "语言/语气"
          }
        ],
        "display": "flex"
      },
      {
        "key": "environment",
        "label": "环境描写",
        "type": "multi",
        "options": [
          {
            "value": "空间/陈设",
            "description": "精细化描写空间布局和物品陈设，烘托场景氛围"
          },
          {
            "value": "光影/天气",
            "description": "强化光影变化与天气对氛围的烘托作用"
          },
          {
            "value": "气味/声音",
            "description": "利用环境中的气味与环境音增强场景真实感"
          }
        ],
        "display": "flex"
      },
      {
        "key": "rhetoric",
        "label": "修辞",
        "type": "single",
        "options": [
          {
            "value": "可多用比喻/拟人"
          },
          {
            "value": "偏白描/克制"
          },
          {
            "value": "适度排比"
          }
        ],
        "display": "flex",
        "noLabel": true
      },
      {
        "key": "timeVariation",
        "label": "时间感与节奏变奏",
        "type": "toggle",
        "display": "between"
      },
      {
        "key": "contrastInsertion",
        "label": "对比/反差插入",
        "type": "toggle",
        "display": "between"
      }
    ]
  },
  "polish-sample": {
    "entity": "PolishSample",
    "sections": [
      {
        "type": "card",
        "title": "基本信息",
        "icon": "FileText",
        "class": "grid grid-cols-2 gap-4",
        "children": [
          {
            "key": "name",
            "label": "样本标题",
            "type": "text",
            "placeholder": "如：Boss 战节奏范本"
          },
          {
            "key": "prompt",
            "label": "提示/注释",
            "type": "text",
            "placeholder": "对样本的写作要点说明"
          }
        ]
      },
      {
        "type": "card",
        "title": "样本内容",
        "class": "space-y-3",
        "children": [
          {
            "key": "sceneType",
            "label": "场景类型",
            "type": "single",
            "options": [
              {
                "value": "战斗",
                "icon": "Swords",
                "color": "red"
              },
              {
                "value": "对话",
                "icon": "MessageSquare",
                "color": "sky"
              },
              {
                "value": "环境",
                "icon": "Trees",
                "color": "emerald"
              },
              {
                "value": "心理",
                "icon": "Brain",
                "color": "violet"
              },
              {
                "value": "其他",
                "icon": "Layers",
                "color": "default"
              }
            ],
            "display": "flex"
          },
          {
            "key": "text",
            "label": "样本正文",
            "type": "longtext",
            "placeholder": "粘贴样本正文（不超过 600 字）...",
            "maxLength": 600
          },
          {
            "key": "isNegative",
            "label": "设为反例（请避免的风格）",
            "type": "toggle",
            "display": "between"
          }
        ]
      }
    ],
    "fields": [
      {
        "key": "name",
        "label": "样本标题",
        "type": "text",
        "placeholder": "如：Boss 战节奏范本"
      },
      {
        "key": "prompt",
        "label": "提示/注释",
        "type": "text",
        "placeholder": "对样本的写作要点说明"
      },
      {
        "key": "sceneType",
        "label": "场景类型",
        "type": "single",
        "options": [
          {
            "value": "战斗",
            "icon": "Swords",
            "color": "red"
          },
          {
            "value": "对话",
            "icon": "MessageSquare",
            "color": "sky"
          },
          {
            "value": "环境",
            "icon": "Trees",
            "color": "emerald"
          },
          {
            "value": "心理",
            "icon": "Brain",
            "color": "violet"
          },
          {
            "value": "其他",
            "icon": "Layers",
            "color": "default"
          }
        ],
        "display": "flex"
      },
      {
        "key": "text",
        "label": "样本正文",
        "type": "longtext",
        "placeholder": "粘贴样本正文（不超过 600 字）...",
        "maxLength": 600
      },
      {
        "key": "isNegative",
        "label": "设为反例（请避免的风格）",
        "type": "toggle",
        "display": "between"
      }
    ]
  }
};

export const ALL_OPTIONS: Record<ConfigEntity, ConfigOption[]> = {
  "novel": [
    {
      "value": "连载中",
      "icon": "Zap",
      "color": "primary"
    },
    {
      "value": "已完结",
      "icon": "CircleCheck",
      "color": "success"
    },
    {
      "value": "暂停",
      "icon": "Clock",
      "color": "warn"
    },
    {
      "value": "玄幻",
      "icon": "Sparkles"
    },
    {
      "value": "仙侠",
      "icon": "BookMarked"
    },
    {
      "value": "科幻",
      "icon": "Rocket"
    },
    {
      "value": "都市",
      "icon": "Building2"
    },
    {
      "value": "言情",
      "icon": "Heart"
    },
    {
      "value": "历史",
      "icon": "Book"
    },
    {
      "value": "悬疑",
      "icon": "Search"
    },
    {
      "value": "奇幻",
      "icon": "Wand2"
    },
    {
      "value": "武侠",
      "icon": "Sword"
    },
    {
      "value": "军事",
      "icon": "Shield"
    },
    {
      "value": "游戏",
      "icon": "Gamepad2"
    },
    {
      "value": "现实",
      "icon": "Globe"
    },
    {
      "value": "古龙体",
      "icon": "Sword",
      "description": "短句为主，多用对仗与排比，留白极多。善用极简动作描写刻画人物，气氛冷峻肃杀。对话干脆利落，常用一句一段制造节奏感。环境描写点到为止，重视意境胜过细节铺陈。"
    },
    {
      "value": "金庸体",
      "icon": "ScrollText",
      "description": "文笔典雅厚重，融入古典诗词与历史典故。武功描写细腻生动，招式名目考究。叙事稳健，重情节跌宕与人物群像。对话贴合身份，方言与文言点缀其间。"
    },
    {
      "value": "网文爽文体",
      "icon": "Moon",
      "description": "节奏明快，多用短段落与断句制造阅读爽感。重冲突推进与情绪爆发，常以悬念钩子收尾。心理活动直白，金手指与系统提示穿插其中。环境描写服务于氛围渲染，不冗长。"
    },
    {
      "value": "传统文学体",
      "icon": "BookOpen",
      "description": "语言凝练考究，长句与短句交替。重心理刻画与环境烘托，叙事节奏舒缓。多用隐喻与象征，留有阐释空间。对话含蓄，潜台词丰富。"
    },
    {
      "value": "王朔体",
      "icon": "Theater",
      "description": "京味口语化，调侃与反讽贯穿始终。叙述者带着戏谑距离感，正经话用痞气说。对话密集，机锋暗藏，常以插科打诨解构严肃。"
    },
    {
      "value": "余华体",
      "icon": "Wind",
      "description": "冷峻克制，近乎零度叙事。情感不外露，靠白描动作与事件传递力量。语言朴素洗练，重复句式制造节奏。苦难叙事中带荒诞感。"
    },
    {
      "value": "意识流体",
      "icon": "Waves",
      "description": "长句流动，心理活动与外部事件交织。时间非线性跳跃，记忆与当下叠印。感官细节浓密，主观感受压倒客观描写。"
    },
    {
      "value": "极简白描体",
      "icon": "Zap",
      "description": "动词驱动，形容词极省。场景靠动作与对话搭建，不写情绪只写行为。句子短，信息密度高，留白由读者填充。"
    },
    {
      "value": "影视画面体",
      "icon": "Palette",
      "description": "强烈的镜头感，场景切换明确。重视觉细节与运动描写，对话简短承担叙事。氛围渲染浓墨重彩，节奏快慢有度。"
    },
    {
      "value": "散文诗体",
      "icon": "Feather",
      "description": "文笔优美抒情，节奏舒缓如歌。意象密集，修辞丰富，重视氛围与情绪渲染。叙事弱化，意境至上。"
    },
    {
      "value": "克苏鲁翻译体",
      "icon": "Snowflake",
      "description": "欧化长句，形容词堆叠密集。常以'不可名状''亵渎''癫狂'等词渲染未知恐惧。叙述者神经质，反复强调恐惧与无力感。"
    },
    {
      "value": "番剧轻小说体",
      "icon": "MessageSquare",
      "description": "对话密集，吐槽与内心戏穿插。短段落为主，常用括号补足心理活动。角色声口鲜明，节奏轻快，二次元梗自然嵌入。"
    },
    {
      "value": "沉郁黑暗",
      "icon": "Moon",
      "description": "压抑、阴郁、道德灰色，适合末世/克苏鲁/暗黑奇幻"
    },
    {
      "value": "轻松幽默",
      "icon": "Laugh",
      "description": "调侃、戏谑、反差萌，适合都市/轻小说/吐槽向"
    },
    {
      "value": "悬疑紧张",
      "icon": "SearchX",
      "description": "节奏紧、伏笔多、信息差，适合推理/惊悚/谍战"
    },
    {
      "value": "史诗宏大",
      "icon": "Crown",
      "description": "苍凉、厚重、格局感，适合史诗奇幻/历史/战争"
    },
    {
      "value": "温馨治愈",
      "icon": "Sun",
      "description": "温暖、治愈、日常感，适合治愈/日常/言情甜文"
    },
    {
      "value": "热血激昂",
      "icon": "Flame",
      "description": "高燃、爆发、爽感，适合玄幻/竞技/少年漫"
    },
    {
      "value": "哀伤悲剧",
      "icon": "HeartBroken",
      "description": "宿命感、悲剧美学，适合虐文/古风悲剧"
    },
    {
      "value": "荒诞戏谑",
      "icon": "CircleDot",
      "description": "黑色幽默、解构、反套路，适合后现代/讽刺"
    },
    {
      "value": "唯美浪漫",
      "icon": "Heart",
      "description": "唯美、抒情、氛围感，适合言情/古风/青春"
    },
    {
      "value": "冷峻克制",
      "icon": "Scissors",
      "description": "零度叙事、白描、克制，适合严肃文学/悬疑"
    },
    {
      "value": "诡谲神秘",
      "icon": "Ghost",
      "description": "诡异、神秘、不安感，适合克苏鲁/民俗恐怖"
    },
    {
      "value": "诙谐反讽",
      "icon": "Face",
      "description": "讽刺、调侃、社会批判，适合讽刺小说/王朔体"
    },
    {
      "value": "沉郁黑暗",
      "icon": "Moon",
      "description": "压抑、阴郁、道德灰色，适合末世/克苏鲁/暗黑奇幻"
    },
    {
      "value": "轻松幽默",
      "icon": "Laugh",
      "description": "调侃、戏谑、反差萌，适合都市/轻小说/吐槽向"
    },
    {
      "value": "悬疑紧张",
      "icon": "SearchX",
      "description": "节奏紧、伏笔多、信息差，适合推理/惊悚/谍战"
    },
    {
      "value": "史诗宏大",
      "icon": "Crown",
      "description": "苍凉、厚重、格局感，适合史诗奇幻/历史/战争"
    },
    {
      "value": "温馨治愈",
      "icon": "Sun",
      "description": "温暖、治愈、日常感，适合治愈/日常/言情甜文"
    },
    {
      "value": "热血激昂",
      "icon": "Flame",
      "description": "高燃、爆发、爽感，适合玄幻/竞技/少年漫"
    },
    {
      "value": "哀伤悲剧",
      "icon": "HeartBroken",
      "description": "宿命感、悲剧美学，适合虐文/古风悲剧"
    },
    {
      "value": "荒诞戏谑",
      "icon": "CircleDot",
      "description": "黑色幽默、解构、反套路，适合后现代/讽刺"
    },
    {
      "value": "唯美浪漫",
      "icon": "Heart",
      "description": "唯美、抒情、氛围感，适合言情/古风/青春"
    },
    {
      "value": "冷峻克制",
      "icon": "Scissors",
      "description": "零度叙事、白描、克制，适合严肃文学/悬疑"
    },
    {
      "value": "诡谲神秘",
      "icon": "Ghost",
      "description": "诡异、神秘、不安感，适合克苏鲁/民俗恐怖"
    },
    {
      "value": "诙谐反讽",
      "icon": "Face",
      "description": "讽刺、调侃、社会批判，适合讽刺小说/王朔体"
    },
    {
      "value": "架空修仙",
      "icon": "Sparkles",
      "description": "灵气/功法/境界/宗门"
    },
    {
      "value": "都市现实",
      "icon": "Building2",
      "description": "现代都市背景"
    },
    {
      "value": "星际科幻",
      "icon": "Rocket",
      "description": "太空/星际/科技"
    },
    {
      "value": "西幻魔法",
      "icon": "Wand2",
      "description": "魔法/种族/神祇"
    },
    {
      "value": "末日废土",
      "icon": "Skull",
      "description": "灾难后/生存"
    },
    {
      "value": "历史架空",
      "icon": "Book",
      "description": "真实历史+虚构"
    },
    {
      "value": "赛博朋克",
      "icon": "Cpu",
      "description": "高科技低生活"
    },
    {
      "value": "东方玄幻",
      "icon": "Dragon",
      "description": "洪荒/神话/山海经"
    },
    {
      "value": "大陆",
      "icon": "Map"
    },
    {
      "value": "群岛",
      "icon": "Waves"
    },
    {
      "value": "星球",
      "icon": "Globe"
    },
    {
      "value": "星系",
      "icon": "Orbit"
    },
    {
      "value": "多重位面",
      "icon": "Layers"
    }
  ],
  "character": [
    {
      "value": "男",
      "icon": "Mars"
    },
    {
      "value": "女",
      "icon": "Venus"
    },
    {
      "value": "主角",
      "icon": "Star",
      "color": "primary"
    },
    {
      "value": "配角",
      "icon": "Users",
      "color": "neutral"
    },
    {
      "value": "反派",
      "icon": "Skull",
      "color": "danger"
    },
    {
      "value": "成熟克制",
      "icon": "ShieldCheck"
    },
    {
      "value": "笨拙",
      "icon": "TriangleAlert"
    },
    {
      "value": "热烈",
      "icon": "Flame"
    },
    {
      "value": "压抑",
      "icon": "CloudRain"
    },
    {
      "value": "回避",
      "icon": "ArrowBigLeftDash"
    },
    {
      "value": "英雄",
      "icon": "Shield",
      "description": "故事核心推动者，为达成目标直面终极挑战，并愿意为集体利益做出关键牺牲。"
    },
    {
      "value": "导师",
      "icon": "GraduationCap",
      "description": "向英雄提供智慧、装备、训练或精神指引的引导者，通常在前期登场，后期退场或升华。"
    },
    {
      "value": "信使",
      "icon": "Mail",
      "description": "带来外部消息、发布冒险召唤、打破主角平静日常的角色。"
    },
    {
      "value": "变形者",
      "icon": "Sparkles",
      "description": "立场、忠诚度或真实身份模糊不定的角色，制造悬念、怀疑与戏剧翻转。"
    },
    {
      "value": "阴影",
      "icon": "Skull",
      "description": "与英雄核心价值观或目标直接对立的终极反派。"
    },
    {
      "value": "伙伴",
      "icon": "Users",
      "description": "英雄的同行者，提供情感支持、战力互补或功能辅助。"
    },
    {
      "value": "骗徒",
      "icon": "Theater",
      "description": "以狡黠、幽默或非正当手段搅动局势的角色，常打破常规逻辑。"
    },
    {
      "value": "边界守卫",
      "icon": "DoorOpen",
      "description": "把守每一道关卡的测试者，负责筛选英雄资格。"
    },
    {
      "value": "天真者",
      "icon": "Heart",
      "description": "追求安全与简单，赤子之心，相信世界本善。"
    },
    {
      "value": "孤儿",
      "icon": "Home",
      "description": "追求归属与连接，学会在残酷现实中依靠同伴。"
    },
    {
      "value": "战士",
      "icon": "Sword",
      "description": "追求胜利与征服，勇猛与纪律，以钢铁意志击溃障碍。"
    },
    {
      "value": "照顾者",
      "icon": "Hand",
      "description": "追求奉献与保护，利他母性，以滋养他人为最高价值。"
    },
    {
      "value": "探索者",
      "icon": "Compass",
      "description": "追求自由与真理，不安于现状，抗拒被困。"
    },
    {
      "value": "爱人",
      "icon": "Heart",
      "description": "追求亲密与激情，强烈的感官与情感连接。"
    },
    {
      "value": "叛逆者",
      "icon": "Flag",
      "description": "追求颠覆与变革，对旧秩序的愤怒，以打破枷锁为使命。"
    },
    {
      "value": "创造者",
      "icon": "Palette",
      "description": "追求创新与自我表达，将内心幻景具象化。"
    },
    {
      "value": "愚者",
      "icon": "PartyPopper",
      "description": "追求快乐与趣味，用幽默解构严肃，活在当下。"
    },
    {
      "value": "统治者",
      "icon": "Crown",
      "description": "追求秩序与控制，责任与力量，渴望建立稳固的体系。"
    },
    {
      "value": "魔术师",
      "icon": "Wand2",
      "description": "追求转化与洞察，掌握深层规律，将愿景转化为现实。"
    },
    {
      "value": "贤者",
      "icon": "BookOpen",
      "description": "追求真理与智慧，无尽的好奇心，以认知世界为乐。"
    }
  ],
  "outline": [
    {
      "value": "planned",
      "label": "已规划",
      "icon": "Calendar",
      "color": "neutral"
    },
    {
      "value": "in_progress",
      "label": "进行中",
      "icon": "Pen",
      "color": "primary"
    },
    {
      "value": "completed",
      "label": "已完成",
      "icon": "CheckCircle",
      "color": "success"
    },
    {
      "value": "沉郁黑暗",
      "icon": "Moon",
      "description": "压抑、阴郁、道德灰色，适合末世/克苏鲁/暗黑奇幻"
    },
    {
      "value": "轻松幽默",
      "icon": "Laugh",
      "description": "调侃、戏谑、反差萌，适合都市/轻小说/吐槽向"
    },
    {
      "value": "悬疑紧张",
      "icon": "SearchX",
      "description": "节奏紧、伏笔多、信息差，适合推理/惊悚/谍战"
    },
    {
      "value": "史诗宏大",
      "icon": "Crown",
      "description": "苍凉、厚重、格局感，适合史诗奇幻/历史/战争"
    },
    {
      "value": "温馨治愈",
      "icon": "Sun",
      "description": "温暖、治愈、日常感，适合治愈/日常/言情甜文"
    },
    {
      "value": "热血激昂",
      "icon": "Flame",
      "description": "高燃、爆发、爽感，适合玄幻/竞技/少年漫"
    },
    {
      "value": "哀伤悲剧",
      "icon": "HeartBroken",
      "description": "宿命感、悲剧美学，适合虐文/古风悲剧"
    },
    {
      "value": "荒诞戏谑",
      "icon": "CircleDot",
      "description": "黑色幽默、解构、反套路，适合后现代/讽刺"
    },
    {
      "value": "唯美浪漫",
      "icon": "Heart",
      "description": "唯美、抒情、氛围感，适合言情/古风/青春"
    },
    {
      "value": "冷峻克制",
      "icon": "Scissors",
      "description": "零度叙事、白描、克制，适合严肃文学/悬疑"
    },
    {
      "value": "诡谲神秘",
      "icon": "Ghost",
      "description": "诡异、神秘、不安感，适合克苏鲁/民俗恐怖"
    },
    {
      "value": "诙谐反讽",
      "icon": "Face",
      "description": "讽刺、调侃、社会批判，适合讽刺小说/王朔体"
    }
  ],
  "polish-rule": [
    {
      "value": "快"
    },
    {
      "value": "中"
    },
    {
      "value": "慢"
    },
    {
      "value": "紧张"
    },
    {
      "value": "压抑"
    },
    {
      "value": "温馨"
    },
    {
      "value": "荒诞"
    },
    {
      "value": "沉重"
    },
    {
      "value": "轻松"
    },
    {
      "value": "悬疑"
    },
    {
      "value": "悲怆"
    },
    {
      "value": "展示"
    },
    {
      "value": "告知"
    },
    {
      "value": "混合"
    },
    {
      "value": "视觉"
    },
    {
      "value": "听觉"
    },
    {
      "value": "嗅觉"
    },
    {
      "value": "味觉"
    },
    {
      "value": "触觉"
    },
    {
      "value": "神态/微表情"
    },
    {
      "value": "动作/小动作"
    },
    {
      "value": "心理/内心独白"
    },
    {
      "value": "语言/语气"
    },
    {
      "value": "空间/陈设",
      "description": "精细化描写空间布局和物品陈设，烘托场景氛围"
    },
    {
      "value": "光影/天气",
      "description": "强化光影变化与天气对氛围的烘托作用"
    },
    {
      "value": "气味/声音",
      "description": "利用环境中的气味与环境音增强场景真实感"
    },
    {
      "value": "可多用比喻/拟人"
    },
    {
      "value": "偏白描/克制"
    },
    {
      "value": "适度排比"
    }
  ],
  "polish-sample": [
    {
      "value": "战斗",
      "icon": "Swords",
      "color": "red"
    },
    {
      "value": "对话",
      "icon": "MessageSquare",
      "color": "sky"
    },
    {
      "value": "环境",
      "icon": "Trees",
      "color": "emerald"
    },
    {
      "value": "心理",
      "icon": "Brain",
      "color": "violet"
    },
    {
      "value": "其他",
      "icon": "Layers",
      "color": "default"
    }
  ]
};

/** 根据 value 在指定实体中查找 ConfigOption */
export function findOptionInConfig(entity: ConfigEntity, value: string): ConfigOption | undefined {
  const options = ALL_OPTIONS[entity];
  if (!options) return undefined;
  return options.find((o) => o.value === value);
}
