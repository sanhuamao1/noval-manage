import { db } from "./db";

// ── ID 生成 ──
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── JSON 字段映射（存储为 TEXT，读取时解析为 JS 对象） ──
const JSON_FIELDS: Record<string, Set<string>> = {
  character: new Set([
    "abilities", "growthArcs", "notes", "experience",
    "narrativeFunction", "innerMotivation",
  ]),
  novel: new Set(["genre", "secondaryTones"]),
  outline: new Set([]),
  "event-node": new Set(["characterIds", "locationIds"]),
  location: new Set(["locationType"]),
  organization: new Set([
    "type", "structure", "headquarters", "members",
    "opponents", "mortalEnemies", "allies",
  ]),
  "polish-rule": new Set(["mood", "senses", "character", "environment"]),
};

// ── 实体 → Prisma 模型名 ──
const ENTITY_MODELS: Record<string, string> = {
  character: "character",
  outline: "outline",
  chapter: "chapter",
  location: "location",
  organization: "organization",
  "event-node": "eventNode",
  "event-connection": "eventConnection",
  "outline-event": "outlineEvent",
  "polish-rule": "polishRule",
  "polish-sample": "polishSample",
};

// 全局实体（不需要 novelId）
const GLOBAL_ENTITIES = new Set(["polish-rule", "polish-sample", "framework"]);

// ── 实体名 → Prisma delegate ──
function delegate(entity: string) {
  const model = ENTITY_MODELS[entity] ?? entity;
  return (db as unknown as Record<string, unknown>)[model] as {
    findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
    findMany: (args: unknown) => Promise<Record<string, unknown>[]>;
    create: (args: unknown) => Promise<Record<string, unknown>>;
    update: (args: unknown) => Promise<Record<string, unknown>>;
    delete: (args: unknown) => Promise<Record<string, unknown>>;
    deleteMany: (args: unknown) => Promise<{ count: number }>;
    count: (args: unknown) => Promise<number>;
    aggregate: (args: unknown) => Promise<{ _max: Record<string, unknown> }>;
    upsert: (args: unknown) => Promise<Record<string, unknown>>;
  };
}

// ── JSON 序列化 / 反序列化 ──
function serializeJSON(entity: string, data: Record<string, unknown>): Record<string, unknown> {
  const fields = JSON_FIELDS[entity];
  if (!fields) return data;
  const result = { ...data };
  Array.from(fields).forEach((f) => {
    if (result[f] !== undefined && result[f] !== null && typeof result[f] !== "string") {
      result[f] = JSON.stringify(result[f]);
    }
  });
  return result;
}

function deserializeRecord<T = Record<string, unknown>>(
  entity: string,
  record: T | null,
): T | null {
  if (!record) return null;
  const r = record as Record<string, unknown>;
  const fields = JSON_FIELDS[entity];
  if (fields) {
    Array.from(fields).forEach((f) => {
      if (typeof r[f] === "string") {
        try {
          r[f] = JSON.parse(r[f] as string);
        } catch {
          /* 保持原值 */
        }
      }
    });
  }
  return r as T;
}

function deserializeList(
  entity: string,
  records: Record<string, unknown>[],
): Record<string, unknown>[] {
  return records.map((r) => deserializeRecord(entity, r) ?? r);
}

// ── Date ↔ ISO string 转换 ──
function datesToISO(record: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!record) return null;
  const r = { ...record };
  for (const key of ["createdAt", "updatedAt"]) {
    const v = r[key];
    if (v instanceof Date) r[key] = v.toISOString();
  }
  return r;
}

function datesToISOList(records: Record<string, unknown>[]): Record<string, unknown>[] {
  return records.map((r) => datesToISO(r) ?? r);
}

// ── 分类提取：把 id / novelId / createdAt / updatedAt 与业务字段分开 ──
function extractSystemFields(data: Record<string, unknown>) {
  const system: Record<string, unknown> = {};
  const biz: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(data)) {
    if (key === "id" || key === "novelId" || key === "createdAt" || key === "updatedAt") {
      system[key] = val;
    } else {
      biz[key] = val;
    }
  }

  return { system, biz };
}

// ============================================================
//  单条操作
// ============================================================

export async function get<T = Record<string, unknown>>(
  entity: string,
  id: string,
  novelId?: string,
): Promise<T | null> {
  // Novel 特殊处理
  if (entity === "novel") {
    const novel = await db.novel.findUnique({ where: { id } });
    return deserializeRecord("novel", datesToISO(novel as unknown as Record<string, unknown>)) as unknown as T | null;
  }

  const where: Record<string, unknown> = { id };
  if (!GLOBAL_ENTITIES.has(entity) && novelId) where.novelId = novelId;

  const record = await delegate(entity).findUnique({ where });
  return deserializeRecord(entity, datesToISO(record)) as unknown as T | null;
}

export async function put(
  entity: string,
  id: string,
  data: Record<string, unknown>,
  novelId?: string,
): Promise<void> {
  const now = new Date();

  // 构建完整的记录
  const { system, biz } = extractSystemFields(data);
  const record: Record<string, unknown> = {
    id,
    ...biz,
    createdAt: system.createdAt instanceof Date ? system.createdAt : (system.createdAt ? new Date(system.createdAt as string) : now),
    updatedAt: now,
  };

  // 序列化 JSON 字段
  const serialized = serializeJSON(entity, record);

  // 添加 novelId（如果不是全局实体）
  if (!GLOBAL_ENTITIES.has(entity) && entity !== "novel") {
    serialized.novelId = novelId ?? (data.novelId as string);
  }

  // chapter：content 直接存入 model，无需特殊处理

  const existing = await get(entity, id, novelId);

  if (existing) {
    await delegate(entity).update({
      where: { id },
      data: serialized,
    });
  } else {
    await delegate(entity).create({ data: serialized });
  }
}

export async function remove(entity: string, id: string, novelId?: string): Promise<void> {
  if (entity === "novel") {
    await db.novel.delete({ where: { id } });
    return;
  }

  try {
    await delegate(entity).delete({ where: { id } });
  } catch {
    // 记录不存在时静默忽略（与原有行为一致）
  }
}

// ============================================================
//  列表操作
// ============================================================

export async function list<T = Record<string, unknown>>(
  entity: string,
  novelId?: string,
): Promise<T[]> {
  // Novel 特殊处理
  if (entity === "novel") {
    const novels = await db.novel.findMany({ orderBy: { updatedAt: "desc" } });
    return deserializeList(
      "novel",
      datesToISOList(novels as unknown as Record<string, unknown>[]),
    ) as unknown as T[];
  }

  const where: Record<string, unknown> = {};
  if (!GLOBAL_ENTITIES.has(entity) && novelId) where.novelId = novelId;

  const records = await delegate(entity).findMany({ where });
  return deserializeList(entity, datesToISOList(records)) as unknown as T[];
}

export async function listBy<T = Record<string, unknown>>(
  entity: string,
  field: string,
  value: string,
  novelId?: string,
): Promise<T[]> {
  const where: Record<string, unknown> = { [field]: value };
  if (!GLOBAL_ENTITIES.has(entity) && novelId) where.novelId = novelId;

  const records = await delegate(entity).findMany({ where });
  return deserializeList(entity, datesToISOList(records)) as unknown as T[];
}

export async function nextSortOrder(entity: string, novelId?: string): Promise<number> {
  const where: Record<string, unknown> = {};
  if (!GLOBAL_ENTITIES.has(entity) && novelId) where.novelId = novelId;

  const result = await delegate(entity).aggregate({
    where,
    _max: { sortOrder: true },
  });

  const max = (result._max.sortOrder as number | null) ?? -1;
  return max + 1;
}

export async function count(entity: string, novelId: string): Promise<number> {
  if (GLOBAL_ENTITIES.has(entity)) {
    return delegate(entity).count({});
  }
  return delegate(entity).count({ where: { novelId } });
}

// ============================================================
//  Novel 特殊操作
// ============================================================

export async function listNovels<T = Record<string, unknown>>(): Promise<T[]> {
  return list<T>("novel");
}

export async function getNovel<T = Record<string, unknown>>(novelId: string): Promise<T | null> {
  return get<T>("novel", novelId);
}

export async function createNovel(
  title: string,
  description?: string,
): Promise<Record<string, unknown>> {
  const id = genId();
  const now = new Date();
  const novel = await db.novel.create({
    data: { id, title, description: description ?? null, createdAt: now, updatedAt: now },
  });
  return datesToISO(novel as unknown as Record<string, unknown>) ?? {};
}

export async function updateNovel(
  novelId: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const existing = await getNovel(novelId);
  if (!existing) return null;

  const { biz } = extractSystemFields(data);
  const serialized = serializeJSON("novel", {
    ...biz,
    updatedAt: new Date().toISOString(),
  });

  const updated = await db.novel.update({
    where: { id: novelId },
    data: { ...serialized, updatedAt: new Date() },
  });
  return deserializeRecord("novel", datesToISO(updated as unknown as Record<string, unknown>));
}

export async function removeNovel(novelId: string): Promise<void> {
  await db.novel.delete({ where: { id: novelId } }).catch(() => {});
}

export async function getNovelWordCount(novelId: string): Promise<number> {
  const chapters = await db.chapter.findMany({
    where: { novelId },
    select: { content: true },
  });
  return chapters.reduce((sum, ch) => sum + (ch.content?.length ?? 0), 0);
}

// ============================================================
//  关系数据
// ============================================================

export interface RelationRecord {
  source: string;
  target: string;
  description: string;
  sourceName?: string;
  targetName?: string;
}

export interface NodePosition {
  x: number;
  y: number;
}

export async function getRelations(novelId: string): Promise<{
  links: RelationRecord[];
  positions: Record<string, NodePosition>;
}> {
  const links = await db.relation.findMany({
    where: { novelId },
    select: { sourceId: true, targetId: true, description: true },
  });

  // 批量查询涉及的角色名称（兜底悬挂的外键引用）
  const charIds = new Set<string>();
  for (const l of links) {
    charIds.add(l.sourceId);
    charIds.add(l.targetId);
  }
  const charMap: Record<string, string> = {};
  if (charIds.size > 0) {
    const chars = await db.character.findMany({
      where: { id: { in: Array.from(charIds) } },
      select: { id: true, name: true },
    });
    for (const c of chars) {
      charMap[c.id] = c.name;
    }
  }

  const positionRows = await db.nodePosition.findMany({
    where: { novelId },
    select: { charId: true, x: true, y: true },
  });

  const positions: Record<string, NodePosition> = {};
  for (const p of positionRows) {
    positions[p.charId] = { x: p.x, y: p.y };
  }

  return {
    links: links.map((l) => ({
      source: l.sourceId,
      target: l.targetId,
      description: l.description,
      sourceName: charMap[l.sourceId],
      targetName: charMap[l.targetId],
    })),
    positions,
  };
}

export async function saveRelations(
  novelId: string,
  links: RelationRecord[],
): Promise<void> {
  await db.$transaction([
    db.relation.deleteMany({ where: { novelId } }),
    ...links.map((l) =>
      db.relation.create({
        data: {
          id: genId(),
          novelId,
          sourceId: l.source,
          targetId: l.target,
          description: l.description,
        },
      }),
    ),
  ]);
}

export async function savePositions(
  novelId: string,
  positions: Record<string, NodePosition>,
): Promise<void> {
  const existing = await db.nodePosition.findMany({
    where: { novelId },
    select: { charId: true },
  });

  const existingChars = new Set(existing.map((p) => p.charId));
  const incomingChars = new Set(Object.keys(positions));

  // 需要删除的旧位置
  const toDelete = Array.from(existingChars).filter((c) => !incomingChars.has(c));

  const ops: unknown[] = [];

  if (toDelete.length > 0) {
    ops.push(
      db.nodePosition.deleteMany({
        where: { novelId, charId: { in: toDelete } },
      }),
    );
  }

  for (const [charId, pos] of Object.entries(positions)) {
    ops.push(
      db.nodePosition.upsert({
        where: { novelId_charId: { novelId, charId } },
        create: { id: genId(), novelId, charId, x: pos.x, y: pos.y },
        update: { x: pos.x, y: pos.y },
      }),
    );
  }

  if (ops.length > 0) {
    await db.$transaction(ops as never[]);
  }
}

export async function appendRelationLink(
  novelId: string,
  link: RelationRecord,
): Promise<void> {
  await db.relation.create({
    data: {
      id: genId(),
      novelId,
      sourceId: link.source,
      targetId: link.target,
      description: link.description,
    },
  });
}

// ============================================================
//  梦工厂对话
// ============================================================

export async function getFactoryConversation(
  novelId: string,
  convId: string,
): Promise<Array<{ role: string; content: string }>> {
  const messages = await db.factoryMessage.findMany({
    where: { conversationId: convId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });
  return messages;
}

export async function saveFactoryConversation(
  novelId: string,
  convId: string,
  messages: Array<{ role: string; content: string }>,
): Promise<void> {
  // 确保会话存在
  await db.factoryConversation.upsert({
    where: { id: convId },
    create: { id: convId, novelId },
    update: { updatedAt: new Date() },
  });

  // 删除旧消息，写入新消息
  await db.$transaction([
    db.factoryMessage.deleteMany({ where: { conversationId: convId } }),
    ...messages.map((m) =>
      db.factoryMessage.create({
        data: {
          id: genId(),
          conversationId: convId,
          role: m.role,
          content: m.content,
        },
      }),
    ),
  ]);
}

// ============================================================
//  启动清理（SQLite 无临时文件，保留为 no-op）
// ============================================================

export function cleanTempFiles(): void {
  // SQLite 模式下无需清理
}
