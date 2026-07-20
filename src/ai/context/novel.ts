/** 将小说数据格式化为 Prompt 片段 */
export function formatNovelSection(novel: Record<string, unknown>): string {
  const novelTitle = (novel.title as string) || "未命名";
  const novelDesc = (novel.description as string) || "";

  const parts: string[] = [];
  parts.push(`\n## 小说基本信息\n- **书名**：${novelTitle}`);
  if (novelDesc) parts.push(`- **简介**：${novelDesc}`);

  const metaFields = new Set(["id", "createdAt", "updatedAt", "title", "description"]);
  const novelFields = Object.entries(novel).filter(
    ([k, v]) => !metaFields.has(k) && v && String(v).trim() !== "",
  );
  if (novelFields.length > 0) {
    parts.push("\n## 小说详细设定");
    for (const [key, value] of novelFields) {
      parts.push(`- **${key}**：${value}`);
    }
  }

  return parts.join("\n");
}