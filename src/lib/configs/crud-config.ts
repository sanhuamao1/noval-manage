import { ConfigEntity } from "@/types";
import type { RefreshKey } from "@/stores/useNovelStore";

/**
 * 单个实体的 CRUD 元数据
 * 新增实体时在此表注册一行即可，无需在各页面重复样板逻辑
 */
export interface EntityCrudMeta {
  /** 全局 store 中的 key（用于读写数据 & mutate 刷新） */
  storeKey: RefreshKey;
  /** 删除确认对话框中显示的实体名称 */
  deleteLabel: string;
  /** 自定义 API 路径（默认 `/api/${storeKey}`） */
  apiPath?: string;
  /** API 是否需要在数据中附加 novelId（默认 true，设为 false 时不会注入 novelId） */
  needsNovelId?: boolean;
}

/**
 * ConfigEntity → CRUD 运行时配置 映射表
 *
 * @example
 * ```ts
 * const meta = ENTITY_CRUD_CONFIG[ConfigEntity.CHARACTER];
 * // { storeKey: "characters", deleteLabel: "人物" }
 * ```
 */
export const ENTITY_CRUD_CONFIG: Partial<Record<ConfigEntity, EntityCrudMeta>> = {
  [ConfigEntity.CHARACTER]: { storeKey: "characters", deleteLabel: "人物" },
  [ConfigEntity.ORGANIZATION]: { storeKey: "organizations", deleteLabel: "组织" },
  [ConfigEntity.LOCATION]: { storeKey: "locations", deleteLabel: "地点" },
  [ConfigEntity.OUTLINE]: { storeKey: "outlines", deleteLabel: "章节大纲" },
  [ConfigEntity.POLISH_RULE]: { storeKey: "polishRules", deleteLabel: "润色规则", apiPath: "/api/polish/rules", needsNovelId: false },
  [ConfigEntity.POLISH_SAMPLE]: { storeKey: "polishSamples", deleteLabel: "风格样本", apiPath: "/api/polish/samples", needsNovelId: false },
};

/** 获取实体 CRUD 配置，未注册时报错 */
export function getCrudMeta(entity: ConfigEntity): EntityCrudMeta {
  const meta = ENTITY_CRUD_CONFIG[entity];
  if (!meta) throw new Error(`Entity "${entity}" 未在 ENTITY_CRUD_CONFIG 中注册`);
  return meta;
}
