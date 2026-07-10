---
name: Polish rule config optimization
overview: 为润色规则增加分层配置系统（界限/侧重点/手法/高级设置），将配置封装为AI可识别的结构化提示词
todos:
  - id: add-config-field
    content: Prisma PolishRule 新增 config JSON 字段，定义 PolishRuleConfig 类型和配置元数据
    status: completed
  - id: create-config-editor
    content: 创建 PolishRuleConfigEditor 组件，支持所有配置项的 UI 交互（单选/多选/开关）
    status: completed
    dependencies:
      - add-config-field
  - id: update-polish-page
    content: 更新润色规则管理页面，集成配置编辑器到创建/编辑弹窗，显示配置摘要
    status: completed
    dependencies:
      - create-config-editor
  - id: update-ai-prompt
    content: 更新 buildPolishPrompt 将配置转换为结构化 AI 指令，API 传递完整 config
    status: completed
    dependencies:
      - add-config-field
  - id: update-api-init
    content: 更新 API CRUD 处理 config 字段，更新 init-db.js 默认规则配置
    status: completed
    dependencies:
      - add-config-field
  - id: update-panel
    content: 更新 PolishPanel 侧边栏规则卡片展示配置摘要，更新 memory-bank
    status: completed
    dependencies:
      - create-config-editor
---

## 润色规则配置化改造

对现有的润色规则功能进行优化，为每条规则增加可配置的参数选项，最终将配置封装为 AI 能识别的结构化指令。

### 功能要求

1. **保留现有字段**：`name`、`description` 保持不变
2. **新增配置**：每条规则支持以下四类配置参数，存储为 JSON 格式：

| 分组 | 配置项 | 选项 | 交互方式 |
| --- | --- | --- | --- |
| 界限 | 节奏 | ["快","中","慢"] | 单选 |
| 界限 | 情绪/氛围 | ["紧张","压抑","温馨","荒诞","沉重","轻松","悬疑","悲怆"] | 多选，上限2项 |
| 界限 | 叙事手法 | ["展示","告知","混合"] | 单选 |
| 侧重点 | 五感通道 | ["视觉","听觉","嗅觉","味觉","触觉"] | 多选 |
| 侧重点 | 人物描写 | ["神态/微表情","动作/小动作","心理/内心独白","语言/语气"] | 多选 |
| 侧重点 | 环境描写 | ["空间/陈设","光影/天气","气味/声音"] | 多选 |
| 手法 | 修辞 | ["可多用比喻/拟人","偏白描/克制","适度排比"] | 单选 |
| 高级设置 | 时间感与节奏变奏 | ["开","关"] | 开关 |
| 高级设置 | 对比/反差插入 | ["开","关"] | 开关 |


3. **AI 封装**：配置参数要转换为 AI 能理解的、带说明的结构化提示词文本，而不是直接拼接配置值

## 技术方案

### 技术栈

沿用现有项目技术栈：Next.js 14 + TypeScript + Prisma/SQLite + shadcn/ui 风格组件

### 数据存储设计

**PolishRule 模型新增 `config` 字段**（JSON 字符串）

配置的 TS 类型定义（将在 `src/types/polish.ts` 中定义）：

```typescript
export interface PolishRuleConfig {
  prompt?: string               // 用户自定义补充说明
  boundaries: {
    pace?: "快" | "中" | "慢"
    mood: string[]              // 最多2项
    narrative?: "展示" | "告知" | "混合"
  }
  emphasis: {
    senses: string[]            // 五感
    character: string[]        // 人物描写
    environment: string[]      // 环境描写
  }
  technique: {
    rhetoric?: string           // 修辞手法
  }
  advanced: {
    timeVariation: boolean      // 开关 → true/false
    contrastInsertion: boolean  // 开关 → true/false
  }
}
```

默认值：

```
{
  "prompt": "",
  "boundaries": { "pace": "中", "mood": [], "narrative": "混合" },
  "emphasis": { "senses": [], "character": [], "environment": [] },
  "technique": { "rhetoric": "" },
  "advanced": { "timeVariation": false, "contrastInsertion": false }
}
```

### AI 提示词生成策略

`buildPolishPrompt` 函数将配置转换为结构化指令，**仅输出已设置的选项**（空数组/空字符串/false 的选项跳过不输出），每个选项附带语义说明让 AI 理解意图。例如当设置了节奏=慢、氛围=悬疑、修辞=偏白描/克制 时：

```
【润色方向与界限】
- 叙事节奏：慢 — 放缓叙事节奏，延长场景描写和细节刻画
- 情绪氛围：悬疑 — 营造悬疑、引人探究的氛围感

【手法】
- 修辞风格：偏白描/克制 — 避免过度修饰，保持简洁克制的写实文风

【自定义说明】
用户补充要求：xxx
```

没有设置的选项（如五感通道、人物描写、叙事手法等）完全不在提示词中出现，不输出"未指定"。

每个选项值的语义说明通过一个常量映射表定义（在 `src/lib/polish-config-meta.ts` 中）。

### 架构设计

```
src/
  types/polish.ts                    -- [NEW] PolishRuleConfig 类型定义
  lib/polish-config-meta.ts          -- [NEW] 配置选项的中文描述/语义映射
  lib/ai.ts                          -- [MODIFY] buildPolishPrompt 接收 config 生成结构化指令
  components/polish/
    PolishRuleConfigEditor.tsx        -- [NEW] 配置编辑组件（可复用于创建/编辑弹窗）
    PolishPanel.tsx                   -- [MODIFY] 规则列表显示配置摘要
  app/novel/[id]/polish/page.tsx      -- [MODIFY] 创建/编辑弹窗集成配置编辑器
  app/api/polish/rules/route.ts       -- [MODIFY] CRUD 支持 config 字段
  app/api/polish/route.ts            -- [MODIFY] 传递 config 给 buildPolishPrompt
  scripts/init-db.js                 -- [MODIFY] 默认规则添加默认配置
  prisma/schema.prisma               -- [MODIFY] PolishRule 新增 config 字段
```

### 前端配置编辑器交互

配置编辑组件 `PolishRuleConfigEditor` 接收 `config: PolishRuleConfig` 和 `onChange`，内部使用现有的 UI 组件构建：

- **界限区块**（Card）：节奏（RadioGroup 水平按钮）、情绪/氛围（6列网格按钮，选中的亮色，最多2项自动限制）、叙事手法（RadioGroup 水平按钮）
- **侧重点区块**（Card）：三个多选网格区域，沿用题材多选的 h-7 紧凑按钮风格
- **手法区块**（Card）：修辞（RadioGroup 水平按钮）
- **高级设置区块**（Card）：两个开关使用 toggle 按钮（"开/关"样式）

### 性能

- 每次润色执行时从数据库读取完整 rule 对象（含 config），在 `buildPolishPrompt` 中即时组装提示词，不缓存
- 旧数据不做兼容（用户明确要求）
- PolishPanel 展示规则时，在 name/description 下方显示配置摘要标签（如 "节奏：慢 / 氛围：悬疑"）

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 用于探索当前项目中已有的 UI 组件模式（RadioGroup 的多选/单选实现、Card 布局方式），确保新组件的风格与现有代码一致
- Expected outcome: 确认可复用的组件模式和样式常量（SELECTED_CLASSES / UNSELECTED_CLASSES），减少新组件开发中的不一致