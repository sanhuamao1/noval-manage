/**
 * 测试脚本：运行 buildGenOutlinePrompt，输出生成的完整 Prompt
 * 用法：npx tsx scripts/test-gen-outline-prompt.ts
 */
import { resolve } from "path";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "fs";
import { load } from "js-yaml";
import { buildGenOutlinePrompt } from "../src/lib/ai/prompt/gen-outline";

const ROOT = resolve(__dirname, "..");
const NOVEL_ID = "mrp2zihp9397xf";
const FRAMEWORK = "三幕剧结构"; // 默认框架

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

const DATA_DIR = resolve(ROOT, "data/novels", NOVEL_ID);

const novel = load(
  readFileSync(resolve(DATA_DIR, "novel.yml"), "utf-8"),
) as Record<string, unknown>;

const characters = readAllYml(resolve(DATA_DIR, "characters"));
const organizations = readAllYml(resolve(DATA_DIR, "organizations"));
const locations = readAllYml(resolve(DATA_DIR, "locations"));

// 读取关系
let relations: { source: string; target: string; description: string }[] = [];
const relPath = resolve(DATA_DIR, "relations.yml");
if (existsSync(relPath)) {
  const relData = load(readFileSync(relPath, "utf-8")) as Record<string, unknown>;
  const relObj = relData?.relations as Record<string, unknown> | undefined;
  relations = (relObj?.links as { source: string; target: string; description: string }[]) ?? [];
}

const result = buildGenOutlinePrompt(
  NOVEL_ID,
  novel,
  characters,
  organizations,
  locations,
  relations,
  FRAMEWORK,
  "",
);

const outPath = resolve(ROOT, "scripts/test-gen-outline-output.txt");
writeFileSync(outPath, result, "utf-8");

console.log(`✅ 已生成 ${result.length} 字符`);
console.log(`📄 保存到：${outPath}`);
console.log(`📊 数据来源：${characters.length}个角色 | ${organizations.length}个组织 | ${locations.length}个地点 | ${relations.length}条关系`);
console.log(`📐 框架：${FRAMEWORK}`);
