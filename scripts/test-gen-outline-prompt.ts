/**
 * 测试脚本：运行 buildGenOutlinePrompt（从数据库获取数据）
 * 用法：npx tsx scripts/test-gen-outline-prompt.ts
 */
import { writeFileSync } from "fs";
import { resolve } from "path";
import { getNovel, list, getRelations } from "../src/lib/store";
import { buildGenOutlinePrompt } from "../src/ai/prompt";

const NOVEL_ID = "mrp2zihp9397xf";
const FRAMEWORK = "三幕剧结构";
const OUT_PATH = resolve(__dirname, "test-gen-outline-output.txt");

async function main() {
  const novel = await getNovel(NOVEL_ID);
  if (!novel) throw new Error(`未找到小说: ${NOVEL_ID}`);

  const characters = (await list("character", NOVEL_ID)) as Record<string, unknown>[];
  const organizations = (await list("organization", NOVEL_ID)) as Record<string, unknown>[];
  const locations = (await list("location", NOVEL_ID)) as Record<string, unknown>[];
  const { links: relations } = await getRelations(NOVEL_ID);

  const result = buildGenOutlinePrompt(
    novel,
    characters,
    organizations,
    locations,
    relations,
    FRAMEWORK,
    "",
  );

  writeFileSync(OUT_PATH, result, "utf-8");

  console.log(`✅ 已生成 ${result.length} 字符`);
  console.log(`📄 保存到：${OUT_PATH}`);
  console.log(
    `📊 数据来源：${characters.length}个角色 | ${organizations.length}个组织 | ${locations.length}个地点 | ${relations.length}条关系`,
  );
  console.log(`📐 框架：${FRAMEWORK}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});