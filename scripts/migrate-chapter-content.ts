/**
 * 章节 content 迁移脚本
 *
 * 将章节的 content 从 .yml 文件剥离到独立的 .content 文件。
 * 运行后 .yml 仅存元数据，.content 文件存正文内容。
 *
 * 兼容性：已经迁移过的章节（已有 .content 文件）会跳过。
 *
 * 用法：npx tsx scripts/migrate-chapter-content.ts [novelId?]
 *   - 不传 novelId：迁移所有小说下的所有章节
 *   - 传 novelId：仅迁移指定小说
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync, renameSync } from "fs";
import { resolve, dirname } from "path";
import { load, dump } from "js-yaml";

const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, "data/novels");

// ── 工具 ──

function readYaml<T = Record<string, unknown>>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return load(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

function writeYamlSafe(path: string, data: Record<string, unknown>): void {
  const content = dump(data, { lineWidth: -1 });
  const dir = dirname(path);
  if (!existsSync(dir)) return;
  const tmp = path + ".tmp." + process.pid;
  try {
    writeFileSync(tmp, content, "utf-8");
    renameSync(tmp, path);
  } catch (err) {
    try { unlinkSync(tmp); } catch { /* ignore */ }
    throw err;
  }
}

function writeContentSafe(path: string, content: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) return;
  writeFileSync(path, content, "utf-8");
}

// ── 迁移逻辑 ──

interface MigrationResult {
  migrated: number;   // 已迁移
  skipped: number;    // 已跳过（.content 已存在）
  cleaned: number;    // 已清理（.content 存在但 .yml 已删除）
  errors: string[];   // 失败记录
}

function migrateChapters(chapterDir: string): MigrationResult {
  const result: MigrationResult = { migrated: 0, skipped: 0, cleaned: 0, errors: [] };

  if (!existsSync(chapterDir)) return result;

  const files = readdirSync(chapterDir);

  // 收集 .yml 和 .content 文件名（不含扩展名）
  const ymlSet = new Set(files.filter((f) => f.endsWith(".yml")).map((f) => f.replace(/\.yml$/, "")));
  const contentSet = new Set(files.filter((f) => f.endsWith(".content")).map((f) => f.replace(/\.content$/, "")));

  // 1) 迁移：有 .yml 无 .content，且 yml 中有 content 字段
  for (const baseName of ymlSet) {
    if (contentSet.has(baseName)) {
      result.skipped++;
      continue;
    }

    const ymlPath = resolve(chapterDir, `${baseName}.yml`);
    const contentPath = resolve(chapterDir, `${baseName}.content`);

    try {
      const record = readYaml<Record<string, unknown>>(ymlPath);
      if (!record) {
        result.errors.push(`${baseName}: 无法读取 yml`);
        continue;
      }

      const content = String(record.content ?? "");
      delete record.content;

      // 写入 .content 文件
      writeContentSafe(contentPath, content);
      // 更新 .yml（去掉 content 字段）
      writeYamlSafe(ymlPath, record);

      result.migrated++;
      console.log(`  ✔ ${baseName}  (${content.length} 字 → .content)`);
    } catch (err) {
      result.errors.push(`${baseName}: ${err}`);
    }
  }

  // 2) 清理：有 .content 但无对应 .yml（孤立文件）
  for (const baseName of contentSet) {
    if (!ymlSet.has(baseName)) {
      const orphanPath = resolve(chapterDir, `${baseName}.content`);
      try {
        unlinkSync(orphanPath);
        result.cleaned++;
        console.log(`  🗑  ${baseName}.content (孤立文件已删除)`);
      } catch (err) {
        result.errors.push(`删除孤立文件 ${baseName}: ${err}`);
      }
    }
  }

  return result;
}

// ── 主流程 ──

function main() {
  const targetNovelId = process.argv[2]; // 可选参数
  const novelIds: string[] = [];

  if (targetNovelId) {
    const novelDir = resolve(DATA_DIR, targetNovelId);
    if (!existsSync(novelDir)) {
      console.error(`❌ 小说目录不存在: ${targetNovelId}`);
      process.exit(1);
    }
    novelIds.push(targetNovelId);
  } else {
    const entries = readdirSync(DATA_DIR, { withFileTypes: true });
    novelIds.push(...entries.filter((e) => e.isDirectory()).map((e) => e.name));
  }

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalCleaned = 0;
  const allErrors: string[] = [];

  for (const novelId of novelIds) {
    const chapterDir = resolve(DATA_DIR, novelId, "chapters");
    console.log(`\n📚 ${novelId}（${existsSync(chapterDir) ? "有章节目录" : "无章节目录"}）`);

    const result = migrateChapters(chapterDir);
    totalMigrated += result.migrated;
    totalSkipped += result.skipped;
    totalCleaned += result.cleaned;
    allErrors.push(...result.errors);
  }

  // 输出汇总
  console.log("\n" + "=".repeat(40));
  console.log("📊 迁移汇总");
  console.log("=".repeat(40));
  console.log(`  ✅ 已迁移：${totalMigrated} 个章节`);
  console.log(`  ⏭  已跳过：${totalSkipped} 个章节（已有 .content）`);
  console.log(`  🗑  已清理：${totalCleaned} 个孤立文件`);

  if (allErrors.length > 0) {
    console.log(`\n❌ 失败 (${allErrors.length}):`);
    for (const err of allErrors) {
      console.log(`  - ${err}`);
    }
    process.exit(1);
  } else {
    console.log(`\n🎉 全部完成，无错误。`);
  }
}

main();
