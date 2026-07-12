/**
 * 实体元数据
 * - 定义每个实体对应的 store key 和 createAction
 * - TagSelect 通过 ENTITY_META 自驱动，内部读 store + 调 action
 */

export interface EntityMeta {
  storeKey: string
  createAction: string
}

export const ENTITY_META: Record<string, EntityMeta> = {
  character:     { storeKey: "characters",     createAction: "createCharacter" },
  location:      { storeKey: "locations",      createAction: "createLocation" },
  foreshadowing: { storeKey: "foreshadowings", createAction: "createForeshadowing" },
}
