import type { NovelConfig } from "@/lib/configs/generated";

/** API 返回的小说数据 = 可编辑配置 + 系统字段 */
export interface NovelData extends Omit<NovelConfig, "description"> {
  id: string;
  /** API 保证 title 必返 */
  title: string;
  /** API 中 description 为 null（数据库层面），编辑器中为 undefined */
  description: string | null;
  wordCount?: number;
  _count?: { chapters: number; characters: number };
  createdAt: string;
  updatedAt: string;
}
