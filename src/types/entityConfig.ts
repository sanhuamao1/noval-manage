// 自动生成于 2026-07-19T15:03:01.024Z，勿手动编辑
// 由 scripts/generate-configs.cjs 从 configs/*.yml 生成

// ── 配置类型接口（由 YAML 字段定义自动推导）──

/** Novel 配置类型 */
export interface NovelConfig {
  title?: string | undefined;
  oneLineSummary?: string | undefined;
  description?: string | undefined;
  status?: string | undefined;
  genre?: string[];
  presetStyle?: string | undefined;
  primaryTone?: string | undefined;
  secondaryTones?: string[];
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
  surfaceGoal?: string | undefined;
  deepNeed?: string | undefined;
  emotionExpression?: string | undefined;
  abilities?: string[];
  growthArcs?: string[];
  notes?: string[];
  experience?: string[];
  narrativeFunction?: string[];
  innerMotivation?: string[];
}

/** Outline 配置类型 */
export interface OutlineConfig {
  name?: string | undefined;
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

/** Organization 配置类型 */
export interface OrganizationConfig {
  name?: string | undefined;
  description?: string | undefined;
  type?: string[];
  status?: string | undefined;
  foundingBackground?: string | undefined;
  founder?: string | undefined;
  currentLeader?: string | undefined;
  operationLogic?: string | undefined;
  structure?: string[];
  headquarters?: string[];
  members?: string[];
  opponents?: string[];
  mortalEnemies?: string[];
  allies?: string[];
}

/** Location 配置类型 */
export interface LocationConfig {
  name?: string | undefined;
  description?: string | undefined;
  locationType?: string[];
}

