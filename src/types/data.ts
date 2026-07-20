/** API 返回的小说数据 = 可编辑配置 + 系统字段 */
export interface NovelData {
  id: string;
  /** API 保证 title 必返 */
  title: string;
  oneLineSummary?: string | null;
  /** API 中 description 为 null（数据库层面），编辑器中为 undefined */
  description: string | null;
  status?: string | null;
  genre?: string[];
  presetStyle?: string | null;
  primaryTone?: string | null;
  secondaryTones?: string[];
  worldShape?: string | null;
  wordCount?: number;
  _count?: { chapters: number; characters: number };
  createdAt: string;
  updatedAt: string;
}

/** API 返回的角色数据 = 可编辑配置 + 系统字段 */
export interface CharacterData {
  id: string;
  /** API 保证 name 必返 */
  name: string;
  gender?: string | null;
  role?: string | null;
  age?: string | null;
  identity?: string | null;
  item?: string | null;
  coreConflict?: string | null;
  surfaceGoal?: string | null;
  deepNeed?: string | null;
  emotionExpression?: string | null;
  abilities?: string[];
  growthArcs?: string[];
  notes?: string[];
  experience?: string[];
  narrativeFunction?: string[];
  innerMotivation?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的提纲数据 = 可编辑配置 + 系统字段 */
export interface OutlineData {
  id: string;
  /** API 保证 name 必返 */
  name: string;
  contentBrief?: string | null;
  contentDetail?: string | null;
  status?: string | null;
  timeline?: string | null;
  tone?: string | null;
  characterIds?: string[];
  locationIds?: string[];
  foreshadowingIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的润色规则数据 = 可编辑配置 + 系统字段 */
export interface PolishRuleData {
  id: string;
  name: string;
  description: string | null;
  prompt: string;
  pace?: string | null;
  mood?: string[];
  narrative?: string | null;
  senses?: string[];
  character?: string[];
  environment?: string[];
  rhetoric?: string | null;
  timeVariation?: boolean;
  contrastInsertion?: boolean;
  useCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的润色样本数据 = 可编辑配置 + 系统字段 */
export interface PolishSampleData {
  id: string;
  name: string;
  prompt: string;
  sceneType?: string | null;
  text?: string | null;
  isNegative?: boolean;
  useCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的组织数据 = 可编辑配置 + 系统字段 */
export interface OrganizationData {
  id: string;
  /** API 保证 name 必返 */
  name: string;
  description?: string | null;
  type?: string[];
  status?: string | null;
  foundingBackground?: string | null;
  founder?: string | null;
  currentLeader?: string | null;
  operationLogic?: string | null;
  structure?: string[];
  headquarters?: string[];
  members?: string[];
  opponents?: string[];
  mortalEnemies?: string[];
  allies?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的地点数据 = 可编辑配置 + 系统字段 */
export interface LocationData {
  id: string;
  /** API 保证 name 必返 */
  name: string;
  description?: string | null;
  locationType?: string[];
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

export interface FrameworkData {
  id: string;
  name: string;
  content: string;
}
