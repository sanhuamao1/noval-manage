# AI 调用与 Prompt 组装

## 快速入口

| 你想… | 用 |
|--------|-----|
| 调用 AI（非流式） | `callAI(prompt)` or `callAIChat(messages, opts)` from `@/ai` |
| 调用 AI（流式） | `callAIStream({ prompt, ... })` from `@/ai` |
| 组装"生成大纲" Prompt | `buildGenOutlinePrompt(novel, characters, orgs, locations, relations, framework, content?, userPrompt?)` from `@/ai/prompt` |
| 组装"完善设定" Prompt | `buildEnrichSettingPrompt(novelId, novel, characters, orgs, locations, userPrompt?)` from `@/ai/prompt` |
| 组装"润色规则" Prompt | `buildPolishPrompt(rule, text)` from `@/ai/prompt` |
| 组装"风格样本" Prompt | `buildStylePrompt(samples)` from `@/ai/prompt` |
| 生成字段定义表 | `buildFieldSchema(novelId, entities?)` — 可选 `[ConfigEntity.CHARACTER, ...]` 筛选 |
| 格式化小说信息 | `formatNovelSection(novel)` from `@/ai/context/novel` |
| 格式化角色/组织/地点 | `formatCharactersSection` / `formatOrganizationsSection` / `formatLocationsSection` from `@/ai/context/entities` |
| 格式化关系网络 | `formatRelationsSection(links)` from `@/ai/context/relations` — links 含 sourceName/targetName |
| 解析 AI 返回的 JSON | `extractJSON(rawText)` from `@/ai/json-parser` |
| 校验 operation | `validateOperation(op, novelId)` from `@/ai/validators` |

## 核心概念

### 目录结构

```
src/ai/
├── index.ts              # callAI / callAIChat / callAIStream
├── json-parser.ts        # extractJSON / closePartialJSON
├── validators.ts         # OPERATION_ENTITIES / validateOperation
├── context/              # 数据 → Prompt 片段
│   ├── novel.ts           #   formatNovelSection
│   ├── entities.ts        #   formatCharactersSection / Organizations / Locations
│   ├── relations.ts       #   formatRelationsSection
│   └── field-schema.ts    #   buildFieldSchema
└── prompt/
    ├── index.ts           # buildGenOutlinePrompt / buildEnrichSettingPrompt / buildPolishPrompt / buildStylePrompt
    ├── buildOperationOutputSection.ts  # 完善设定输出格式（JSON 模板 + API 表 + 规则）
    ├── buildRandomizationRules.ts      # 大纲随机化规则
    └── templates/         # Prompt 模板（编译时内联，{{变量}} 运行时替换）
        ├── operations-output.ts
        ├── gen-outline-output.ts
        └── relations-params.ts
```

### 两条工作流

**Operations 工作流**（完善设定）：输出 JSON `{ analysis, operations: Operation[] }` → 前端批量调 API 执行。核心函数 `buildEnrichSettingPrompt` 组合 context 模块 + `buildOperationOutputSection` + 特有规则。

**文本输出工作流**（生成大纲 / 润色）：输出纯 markdown 或文本，直接返回给用户。

### 新增 Operations 工作流

```ts
import { formatNovelSection } from "@/ai/context/novel";
import { formatCharactersSection } from "@/ai/context/entities";
import { formatRelationsSection } from "@/ai/context/relations";
import { buildFieldSchema } from "@/ai/context/field-schema";
import buildOperationOutputSection from "@/ai/prompt/buildOperationOutputSection";

export function buildNewWorkflowPrompt(novelId, novel, characters, relations, ...) {
  return [
    "# 任务：...",
    buildFieldSchema(novelId, [ConfigEntity.CHARACTER]),   // 按需筛选实体
    formatNovelSection(novel),
    formatCharactersSection(characters),
    formatRelationsSection(relations),                     // 不再需要传 characters
    buildOperationOutputSection(novelId),
    "**特有规则**：...",
  ].filter(Boolean).join("\n");
}
```

### 新增 Prompt 模板

在 `src/ai/prompt/templates/` 下新建 `.ts` 文件导出模板常量。需要变量时用 `{{name}}` 占位符，调用方 `.replace / .replaceAll` 注入。

## 参考文件

| 位置 | 内容 |
|------|------|
| [src/ai/](../../src/ai/) | AI 调用、JSON 解析、校验 |
| [src/ai/context/](../../src/ai/context/) | 数据 → Prompt 片段（novel / entities / relations / field-schema） |
| [src/ai/prompt/](../../src/ai/prompt/) | 完整 Prompt 组装 + templates |
| 测试：[scripts/test-gen-outline-prompt.ts](../../scripts/test-gen-outline-prompt.ts)、[scripts/test-enrich-prompt.ts](../../scripts/test-enrich-prompt.ts) | 从 DB 读取数据生成 Prompt 并输出到文件 |
