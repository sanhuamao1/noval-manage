/**
 * YML → SQLite 数据迁移脚本
 *
 * 从 data/ 目录读取所有 YML 文件，写入 SQLite 数据库。
 * 运行方式： npm run migrate-data
 *
 * 注意：该项目脚本通常使用 CJS 格式，但 tsx 支持直接运行 TypeScript，
 * 使用 tsx 可以 import Prisma 客户端。
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve } from "path";
import { load } from "js-yaml";

const prisma = new PrismaClient();
const DATA_DIR = resolve(process.cwd(), "data");

// ── 辅助函数 ──

function readYml<T = Record<string, unknown>>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return load(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 列出目录下所有 .yml 文件（不含后缀 id） */
function listYmlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yml"))
    .map((f) => f.replace(/\.yml$/, ""));
}

function toDate(val: unknown): Date | undefined {
  if (!val) return undefined;
  try {
    return new Date(val as string);
  } catch {
    return undefined;
  }
}

// ============================================================
//  JSON 字段映射（与 store.ts 保持一致）
// ============================================================

const JSON_FIELDS: Record<string, Set<string>> = {
  character: new Set([
    "abilities", "growthArcs", "notes", "experience",
    "narrativeFunction", "innerMotivation",
  ]),
  novel: new Set(["genre", "secondaryTones"]),
  outline: new Set(["characterIds", "locationIds", "foreshadowingIds"]),
  location: new Set(["locationType"]),
  organization: new Set([
    "type", "structure", "headquarters", "members",
    "opponents", "mortalEnemies", "allies",
  ]),
  "polish-rule": new Set(["mood", "senses", "character", "environment"]),
};

function serializeJSON(entity: string, data: Record<string, unknown>): Record<string, unknown> {
  const fields = JSON_FIELDS[entity];
  if (!fields) return data;
  const result = { ...data };
  for (const f of fields) {
    if (result[f] !== undefined && result[f] !== null && typeof result[f] !== "string") {
      result[f] = JSON.stringify(result[f]);
    }
  }
  return result;
}

// ============================================================
//  导入函数
// ============================================================

async function importNovels() {
  console.log("📖 导入小说...");
  const novelsDir = resolve(DATA_DIR, "novels");
  if (!existsSync(novelsDir)) {
    console.log("  未找到 novels 目录，跳过");
    return;
  }

  const novelIds = readdirSync(novelsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const id of novelIds) {
    const ymlPath = resolve(novelsDir, id, "novel.yml");
    const data = readYml(ymlPath);
    if (!data) {
      console.log(`  ⚠️  ${id}: novel.yml 不存在`);
      continue;
    }

    const serialized = serializeJSON("novel", data);
    await prisma.novel.upsert({
      where: { id: id },
      create: {
        id,
        title: (serialized.title as string) ?? "",
        description: (serialized.description as string) ?? null,
        status: (serialized.status as string) ?? "连载中",
        genre: (serialized.genre as string) ?? null,
        primaryTone: (serialized.primaryTone as string) ?? null,
        secondaryTones: (serialized.secondaryTones as string) ?? null,
        worldShape: (serialized.worldShape as string) ?? null,
        presetStyle: (serialized.presetStyle as string) ?? null,
        oneLineSummary: (serialized.oneLineSummary as string) ?? null,
        createdAt: toDate(serialized.createdAt) ?? new Date(),
        updatedAt: toDate(serialized.updatedAt) ?? new Date(),
      },
      update: {
        title: (serialized.title as string) ?? "",
        description: (serialized.description as string) ?? null,
        status: (serialized.status as string) ?? "连载中",
        genre: (serialized.genre as string) ?? null,
        primaryTone: (serialized.primaryTone as string) ?? null,
        secondaryTones: (serialized.secondaryTones as string) ?? null,
        worldShape: (serialized.worldShape as string) ?? null,
        presetStyle: (serialized.presetStyle as string) ?? null,
        oneLineSummary: (serialized.oneLineSummary as string) ?? null,
        updatedAt: toDate(serialized.updatedAt) ?? new Date(),
      },
    });
    console.log(`  ✅  ${id}: ${data.title}`);
  }
  console.log(`  共导入 ${novelIds.length} 本小说`);
}

async function importSubEntities(novelId: string, entity: string, tableName: string, requiredFields: string[]) {
  const dir = resolve(DATA_DIR, "novels", novelId, `${entity}s`);
  const ids = listYmlFiles(dir);
  if (ids.length === 0) return;

  console.log(`    📁 导入 ${entity} (${ids.length} 条)...`);

  for (const id of ids) {
    const data = readYml(resolve(dir, `${id}.yml`));
    if (!data) continue;

    const serialized = serializeJSON(entity, data);
    const record: Record<string, unknown> = { id, novelId };
    for (const field of requiredFields) {
      if (serialized[field] !== undefined) record[field] = serialized[field];
    }

    // 处理日期
    record.createdAt = toDate(serialized.createdAt) ?? new Date();
    record.updatedAt = toDate(serialized.updatedAt) ?? new Date();

    // 处理 sortOrder
    if (serialized.sortOrder !== undefined) {
      record.sortOrder = serialized.sortOrder as number;
    }

    await (prisma as any)[tableName].upsert({
      where: { id },
      create: record,
      update: record,
    });
  }
  console.log(`    ✅  ${entity} 导入完成`);
}

async function importCharacters(novelId: string) {
  const entity = "character";
  const dir = resolve(DATA_DIR, "novels", novelId, "characters");
  const ids = listYmlFiles(dir);
  if (ids.length === 0) return;

  console.log(`    📁 导入角色 (${ids.length} 条)...`);

  const fields = [
    "name", "gender", "role", "age", "identity", "item",
    "coreConflict", "surfaceGoal", "deepNeed", "emotionExpression",
    "abilities", "growthArcs", "notes", "experience",
    "narrativeFunction", "innerMotivation",
  ];

  for (const id of ids) {
    const data = readYml(resolve(dir, `${id}.yml`));
    if (!data) continue;

    const serialized = serializeJSON(entity, data);
    const record: Record<string, unknown> = { id, novelId };
    for (const field of fields) {
      if (serialized[field] !== undefined) record[field] = serialized[field];
    }
    record.createdAt = toDate(serialized.createdAt) ?? new Date();
    record.updatedAt = toDate(serialized.updatedAt) ?? new Date();

    await prisma.character.upsert({
      where: { id },
      create: record as any,
      update: record as any,
    });
  }
  console.log(`    ✅ 角色导入完成`);
}

async function importChapters(novelId: string) {
  const dir = resolve(DATA_DIR, "novels", novelId, "chapters");
  const ids = listYmlFiles(dir);
  if (ids.length === 0) return;

  console.log(`    📁 导入章节 (${ids.length} 条)...`);

  for (const id of ids) {
    const data = readYml(resolve(dir, `${id}.yml`));
    if (!data) continue;

    // 读取 .content 文件内容
    let content = "";
    const contentPath = resolve(dir, `${id}.content`);
    if (existsSync(contentPath)) {
      content = readFileSync(contentPath, "utf-8");
    } else if (data.content) {
      content = data.content as string;
    }

    const record: Record<string, unknown> = {
      id,
      novelId,
      title: data.title ?? "",
      content,
      status: data.status ?? "draft",
      sortOrder: data.sortOrder ?? 0,
      relatedCharacters: data.relatedCharacters as string ?? null,
      createdAt: toDate(data.createdAt) ?? new Date(),
      updatedAt: toDate(data.updatedAt) ?? new Date(),
    };

    await prisma.chapter.upsert({
      where: { id },
      create: record as any,
      update: record as any,
    });
  }
  console.log(`    ✅ 章节导入完成`);
}

async function importRelations(novelId: string) {
  const path = resolve(DATA_DIR, "novels", novelId, "relations.yml");
  const data = readYml<{ relations?: { links?: unknown[]; positions?: Record<string, { x: number; y: number }> } }>(path);
  if (!data?.relations) {
    console.log(`    ℹ️  无关系数据，跳过`);
    return;
  }

  console.log(`    📁 导入关系图数据...`);

  // 导入 links
  const links = data.relations.links ?? [];
  if (links.length > 0) {
    // 先清空旧的 relation 数据
    await prisma.relation.deleteMany({ where: { novelId } });
    for (const link of links as Array<Record<string, unknown>>) {
      await prisma.relation.create({
        data: {
          id: genId(),
          novelId,
          source: (link.source || link.from) as string,
          target: (link.target || link.to) as string,
          description: (link.description ?? "") as string,
        },
      });
    }
    console.log(`      links: ${links.length} 条`);
  }

  // 导入 positions
  const positions = data.relations.positions ?? {};
  const posEntries = Object.entries(positions);
  if (posEntries.length > 0) {
    await prisma.nodePosition.deleteMany({ where: { novelId } });
    for (const [charId, pos] of posEntries) {
      await prisma.nodePosition.create({
        data: {
          id: genId(),
          novelId,
          charId,
          x: pos.x,
          y: pos.y,
        },
      });
    }
    console.log(`      positions: ${posEntries.length} 个`);
  }

  console.log(`    ✅ 关系图导入完成`);
}

async function importFactoryConversations(novelId: string) {
  const factoryDir = resolve(DATA_DIR, "novels", novelId, "factory");
  if (!existsSync(factoryDir)) {
    console.log(`    ℹ️  无梦工厂对话，跳过`);
    return;
  }

  const convIds = listYmlFiles(factoryDir);
  if (convIds.length === 0) {
    console.log(`    ℹ️  无梦工厂对话，跳过`);
    return;
  }

  console.log(`    📁 导入梦工厂对话 (${convIds.length} 会话)...`);

  for (const convId of convIds) {
    const data = readYml<{ messages?: Array<{ role: string; content: string }> }>(
      resolve(factoryDir, `${convId}.yml`),
    );
    if (!data?.messages) continue;

    // 创建会话
    await prisma.factoryConversation.upsert({
      where: { id: convId },
      create: { id: convId, novelId },
      update: {},
    });

    // 删除旧消息，写入新消息
    await prisma.factoryMessage.deleteMany({ where: { conversationId: convId } });
    for (const msg of data.messages) {
      await prisma.factoryMessage.create({
        data: {
          id: genId(),
          conversationId: convId,
          role: msg.role,
          content: msg.content,
        },
      });
    }
  }
  console.log(`    ✅ 梦工厂对话导入完成`);
}

async function importNovelData(novelId: string) {
  console.log(`\n📚 处理小说: ${novelId}`);

  // 子实体列表：每个 [entity名, 表名, 必需字段]
  const entities: Array<[string, string, string[]]> = [
    ["outline", "outline", ["name", "contentBrief", "contentDetail", "status", "timeline", "tone", "characterIds", "locationIds", "foreshadowingIds", "sortOrder"]],
    ["location", "location", ["name", "description", "locationType", "sortOrder"]],
    ["organization", "organization", ["name", "description", "type", "status", "foundingBackground", "founder", "currentLeader", "operationLogic", "structure", "headquarters", "members", "opponents", "mortalEnemies", "allies"]],
    ["foreshadowing", "foreshadowing", ["name", "sortOrder"]],
    ["key-event", "keyEvent", ["outlineId", "title", "sortOrder"]],
    ["character-emotion", "characterEmotion", ["outlineId", "data"]],
  ];

  for (const [entity, table, fields] of entities) {
    await importSubEntities(novelId, entity, table, fields);
  }

  // 特殊实体（自定义字段处理）
  await importCharacters(novelId);
  await importChapters(novelId);
  await importRelations(novelId);
  await importFactoryConversations(novelId);
}

async function importGlobalEntities() {
  console.log("\n🌐 导入全局实体...");

  // 润色规则
  const rulesDir = resolve(DATA_DIR, "polish-rules");
  const ruleIds = listYmlFiles(rulesDir);
  console.log(`  📁 润色规则 (${ruleIds.length} 条)...`);
  for (const id of ruleIds) {
    const data = readYml(resolve(rulesDir, `${id}.yml`));
    if (!data) continue;

    const serialized = serializeJSON("polish-rule", data);
    await prisma.polishRule.upsert({
      where: { id },
      create: {
        id,
        name: (serialized.name as string) ?? "",
        description: (serialized.description as string) ?? null,
        prompt: (serialized.prompt as string) ?? null,
        pace: (serialized.pace as string) ?? null,
        mood: (serialized.mood as string) ?? null,
        narrative: (serialized.narrative as string) ?? null,
        senses: (serialized.senses as string) ?? null,
        character: (serialized.character as string) ?? null,
        environment: (serialized.environment as string) ?? null,
        rhetoric: (serialized.rhetoric as string) ?? null,
        timeVariation: (serialized.timeVariation as boolean) ?? false,
        contrastInsertion: (serialized.contrastInsertion as boolean) ?? false,
        useCount: (serialized.useCount as number) ?? 0,
        createdAt: toDate(serialized.createdAt) ?? new Date(),
        updatedAt: toDate(serialized.updatedAt) ?? new Date(),
      },
      update: {
        name: (serialized.name as string) ?? "",
        description: (serialized.description as string) ?? null,
        prompt: (serialized.prompt as string) ?? null,
        pace: (serialized.pace as string) ?? null,
        mood: (serialized.mood as string) ?? null,
        narrative: (serialized.narrative as string) ?? null,
        senses: (serialized.senses as string) ?? null,
        character: (serialized.character as string) ?? null,
        environment: (serialized.environment as string) ?? null,
        rhetoric: (serialized.rhetoric as string) ?? null,
        timeVariation: (serialized.timeVariation as boolean) ?? false,
        contrastInsertion: (serialized.contrastInsertion as boolean) ?? false,
        useCount: (serialized.useCount as number) ?? 0,
        updatedAt: toDate(serialized.updatedAt) ?? new Date(),
      },
    });
  }
  console.log(`  ✅ 润色规则导入完成`);

  // 风格样本
  const samplesDir = resolve(DATA_DIR, "polish-samples");
  const sampleIds = listYmlFiles(samplesDir);
  console.log(`  📁 风格样本 (${sampleIds.length} 条)...`);
  for (const id of sampleIds) {
    const data = readYml(resolve(samplesDir, `${id}.yml`));
    if (!data) continue;

    await prisma.polishSample.upsert({
      where: { id },
      create: {
        id,
        name: (data.name as string) ?? "",
        prompt: (data.prompt as string) ?? null,
        sceneType: (data.sceneType as string) ?? null,
        text: (data.text as string) ?? null,
        isNegative: (data.isNegative as boolean) ?? false,
        useCount: (data.useCount as number) ?? 0,
        createdAt: toDate(data.createdAt) ?? new Date(),
        updatedAt: toDate(data.updatedAt) ?? new Date(),
      },
      update: {
        name: (data.name as string) ?? "",
        prompt: (data.prompt as string) ?? null,
        sceneType: (data.sceneType as string) ?? null,
        text: (data.text as string) ?? null,
        isNegative: (data.isNegative as boolean) ?? false,
        useCount: (data.useCount as number) ?? 0,
        updatedAt: toDate(data.updatedAt) ?? new Date(),
      },
    });
  }
  console.log(`  ✅ 风格样本导入完成`);
}

// ============================================================
//  主流程
// ============================================================

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  YML → SQLite 数据迁移");
  console.log("═══════════════════════════════════════\n");

  // 1. 导入小说
  await importNovels();

  // 2. 遍历每本小说导入子数据
  const novelsDir = resolve(DATA_DIR, "novels");
  if (existsSync(novelsDir)) {
    const novelIds = readdirSync(novelsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const novelId of novelIds) {
      await importNovelData(novelId);
    }
  }

  // 3. 导入全局实体
  await importGlobalEntities();

  console.log("\n═══════════════════════════════════════");
  console.log("  ✅ 迁移完成！");
  console.log("═══════════════════════════════════════\n");
  console.log("原有 data/ 目录保留作为备份。");
  console.log("现在可以删除 data/ 目录，或保留不动（程序不再读取）。");
}

main()
  .catch((e) => {
    console.error("❌ 迁移失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
