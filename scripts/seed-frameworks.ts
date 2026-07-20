// scripts/seed-frameworks.ts
// 将 configs/frameworks/*.md 中的框架名称写入 Framework 表
// 用法: npx tsx scripts/seed-frameworks.ts

import { PrismaClient } from "@prisma/client";
import { readdirSync, readFileSync, existsSync } from "fs";
import { resolve, basename } from "path";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const FRAMEWORKS_DIR = resolve(__dirname, "..", "configs", "frameworks");

async function main() {
  if (!existsSync(FRAMEWORKS_DIR)) {
    console.log("框架目录不存在，跳过");
    return;
  }

  const files = readdirSync(FRAMEWORKS_DIR).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const name = basename(file, ".md");
    const content = readFileSync(resolve(FRAMEWORKS_DIR, file), "utf-8");

    await prisma.framework.upsert({
      where: { id: name },
      update: { name, content },
      create: { id: name, name, content },
    });
    console.log(`  ✓ ${name}`);
  }

  console.log(`\n完成：已同步 ${files.length} 个框架`);
}

main()
  .catch((e) => {
    console.error("种子数据写入失败:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
