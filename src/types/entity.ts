// 自动生成于 2026-07-20T10:05:50.113Z，勿手动编辑
// 由 scripts/generate-configs.cjs 从 configs/*.yml 生成

export * from "./configs";

import type { ConfigSection, ConfigFieldDef } from "./configs";

export interface EntityConfig {
  entity: string;
  sections: ConfigSection[];
  fields: ConfigFieldDef[];
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
