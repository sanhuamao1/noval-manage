import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync, rmSync } from "fs";
import { resolve } from "path";
import { load, dump } from "js-yaml";

// ── 目录结构 ──
// data/novels/{novelId}/novel.yml              ← 小说自身
// data/novels/{novelId}/characters/{id}.yml     ← 角色
// data/novels/{novelId}/outlines/{id}.yml       ← 大纲
// data/novels/{novelId}/chapters/{id}.yml       ← 章节
// data/novels/{novelId}/locations/{id}.yml      ← 地点
// data/novels/{novelId}/foreshadowings/{id}.yml ← 伏笔
// data/novels/{novelId}/key-events/{id}.yml     ← 关键事件
// data/novels/{novelId}/character-emotions/{id}.yml
// data/polish-rules/{id}.yml                     ← 润色规则（全局）
// data/polish-samples/{id}.yml                    ← 风格样本（全局）

const DATA_DIR = resolve(process.cwd(), "data");

// 实体 → 目录名
const ENTITY_DIRS: Record<string, string> = {
  character: "characters",
  outline: "outlines",
  chapter: "chapters",
  location: "locations",
  foreshadowing: "foreshadowings",
  "key-event": "key-events",
  "character-emotion": "character-emotions",
  "polish-rule": "polish-rules",
  "polish-sample": "polish-samples",
};

// 全局实体（不挂在 novel 目录下）
const GLOBAL_ENTITIES = new Set(["polish-rule", "polish-sample"]);

// ── ID 生成 ──
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── 路径计算 ──
function entityDir(entity: string, novelId?: string): string {
  if (entity === "novel") {
    return resolve(DATA_DIR, "novels");
  }
  if (GLOBAL_ENTITIES.has(entity)) {
    return resolve(DATA_DIR, ENTITY_DIRS[entity] ?? entity + "s");
  }
  if (!novelId) throw new Error(`实体 ${entity} 需要 novelId`);
  return resolve(DATA_DIR, "novels", novelId, ENTITY_DIRS[entity] ?? entity + "s");
}

function recordPath(entity: string, id: string, novelId?: string): string {
  if (entity === "novel") {
    return resolve(DATA_DIR, "novels", id, "novel.yml");
  }
  return resolve(entityDir(entity, novelId), `${id}.yml`);
}

// ── 读写原语 ──
function readYaml<T = Record<string, unknown>>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return load(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

function writeYaml(path: string, data: Record<string, unknown>): void {
  const dir = resolve(path, "..");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, dump(data, { lineWidth: -1 }), "utf-8");
}

// ── 单条操作 ──

/** 读取单条记录 */
export function get<T = Record<string, unknown>>(
  entity: string,
  id: string,
  novelId?: string,
): T | null {
  return readYaml<T>(recordPath(entity, id, novelId));
}

/** 写入（创建或更新）单条记录 */
export function put(
  entity: string,
  id: string,
  data: Record<string, unknown>,
  novelId?: string,
): void {
  // 自动补充 id 和时间戳
  const existingRecord = (get(entity, id, novelId) ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();
  const record: Record<string, unknown> = {
    ...existingRecord,
    ...data,
  };
  record.id = id;
  record.createdAt = existingRecord.createdAt ?? now;
  record.updatedAt = now;
  writeYaml(recordPath(entity, id, novelId), record);
}

/** 删除单条记录 */
export function remove(entity: string, id: string, novelId?: string): void {
  const path = recordPath(entity, id, novelId);
  if (existsSync(path)) unlinkSync(path);
}

// ── 列表操作 ──

/** 列出某实体的所有记录 */
export function list<T = Record<string, unknown>>(
  entity: string,
  novelId?: string,
): T[] {
  const dir = entityDir(entity, novelId);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yml"))
    .map((f) => readYaml<T>(resolve(dir, f)))
    .filter((v): v is T => v !== null);
}

/** 按字段过滤列表 */
export function listBy<T = Record<string, unknown>>(
  entity: string,
  field: string,
  value: string,
  novelId?: string,
): T[] {
  return list<T>(entity, novelId).filter(
    (r) => (r as Record<string, unknown>)[field] === value,
  );
}

/** 获取最大 sortOrder + 1 */
export function nextSortOrder(entity: string, novelId?: string): number {
  const items = list<{ sortOrder?: number }>(entity, novelId);
  const max = items.reduce((mx, item) => Math.max(mx, item.sortOrder ?? -1), -1);
  return max + 1;
}

// ── Novel 特殊操作 ──

/** 列出所有小说 */
export function listNovels<T = Record<string, unknown>>(): T[] {
  const novelsDir = resolve(DATA_DIR, "novels");
  if (!existsSync(novelsDir)) return [];
  return readdirSync(novelsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => readYaml<T>(resolve(novelsDir, d.name, "novel.yml")))
    .filter((v): v is T => v !== null)
    .sort((a, b) => {
      const aTime = (a as Record<string, string>)?.updatedAt ?? "";
      const bTime = (b as Record<string, string>)?.updatedAt ?? "";
      return bTime.localeCompare(aTime);
    });
}

/** 读取小说 */
export function getNovel<T = Record<string, unknown>>(novelId: string): T | null {
  return readYaml<T>(recordPath("novel", novelId));
}

/** 创建小说（含目录结构） */
export function createNovel(title: string, description?: string): Record<string, unknown> {
  const id = genId();
  const now = new Date().toISOString();
  const novel = { id, title, description: description ?? null, createdAt: now, updatedAt: now };
  writeYaml(recordPath("novel", id), novel);
  return novel;
}

/** 更新小说 */
export function updateNovel(novelId: string, data: Record<string, unknown>): Record<string, unknown> | null {
  const existing = getNovel(novelId);
  if (!existing) return null;
  const updated: Record<string, unknown> = { ...existing, ...data };
  updated.id = novelId;
  updated.updatedAt = new Date().toISOString();
  writeYaml(recordPath("novel", novelId), updated);
  return updated;
}

/** 删除小说及其所有子数据 */
export function removeNovel(novelId: string): void {
  const novelDir = resolve(DATA_DIR, "novels", novelId);
  if (existsSync(novelDir)) rmSync(novelDir, { recursive: true });
}

/** 计算小说字数 */
export function getNovelWordCount(novelId: string): number {
  const chapters = list<{ content?: string }>("chapter", novelId);
  return chapters.reduce((sum, ch) => sum + (ch.content?.length ?? 0), 0);
}

/** 统计小说下某实体数量 */
export function count(entity: string, novelId: string): number {
  return list(entity, novelId).length;
}

// ── 关系数据 ──
// 存储路径：data/novels/{novelId}/relations.yml
// 格式：{ relations: { links: [{ source, target, description }], positions: { [charId]: { x, y } } } }

export interface RelationRecord {
  source: string;
  target: string;
  description: string;
}

export interface NodePosition {
  x: number;
  y: number;
}

interface RelationsFile {
  relations?: {
    links?: RelationRecord[];
    positions?: Record<string, NodePosition>;
  };
}

/** 读取关系数据（含 links 和 positions） */
export function getRelations(novelId: string): { links: RelationRecord[]; positions: Record<string, NodePosition> } {
  const path = resolve(DATA_DIR, "novels", novelId, "relations.yml");
  const data = readYaml<RelationsFile>(path);
  return {
    links: data?.relations?.links ?? [],
    positions: data?.relations?.positions ?? {},
  };
}

/** 保存小说关系列表 */
export function saveRelations(novelId: string, links: RelationRecord[]): void {
  const path = resolve(DATA_DIR, "novels", novelId, "relations.yml");
  const dir = resolve(path, "..");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const existing = readYaml<RelationsFile>(path);
  const positions = existing?.relations?.positions ?? {};
  writeYaml(path, { relations: { links, positions } });
}

/** 保存节点位置 */
export function savePositions(novelId: string, positions: Record<string, NodePosition>): void {
  const path = resolve(DATA_DIR, "novels", novelId, "relations.yml");
  const dir = resolve(path, "..");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const existing = readYaml<RelationsFile>(path);
  const links = existing?.relations?.links ?? [];
  writeYaml(path, { relations: { links, positions } });
}

/** 追加单条关系 link */
export function appendRelationLink(novelId: string, link: RelationRecord): void {
  const path = resolve(DATA_DIR, "novels", novelId, "relations.yml");
  const existing = readYaml<RelationsFile>(path);
  const links = [...(existing?.relations?.links ?? []), link];
  const positions = existing?.relations?.positions ?? {};
  writeYaml(path, { relations: { links, positions } });
}

// ── 梦工厂对话 ──
// 存储路径：data/novels/{novelId}/factory/{convId}.yml

interface FactoryConversationFile {
  messages: Array<{ role: string; content: string }>;
}

function factoryConvPath(novelId: string, convId: string): string {
  return resolve(DATA_DIR, "novels", novelId, "factory", `${convId}.yml`);
}

/** 读取梦工厂对话历史 */
export function getFactoryConversation(novelId: string, convId: string): Array<{ role: string; content: string }> {
  const data = readYaml<FactoryConversationFile>(factoryConvPath(novelId, convId));
  return data?.messages ?? [];
}

/** 保存梦工厂对话历史 */
export function saveFactoryConversation(
  novelId: string,
  convId: string,
  messages: Array<{ role: string; content: string }>,
): void {
  writeYaml(factoryConvPath(novelId, convId), { messages });
}
