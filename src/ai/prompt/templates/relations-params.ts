export const RELATIONS_PARAMS_TEMPLATE = `

## 关系 操作参数模板

API 路径：\`/api/relations/link\`（仅支持新增单条关系）

关系的 source 和 target 必须使用上文实体标题括号内的 id

**新增关系 (changeType: "add", method: "POST")**
\`\`\`json
{
  "changeType": "add",
  "reason": "说明为什么需要建立这个关系",
  "summary": "一句话描述关系内容",
  "api": "/api/relations/link",
  "method": "POST",
  "params": {
    "novelId": "{{novelId}}",
    "link": {
      "source": "源实体id",
      "target": "目标实体id",
      "description": "关系描述"
    }
  }
}
\`\`\``;