import {
  Shield,
  GraduationCap,
  Mail,
  Sparkles,
  Skull,
  Users,
  Theater,
  DoorOpen,
  Heart,
  Home,
  Sword,
  Hand,
  Compass,
  Flag,
  Palette,
  PartyPopper,
  Crown,
  Wand2,
  BookOpen,
  ShieldCheck,
  TriangleAlert,
  Flame,
  CloudRain,
  ArrowBigLeftDash,
} from "lucide-react"

export interface ArchetypeOption {
  label: string
  name: string
  description: string
}

// 原型图标映射（叙事功能 + 内在动机共用）
export const archetypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  // 叙事功能原型
  Hero: Shield,
  Mentor: GraduationCap,
  Herald: Mail,
  Shapeshifter: Sparkles,
  Shadow: Skull,
  Ally: Users,
  Trickster: Theater,
  "Threshold Guardian": DoorOpen,
  // 内在动机原型
  Innocent: Heart,
  Orphan: Home,
  Warrior: Sword,
  Caregiver: Hand,
  Seeker: Compass,
  Lover: Heart,
  Rebel: Flag,
  Creator: Palette,
  Jester: PartyPopper,
  Ruler: Crown,
  Magician: Wand2,
  Sage: BookOpen,
}

export const narrativeFunctionOptions: ArchetypeOption[] = [
  { label: "英雄", name: "Hero", description: "故事核心推动者，为达成目标直面终极挑战，并愿意为集体利益做出关键牺牲。" },
  { label: "导师", name: "Mentor", description: "向英雄提供智慧、装备、训练或精神指引的引导者，通常在前期登场，后期退场或升华。" },
  { label: "信使", name: "Herald", description: "带来外部消息、发布冒险召唤、打破主角平静日常的角色。本身未必重要，但信号意义重大。" },
  { label: "变形者", name: "Shapeshifter", description: "立场、忠诚度或真实身份模糊不定的角色，制造悬念、怀疑与戏剧翻转。" },
  { label: "阴影", name: "Shadow", description: "与英雄核心价值观或目标直接对立的终极反派，代表英雄内心最恐惧的黑暗面。" },
  { label: "伙伴", name: "Ally", description: "英雄的同行者，提供情感支持、战力互补或功能辅助，常通过对话衬托英雄性格。" },
  { label: "骗徒", name: "Trickster", description: "以狡黠、幽默或非正当手段搅动局势的角色，常打破常规逻辑，制造意外转折或喜剧效果。" },
  { label: "边界守卫", name: "Threshold Guardian", description: "把守每一道关卡的测试者，负责筛选英雄资格。并非最终敌人，而是必须跨越的阶段性阻碍。" },
]

export const innerMotivationOptions: ArchetypeOption[] = [
  { label: "天真者", name: "Innocent", description: "追求安全与简单，赤子之心，相信世界本善，渴望拯救或重返'伊甸园'。" },
  { label: "孤儿", name: "Orphan", description: "追求归属与连接，学会在残酷现实中依靠同伴、坚韧生存。" },
  { label: "战士", name: "Warrior", description: "追求胜利与征服，勇猛与纪律，以钢铁意志击溃一切挡在前方的障碍。" },
  { label: "照顾者", name: "Caregiver", description: "追求奉献与保护，利他母性，以滋养他人、牺牲自我为最高价值。" },
  { label: "探索者", name: "Seeker", description: "追求自由与真理，不安于现状，抗拒被困，永远在寻找更理想的精神或地理疆域。" },
  { label: "爱人", name: "Lover", description: "追求亲密与激情，强烈的感官与情感连接，渴望在关系或热爱的事物中达成融合。" },
  { label: "叛逆者", name: "Rebel", description: "追求颠覆与变革，对旧秩序的愤怒，以打破枷锁、重塑规则为使命。" },
  { label: "创造者", name: "Creator", description: "追求创新与自我表达，将内心幻景具象化，厌恶重复，渴望留下独特的作品。" },
  { label: "愚者", name: "Jester", description: "追求快乐与趣味，用幽默解构严肃，活在当下" },
  { label: "统治者", name: "Ruler", description: "追求秩序与控制，责任与力量，渴望建立稳固的体系并承担管理之责。" },
  { label: "魔术师", name: "Magician", description: "追求转化与洞察，掌握深层规律，渴望将愿景转化为现实，促成根本性改变。" },
  { label: "贤者", name: "Sage", description: "追求真理与智慧，无尽的好奇心，以认知世界、传播知识、洞悉本质为乐。" },
]

export const emotionOptions = [
  { value: "成熟克制", icon: ShieldCheck },
  { value: "笨拙", icon: TriangleAlert },
  { value: "热烈", icon: Flame },
  { value: "压抑", icon: CloudRain },
  { value: "回避", icon: ArrowBigLeftDash },
]