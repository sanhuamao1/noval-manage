/**
 * AI Operations 共享配置与 Prompt 片段生成
 *
 * 所有基于 operations（changeType/JSON输出/API路由）的 AI workflow
 * 共用此模块的数据和方法，避免重复维护。
 */

// ── 集中配置 ──

/** API 路由 → 标签名 + 允许的方法（单一数据源，同时驱动 validators 和 Prompt） */
export const OPERATION_ENTITIES: Record<
  string,
  { label: string; methods: readonly string[] }
> = {
  "/api/characters": { label: "角色", methods: ["POST", "PUT", "DELETE"] },
  "/api/organizations": { label: "组织/势力", methods: ["POST", "PUT", "DELETE"] },
  "/api/locations": { label: "地点", methods: ["POST", "PUT", "DELETE"] },
  "/api/relations/link": { label: "关系", methods: ["POST"] },
};

/** 允许的 API 白名单（从 OPERATION_ENTITIES 派生） */
export const ALLOWED_APIS: readonly string[] = Object.keys(OPERATION_ENTITIES);

/** 校验 API+method 组合是否合法 */
export function isAllowedApiMethod(api: string, method: string): boolean {
  const entry = OPERATION_ENTITIES[api];
  return !!entry && (entry.methods as readonly string[]).includes(method);
}

// ── Prompt 片段生成 ──

/**
 * JSON 输出格式模板 + changeType 表 + novelId vs id 区别说明
 * 所有 operations-based workflow 通用
 */
export function buildOperationOutputSection(novelId: string): string {
  const parts: string[] = [];

  parts.push(`\n---`);
  parts.push(`\n## 输出要求`);
  parts.push(
    `\n你必须以**严格 JSON** 格式输出，不要包裹在 markdown 代码块中。输出格式为一个 JSON 对象：`,
  );

  const f = "```";
  parts.push(`\n${f}json`);
  parts.push(`{`);
  parts.push(`  "analysis": "整体分析简述，说明本次完善的核心思路",`);
  parts.push(`  "operations": Operation[]`);
  parts.push(`}`);
  parts.push(f);

  parts.push(`\n### Operation 类型定义`);
  parts.push(`\n每个 operation 包含以下字段：`);
  parts.push(`\n| 字段 | 类型 | 说明 |`);
  parts.push(`|------|------|------|`);
  parts.push(`| changeType | "add" \\| "update" \\| "delete" | 操作类型 |`);
  parts.push(`| reason | string | 执行原因，限制200字以内 |`);
  parts.push(`| summary | string | 一句话概括操作内容 |`);
  parts.push(`| api | string | API 路径，见下方 API 路径对照表 |`);
  parts.push(`| method | "POST" \\| "PUT" \\| "DELETE" | HTTP 方法 |`);
  parts.push(`| params | object | 根据 changeType 和 api 参照上方字段模板填写 |`);

  parts.push(`\n### Operation 示例（add / update / delete）`);

  parts.push(`\n**新增 (add)**：params 需包含 novelId + name + 要设置的字段`);
  parts.push(`${f}json`);
  parts.push(`{`);
  parts.push(`  "changeType": "add",`);
  parts.push(`  "reason": "新增角色的原因",`);
  parts.push(`  "summary": "一句话概括",`);
  parts.push(`  "api": "/api/characters",`);
  parts.push(`  "method": "POST",`);
  parts.push(`  "params": {`);
  parts.push(`    "novelId": "${novelId}",`);
  parts.push(`    "name": "角色名",`);
  parts.push(`    ...其他字段（参照上方字段表和字段类型示例）`);
  parts.push(`  }`);
  parts.push(`}`);
  parts.push(f);

  parts.push(`\n**更新 (update)**：params 需包含 novelId + id + 要修改的字段（一次只改一个字段）`);
  parts.push(`${f}json`);
  parts.push(`{`);
  parts.push(`  "changeType": "update",`);
  parts.push(`  "reason": "修改字段的原因",`);
  parts.push(`  "summary": "一句话概括",`);
  parts.push(`  "api": "/api/characters",`);
  parts.push(`  "method": "PUT",`);
  parts.push(`  "params": {`);
  parts.push(`    "novelId": "${novelId}",`);
  parts.push(`    "id": "实体的id（从上文实体表格的 id 列获取）",`);
  parts.push(`    "字段名": "新值"`);
  parts.push(`  }`);
  parts.push(`}`);
  parts.push(f);

  parts.push(`\n**删除 (delete)**：params 需包含 novelId + id`);
  parts.push(`${f}json`);
  parts.push(`{`);
  parts.push(`  "changeType": "delete",`);
  parts.push(`  "reason": "删除实体的原因",`);
  parts.push(`  "summary": "一句话概括",`);
  parts.push(`  "api": "/api/characters",`);
  parts.push(`  "method": "DELETE",`);
  parts.push(`  "params": {`);
  parts.push(`    "novelId": "${novelId}",`);
  parts.push(`    "id": "要删除的实体id（从上文实体表格的 id 列获取）"`);
  parts.push(`  }`);
  parts.push(`}`);
  parts.push(f);

  parts.push(`\n- **novelId**：固定为 \`"${novelId}"\`，所有操作都必须使用这个值`);
  parts.push(
    `- **实体 id**：每个实体的唯一标识，从上文实体表格的 id 列获取`,
  );

  return parts.join("\n");
}

/**
 * API 路径对照 Markdown 表
 * 从 OPERATION_ENTITIES 自动生成
 */
export function buildOperationApiTable(): string {
  const parts: string[] = [];
  parts.push(`\n### API 路径对照`);
  parts.push(`\n| 实体 | API 路径 |`);
  parts.push(`|------|----------|`);

  for (const [api, entry] of Object.entries(OPERATION_ENTITIES)) {
    parts.push(`| ${entry.label} | ${api} |`);
  }

  return parts.join("\n");
}

/**
 * 通用规则（带序号 1-5）
 * 在此之后各 workflow 追加特有规则（不加序号）
 */
export function buildOperationRulesSection(): string {
  const parts: string[] = [];
  parts.push(`\n### 重要规则`);
  parts.push(`\n1. **字段名约束**：只使用"可用字段"列表中定义的字段名，不要自创字段`);
  parts.push(
    `2. **字段值约束**：single 类型须用可选值参考中的选项；multi/tags 用 JSON 数组；list 用字符串数组（分号分隔）`,
  );
  parts.push(`3. **update 粒度**：一个操作只改一个字段`);
  parts.push(`4. **必须输出纯 JSON**：不要用 markdown 代码块包裹，不要加额外说明文字`);

  return parts.join("\n");
}