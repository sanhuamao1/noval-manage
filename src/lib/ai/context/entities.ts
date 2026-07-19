/** 将实体列表展平为 Prompt 片段 */
export function formatEntitySection(
  label: string,
  items: Record<string, unknown>[],
): string {
  const parts: string[] = [];
  parts.push(`\n## ${label}`);

  if (items.length === 0) {
    parts.push(`（暂无数据）`);
    return parts.join("\n");
  }

  // 收集所有字段名（排除元数据、公共字段、以及已作为固定列的 id/name）
  const skipKeys = new Set(["id", "name", "createdAt", "updatedAt", "novelId", "sortOrder"]);
  const fieldKeys: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    for (const key of Object.keys(item)) {
      if (!skipKeys.has(key) && !seen.has(key)) {
        fieldKeys.push(key);
        seen.add(key);
      }
    }
  }

  // 表头：id | name | ...其他字段
  const header = ["id", "name", ...fieldKeys];
  parts.push(`\n| ${header.join(" | ")} |`);
  parts.push(`| ${header.map(() => "---").join(" | ")} |`);

  // 数据行
  for (const item of items) {
    const row = header.map((k) => {
      const v = item[k];
      if (v === undefined || v === null) return "";
      const str = typeof v === "object" ? JSON.stringify(v) : String(v);
      // 转义表格中的管道符
      return str.replace(/\|/g, "\\|");
    });
    parts.push(`| ${row.join(" | ")} |`);
  }

  return parts.join("\n");
}

/** 角色列表快捷渲染 */
export function formatCharactersSection(characters: Record<string, unknown>[]): string {
  return formatEntitySection("现有角色", characters);
}

/** 组织列表快捷渲染 */
export function formatOrganizationsSection(organizations: Record<string, unknown>[]): string {
  return formatEntitySection("现有组织/势力", organizations);
}

/** 地点列表快捷渲染 */
export function formatLocationsSection(locations: Record<string, unknown>[]): string {
  return formatEntitySection("现有地点", locations);
}