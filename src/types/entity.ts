// 自动生成于 2026-07-19T15:03:01.019Z，勿手动编辑
// 由 scripts/generate-configs.cjs 从 configs/*.yml 生成

export * from "./configs";

import type { ConfigSection, ConfigFieldDef } from "./configs";
import type { NovelConfig, CharacterConfig, OutlineConfig, PolishRuleConfig, PolishSampleConfig, OrganizationConfig, LocationConfig } from "./entityConfig";

export interface EntityConfig {
  entity: string;
  sections: ConfigSection[];
  fields: ConfigFieldDef[];
}

/** 实体 Key → 配置类型 映射表 */
export interface EntityConfigMap {
  [ConfigEntity.NOVEL]: NovelConfig;
  [ConfigEntity.CHARACTER]: CharacterConfig;
  [ConfigEntity.OUTLINE]: OutlineConfig;
  [ConfigEntity.POLISH_RULE]: PolishRuleConfig;
  [ConfigEntity.POLISH_SAMPLE]: PolishSampleConfig;
  [ConfigEntity.ORGANIZATION]: OrganizationConfig;
  [ConfigEntity.LOCATION]: LocationConfig;
}

/** 配置实体枚举（与 YAML 实体列表同源，由构建脚本自动生成） */
export enum ConfigEntity {
  NOVEL = "novel",
  CHARACTER = "character",
  OUTLINE = "outline",
  POLISH_RULE = "polish-rule",
  POLISH_SAMPLE = "polish-sample",
  ORGANIZATION = "organization",
  LOCATION = "location"
}
