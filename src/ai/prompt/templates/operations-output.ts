export const OPERATIONS_OUTPUT_TEMPLATE = `---

## 输出要求

你必须以**严格 JSON** 格式输出，不要包裹在 markdown 代码块中。输出格式为一个 JSON 对象：

\`\`\`json
{
  "analysis": "整体分析简述，说明本次完善的核心思路",
  "operations": Operation[]
}
\`\`\`

### Operation 类型定义

每个 operation 包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| changeType | "add" \\| "update" \\| "delete" | 操作类型 |
| reason | string | 执行原因，限制200字以内 |
| summary | string | 一句话概括操作内容 |
| api | string | API 路径，见下方 API 路径对照表 |
| method | "POST" \\| "PUT" \\| "DELETE" | HTTP 方法 |
| params | object | 根据 changeType 和 api 参照上方字段模板填写 |

### Operation 示例（add / update / delete）

**新增 (add)**：params 需包含 novelId + name + 要设置的字段
\`\`\`json
{
  "changeType": "add",
  "reason": "新增角色的原因",
  "summary": "一句话概括",
  "api": "/api/characters",
  "method": "POST",
  "params": {
    "novelId": "{{novelId}}",
    "name": "角色名",
    ...其他字段（参照上方字段表和字段类型示例）
  }
}
\`\`\`

**更新 (update)**：params 需包含 novelId + id + 要修改的字段（一次只改一个字段）
\`\`\`json
{
  "changeType": "update",
  "reason": "修改字段的原因",
  "summary": "一句话概括",
  "api": "/api/characters",
  "method": "PUT",
  "params": {
    "novelId": "{{novelId}}",
    "id": "实体的id（从上文实体表格的 id 列获取）",
    "字段名": "新值"
  }
}
\`\`\`

**删除 (delete)**：params 需包含 novelId + id
\`\`\`json
{
  "changeType": "delete",
  "reason": "删除实体的原因",
  "summary": "一句话概括",
  "api": "/api/characters",
  "method": "DELETE",
  "params": {
    "novelId": "{{novelId}}",
    "id": "要删除的实体id（从上文实体表格的 id 列获取）"
  }
}
\`\`\`

- **novelId**：固定为 \`"{{novelId}}"\`，所有操作都必须使用这个值
- **实体 id**：每个实体的唯一标识，从上文实体表格的 id 列获取

### API 路径对照

| 实体 | API 路径 |
|------|----------|
{{apiRows}}

### 重要规则

1. **字段名约束**：只使用"可用字段"列表中定义的字段名，不要自创字段
2. **字段值约束**：single 类型须用可选值参考中的选项；multi/tags 用 JSON 数组；list 用字符串数组（分号分隔）
3. **update 粒度**：一个操作只改一个字段
4. **必须输出纯 JSON**：不要用 markdown 代码块包裹，不要加额外说明文字`;
