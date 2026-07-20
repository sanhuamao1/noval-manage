import { ConfigEntity, getEntry, buildConfigInstructions } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";

/** 将小说数据格式化为 Prompt 片段 */
export function formatNovelSection(novel: Record<string, unknown>): string {
  const parts: string[] = [];

  const { fields } = getEntry(ConfigEntity.NOVEL);
  const config = fillConfig(novel, {}, fields) as Record<string, unknown>;

  const section = buildConfigInstructions(config, fields);
  if (section.trim()) {
    parts.push(`\n${section}`);
  }

  return parts.join("\n");
}
