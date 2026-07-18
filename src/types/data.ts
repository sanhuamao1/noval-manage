import type {
  NovelConfig,
  CharacterConfig,
  OutlineConfig,
  PolishRuleConfig,
  PolishSampleConfig,
  OrganizationConfig,
  LocationConfig,
} from "@/types/entityConfig";

/** API 返回的小说数据 = 可编辑配置 + 系统字段 */
export interface NovelData extends Omit<NovelConfig, "description"> {
  id: string;
  /** API 保证 title 必返 */
  title: string;
  /** API 中 description 为 null（数据库层面），编辑器中为 undefined */
  description: string | null;
  wordCount?: number;
  _count?: { chapters: number; characters: number };
  createdAt: string;
  updatedAt: string;
}

/** API 返回的角色数据 = 可编辑配置 + 系统字段 */
export interface CharacterData extends Omit<CharacterConfig, "name"> {
  id: string;
  /** API 保证 name 必返 */
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的提纲数据 = 可编辑配置 + 系统字段 */
export interface OutlineData extends Omit<OutlineConfig, "name"> {
  id: string;
  /** API 保证 name 必返 */
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的润色规则数据 = 可编辑配置 + 系统字段 */
export interface PolishRuleData extends Omit<PolishRuleConfig, "description"> {
  id: string;
  name: string;
  description: string | null;
  prompt: string;
  useCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的润色样本数据 = 可编辑配置 + 系统字段 */
export interface PolishSampleData extends Omit<PolishSampleConfig, "prompt"> {
  id: string;
  name: string;
  prompt: string;
  useCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的组织数据 = 可编辑配置 + 系统字段 */
export interface OrganizationData extends Omit<OrganizationConfig, "name"> {
  id: string;
  /** API 保证 name 必返 */
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的地点数据 = 可编辑配置 + 系统字段 */
export interface LocationData extends Omit<LocationConfig, "name"> {
  id: string;
  /** API 保证 name 必返 */
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 章节列表项（不含正文内容） */
export interface ChapterSummary {
  id: string;
  title: string;
  status: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** 完整章节数据（含正文） */
export interface Chapter extends ChapterSummary {
  content: string;
  relatedCharacters: string | null;
}
