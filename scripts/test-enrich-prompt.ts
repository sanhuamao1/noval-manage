/**
 * 测试脚本：运行 buildEnrichSettingPrompt，输出生成的完整 Prompt
 * 用法：npx tsx scripts/test-enrich-prompt.ts
 */
import { resolve } from "path";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { load } from "js-yaml";
import { buildEnrichSettingPrompt } from "../src/lib/ai/prompt/enrich-settings";

const ROOT = resolve(__dirname, "..");

/** 读取目录下所有 .yml 文件 */
function readAllYml(dir: string): Record<string, unknown>[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".yml"))
      .map((f) => load(readFileSync(resolve(dir, f), "utf-8")) as Record<string, unknown>);
  } catch {
    return [];
  }
}

const NOVEL_ID = "mrp2zihp9397xf";
const DATA_DIR = resolve(ROOT, "data/novels", NOVEL_ID);

const novel = load(
  readFileSync(resolve(DATA_DIR, "novel.yml"), "utf-8"),
) as Record<string, unknown>;

const characters = readAllYml(resolve(DATA_DIR, "characters"));
const organizations = readAllYml(resolve(DATA_DIR, "organizations"));
const locations = readAllYml(resolve(DATA_DIR, "locations"));

const result = buildEnrichSettingPrompt(
  NOVEL_ID,
  novel,
  characters,
  organizations,
  locations,
  "请重点完善主角的成长弧线和配角的关系网络",
);

const outPath = resolve(ROOT, "scripts/test-enrich-output.txt");
writeFileSync(outPath, result, "utf-8");

console.log(`✅ 已生成 ${result.length} 字符`);
console.log(`📄 保存到：${outPath}`);
console.log(`📊 数据来源：${characters.length}个角色 | ${organizations.length}个组织 | ${locations.length}个地点`);
