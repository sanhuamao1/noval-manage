/**
 * 测试脚本：运行 buildEnrichSettingPrompt（从数据库获取数据）
 * 用法：npx tsx scripts/test-enrich-prompt.ts
 */
import { writeFileSync } from "fs";
import { resolve } from "path";
import { getNovel, list } from "../src/lib/store";
import { buildEnrichSettingPrompt } from "../src/ai/prompt";

const NOVEL_ID = "mrp2zihp9397xf";
const OUT_PATH = resolve(__dirname, "test-enrich-output.txt");

async function main() {
  const novel = await getNovel(NOVEL_ID);
  if (!novel) throw new Error(`未找到小说: ${NOVEL_ID}`);

  const characters = (await list("character", NOVEL_ID)) as Record<string, unknown>[];
  const organizations = (await list("organization", NOVEL_ID)) as Record<string, unknown>[];
  const locations = (await list("location", NOVEL_ID)) as Record<string, unknown>[];

  const result = buildEnrichSettingPrompt(
    NOVEL_ID,
    novel,
    characters,
    organizations,
    locations,
    "请重点完善主角的成长弧线和配角的关系网络",
  );

  writeFileSync(OUT_PATH, result, "utf-8");

  console.log(`✅ 已生成 ${result.length} 字符`);
  console.log(`📄 保存到：${OUT_PATH}`);
  console.log(
    `📊 数据来源：${characters.length}个角色 | ${organizations.length}个组织 | ${locations.length}个地点`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});