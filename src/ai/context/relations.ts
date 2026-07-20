type RelationLink = {
  source: string;
  target: string;
  description: string;
  sourceName?: string;
  targetName?: string;
};

/** 渲染角色关系网络为 Prompt 片段 */
export function formatRelationsSection(links: RelationLink[]): string {
  const parts: string[] = [];
  parts.push("\n## 现有角色关系网络");
  parts.push("格式为 `角色A -> 角色B：关系描述`，同一对角色可能存在双向关系。");

  if (links.length === 0) {
    parts.push("（暂无关系数据）");
    return parts.join("\n");
  }

  console.log(links);
  for (const r of links) {
    const sourceName = r.sourceName ?? r.source;
    const targetName = r.targetName ?? r.target;
    parts.push(`- ${sourceName} -> ${targetName}：${r.description || "(无描述)"}`);
  }

  return parts.join("\n");
}
