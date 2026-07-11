import {
  buildDefaultValues,
  flattenFields,
  type ConfigOf,
  type ConfigOption,
  type ConfigSection,
} from "@/lib/configs/config-utils";

// ─── 性别选项 ───

const genderOptions: ConfigOption[] = [
  { value: "男", icon: "Mars" },
  { value: "女", icon: "Venus" },
];

// ─── 情感表达选项 ───

const emotionOptions: ConfigOption[] = [
  { value: "成熟克制", icon: "ShieldCheck" },
  { value: "笨拙", icon: "TriangleAlert" },
  { value: "热烈", icon: "Flame" },
  { value: "压抑", icon: "CloudRain" },
  { value: "回避", icon: "ArrowBigLeftDash" },
];

// ─── 叙事功能原型（沃格勒体系）───

const narrativeFunctionOptions: ConfigOption[] = [
  { value: "英雄", icon: "Shield", description: "故事核心推动者，为达成目标直面终极挑战，并愿意为集体利益做出关键牺牲。" },
  { value: "导师", icon: "GraduationCap", description: "向英雄提供智慧、装备、训练或精神指引的引导者，通常在前期登场，后期退场或升华。" },
  { value: "信使", icon: "Mail", description: "带来外部消息、发布冒险召唤、打破主角平静日常的角色。" },
  { value: "变形者", icon: "Sparkles", description: "立场、忠诚度或真实身份模糊不定的角色，制造悬念、怀疑与戏剧翻转。" },
  { value: "阴影", icon: "Skull", description: "与英雄核心价值观或目标直接对立的终极反派。" },
  { value: "伙伴", icon: "Users", description: "英雄的同行者，提供情感支持、战力互补或功能辅助。" },
  { value: "骗徒", icon: "Theater", description: "以狡黠、幽默或非正当手段搅动局势的角色，常打破常规逻辑。" },
  { value: "边界守卫", icon: "DoorOpen", description: "把守每一道关卡的测试者，负责筛选英雄资格。" },
];

// ─── 内在动机原型（皮尔逊体系）───

const innerMotivationOptions: ConfigOption[] = [
  { value: "天真者", icon: "Heart", description: "追求安全与简单，赤子之心，相信世界本善。" },
  { value: "孤儿", icon: "Home", description: "追求归属与连接，学会在残酷现实中依靠同伴。" },
  { value: "战士", icon: "Sword", description: "追求胜利与征服，勇猛与纪律，以钢铁意志击溃障碍。" },
  { value: "照顾者", icon: "Hand", description: "追求奉献与保护，利他母性，以滋养他人为最高价值。" },
  { value: "探索者", icon: "Compass", description: "追求自由与真理，不安于现状，抗拒被困。" },
  { value: "爱人", icon: "Heart", description: "追求亲密与激情，强烈的感官与情感连接。" },
  { value: "叛逆者", icon: "Flag", description: "追求颠覆与变革，对旧秩序的愤怒，以打破枷锁为使命。" },
  { value: "创造者", icon: "Palette", description: "追求创新与自我表达，将内心幻景具象化。" },
  { value: "愚者", icon: "PartyPopper", description: "追求快乐与趣味，用幽默解构严肃，活在当下。" },
  { value: "统治者", icon: "Crown", description: "追求秩序与控制，责任与力量，渴望建立稳固的体系。" },
  { value: "魔术师", icon: "Wand2", description: "追求转化与洞察，掌握深层规律，将愿景转化为现实。" },
  { value: "贤者", icon: "BookOpen", description: "追求真理与智慧，无尽的好奇心，以认知世界为乐。" },
];

// ─── 配置定义（单一数据源） ───

export const CHARACTER_CONFIG_SECTIONS: ConfigSection[] = [
  {
    type: "grid",
    cols: 3,
    sections: [
      {
        type: "grid",
        colspan: 2,
        cols: 1,
        sections: [
          {
            type: "card",
            title: "角色名称",
            icon: "UserRound",
            titleKey: "name",
            titleEditable: true,
            class: "grid grid-cols-2 gap-3",
            children: [
              { key: "gender", label: "性别", type: "single", options: genderOptions, display: "flex" },
              { key: "age", label: "年龄", type: "text", placeholder: "如：25岁" },
              { key: "identity", label: "身份", type: "text", placeholder: "身份/职业/组织归属" },
              { key: "item", label: "标志性物件", type: "text", placeholder: "一件有故事的随身物品" },
              { key: "coreConflict", label: "核心矛盾", type: "text", placeholder: "一句话概括" },
              { key: "emotionExpression", label: "情感表达方式", type: "single", options: emotionOptions, display: "flex", className: "col-span-full" },
            ],
          },
          {
            type: "tabs",
            title: "能力与关系",
            children: [
              {
                key: "abilities",
                label: "能力",
                noLabel: true,
                type: "list",
                subFields: [
                  { placeholder: "擅长什么", width: "w-1/3" },
                  { placeholder: "具体表现", width: "flex-1" },
                ],
              },
              {
                key: "growthArcs",
                label: "成长弧光",
                noLabel: true,
                type: "list",
                subFields: [
                  { placeholder: "缺陷", width: "w-1/4" },
                  { placeholder: "表现", width: "w-1/3" },
                  { placeholder: "成长方向", width: "w-1/3" },
                ],
              },
              {
                key: "relationships",
                label: "关系网络",
                type: "list",
                noLabel: true,
                subFields: [
                  { placeholder: "角色姓名", width: "w-1/3" },
                  { placeholder: "与 TA 的关系", width: "flex-1" },
                ],
              },
              {
                key: "notes",
                label: "写作注意事项",
                noLabel: true,
                type: "list",
                subFields: [
                  { placeholder: "标签", width: "w-1/3" },
                  { placeholder: "内容", width: "flex-1" },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "grid",
        colspan: 1,
        cols: 1,
        sections: [
          {
            type: "card",
            title: "叙事功能原型（沃格勒体系）",
            icon: "Shield",
            children: [
              {
                key: "narrativeFunction",
                label: "叙事功能原型",
                type: "multi",
                max: 3,
                options: narrativeFunctionOptions,
                display: "grid",
                noLabel: true,
                variant: "box",
              },
            ],
          },
          {
            type: "card",
            title: "内在动机原型（皮尔逊体系）",
            icon: "Heart",
            children: [
              {
                key: "innerMotivation",
                label: "内在动机原型",
                type: "multi",
                max: 3,
                options: innerMotivationOptions,
                display: "grid",
                noLabel: true,
                variant: "box",
              },
            ],
          },
        ],
      },
    ],
  },
];

// ─── 类型推导 ───

const _allCharacterFields = flattenFields(CHARACTER_CONFIG_SECTIONS);
export type CharacterConfig = ConfigOf<typeof _allCharacterFields> & { prompt?: string; name: string };

export const DEFAULT_CHARACTER_CONFIG: CharacterConfig = {
  ...buildDefaultValues(_allCharacterFields),
  name: "",
  notes: ["破局方式;", "关键行为模式;", "角色危险性或潜力;"],
};

// ─── 导出选项 ───

export { genderOptions, emotionOptions, narrativeFunctionOptions, innerMotivationOptions };
