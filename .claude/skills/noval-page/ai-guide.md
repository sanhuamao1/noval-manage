# AI 调用与 Prompt 组装

## 目录结构

```
src/lib/ai/
├── ai.ts                         # 底层调用：callAI / callAIStream
├── json-parser.ts                # 通用 JSON 解析：extractJSON / closePartialJSON
├── operations-schema.ts          # Operations 共享配置 + Prompt 片段
├── validators.ts                 # 操作校验：validateOperation
├── context/                      # 数据→Prompt 片段（按需取用）
│   ├── field-schema.ts           # buildFieldSchema — YAML 字段手册
│   ├── novel.ts                  # formatNovelSection — 小说基本信息
│   ├── entities.ts               # formatEntitySection / Characters / Orgs / Locations
│   └── relations.ts              # formatRelationsSection — 角色关系网络
└── prompt/                       # 组装完整 Prompt
    ├── enrich-settings.ts        # buildEnrichSettingPrompt（operations 工作流）
    ├── polish.ts                 # buildPolishPrompt（润色规则）
    └── style.ts                  # buildStylePrompt（风格样本）
```

## 底层调用 (`ai.ts`)

```ts
import { callAI } from "@/lib/ai";           // 非流式，返回完整结果
import { callAIStream } from "@/lib/ai";      // 流式，AsyncGenerator<chunk>
```

## JSON 解析 (`json-parser.ts`)

从 AI 流式响应的 raw text 中提取合法 JSON，处理 markdown 围栏包裹和截断场景：

```ts
import { extractJSON } from "@/lib/ai/json-parser";

const jsonStr = extractJSON(rawText);
const parsed = JSON.parse(jsonStr);
```

## Operations 工作流

### 共享配置 (`operations-schema.ts`)

所有 operations-based AI workflow 共用：

| 导出 | 用途 |
|------|------|
| `OPERATION_ENTITIES` | API→标签+方法的唯一数据源 |
| `buildOperationOutputSection(novelId)` | JSON 格式模板 + changeType 表 + novelId 说明 |
| `buildOperationApiTable()` | API 路径对照 Markdown 表（从 OPERATION_ENTITIES 自动生成） |
| `buildOperationRulesSection()` | 通用规则 1-5（有序号） |

### 操作校验 (`validators.ts`)

```ts
import { validateOperation } from "@/lib/ai/validators";

// 校验 AI 返回的 operation 是否合法（API 白名单 + method 匹配 + 必需参数）
if (validateOperation(op, novelId)) { ... }
```

### 新增 Operations 工作流

在 `ai/prompt/` 下新建文件，组合 context 模块 + operations-schema：

```ts
// prompt/new-workflow.ts
import { formatNovelSection } from "../context/novel";
import { formatCharactersSection, formatOrganizationsSection } from "../context/entities";
import { formatRelationsSection } from "../context/relations";
import {
  buildOperationOutputSection,
  buildOperationApiTable,
  buildOperationRulesSection,
} from "../operations-schema";

export function buildNewWorkflowPrompt(novelId, novel, characters, ...) {
  return [
    "# 任务：...",
    formatNovelSection(novel),
    formatCharactersSection(characters),
    formatOrganizationsSection(organizations),
    formatRelationsSection(relations.links, characters),
    buildOperationOutputSection(novelId),   // 共享
    buildOperationApiTable(),                // 共享
    buildOperationRulesSection(),            // 共享
    "**特有规则**：...",                      // 不加序号
  ].filter(Boolean).join("\n");
}
```

## Context 模块

Context 模块将运行时数据格式化为 Prompt 片段，各 workflow 按需引入：

```ts
import { formatNovelSection } from "@/lib/ai/context/novel";
import { formatCharactersSection } from "@/lib/ai/context/entities";
import { formatRelationsSection } from "@/lib/ai/context/relations";
import { buildFieldSchema } from "@/lib/ai/context/field-schema";
```

**特点**：每个模块独立，未来 AI tab（如"故事分析"）可以只取 `formatCharactersSection` + `formatRelationsSection`，无需拉入 locations。

## 非 Operations 工作流

润色等不涉及 operations 的流程，有自己的 Prompt 构建函数：

```ts
import { buildPolishPrompt } from "@/lib/ai/prompt/polish";
import { buildStylePrompt } from "@/lib/ai/prompt/style";
```

## 参考文件

- [src/lib/ai.ts](../../../src/lib/ai.ts)
- [src/lib/ai/operations-schema.ts](../../../src/lib/ai/operations-schema.ts)
- [src/lib/ai/prompt/enrich-settings.ts](../../../src/lib/ai/prompt/enrich-settings.ts)
- [src/app/api/factory/enrich-settings/route.ts](../../../src/app/api/factory/enrich-settings/route.ts)