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

/** 角色关系数据 */
export interface RelationData {
  /** 起点角色 ID */
  source: string;
  /** 终点角色 ID */
  target: string;
  /** 关系描述 */
  description: string;
}

/** 节点画布位置 */
export interface NodePosition {
  x: number;
  y: number;
}

/** relations 聚合数据：包含关系链接和节点位置 */
export interface RelationsData {
  links: RelationData[];
  positions: Record<string, NodePosition>;
}

// ===== Enrich Settings 操作类型 =====

/** 更改类型 */
export type ChangeType = "add" | "update" | "delete";

/** 允许的操作 API 白名单 */
export const ENRICH_API_WHITELIST = [
  "/api/characters",
  "/api/organizations",
  "/api/locations",
  "/api/relations/link",
] as const;

/** AI 生成的单个操作 */
export interface EnrichOperation {
  /** 更改类型 */
  changeType: ChangeType;
  /** 更改理由 */
  reason: string;
  /** 一行简述 */
  summary: string;
  /** 目标 API 路径 */
  api: string;
  /** HTTP 方法 */
  method: "POST" | "PUT" | "DELETE";
  /** 接口请求参数（update 时字段名直接从 params 的 key 取） */
  params: Record<string, unknown>;
}

/** API 返回体 */
export interface EnrichResult {
  operations: EnrichOperation[];
  analysis: string;
}
