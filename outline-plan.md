# 小说AI辅助工具 — 大纲功能完整方案

## 一、概述

本方案为小说AI辅助工具提供完整的大纲管理功能，核心设计理念：

- **每章一份大纲**，大纲与章节 1:1 对应
- 大纲包含 **时间/地点/情感走势/伏笔** 等完整信息
- 人物状态和关键事件使用独立表存储
- 大纲编辑采用 **声明式配置**（config-defs）方式
- 支持动态选项（storeKey）从全局 context 获取数据

---

## 二、数据模型设计

### 2.1 完整 Prisma Schema

```prisma
// ============================================
// 原有模型（简化后）
// ============================================

model Novel {
  id          String            @id @default(cuid())
  title       String
  description String?
  config      String            @default('{"genre":["玄幻"],"status":"连载中"}')
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  chapters    Chapter[]
  characters  Character[]
  outlines    Outline[]
}

model Chapter {
  id                String   @id @default(cuid())
  novelId           String
  novel             Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  title             String
  content           String
  status            String   @default("draft")  // draft / published
  sortOrder         Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  outline           Outline? // 一对一反向关系
}

model Character {
  id          String   @id @default(cuid())
  novelId     String
  novel       Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  name        String
  config      String   @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ============================================
// 新增：大纲模型
// ============================================

model Outline {
  id              String    @id @default(cuid())
  novelId         String
  novel           Novel     @relation(fields: [novelId], references: [id], onDelete: Cascade)
  chapterId       String    @unique  // 一对一关联章节
  chapter         Chapter   @relation(fields: [chapterId], references: [id], onDelete: Cascade)

  // 标题
  title           String    // 章纲标题

  // 大纲内容（两个字段）
  contentBrief    String?   // 简约版大纲（80字以内）
  contentDetail   String?   // 详细版大纲（400字以内）

  // 时间
  timeline        String?   // 自由文本：如"春-上午""天元历127年三月廿·深夜"

  // 地点
  location        String?   // 主要地点

  // 基调（使用 novel-defs 的 toneOptions）
  tone            String?   // 轻松/紧张/悲壮/温馨/悬疑

  // 状态
  status          String    @default("planned")
  // planned / writing / completed / skipped

  // 排序
  sortOrder       Int       @default(0)

  // 配置（JSON 字符串）
  // 包含：scenes[], keyEvents[], foreshadowings[], emotionChanges[]
  config          String    @default("{}")

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // 关系
  characterStates CharacterState[]
  keyEvents       KeyEvent[]
}
```

### 2.2 人物状态表（独立）

```prisma
model CharacterState {
  id          String    @id @default(cuid())
  novelId     String
  novel       Novel     @relation(fields: [novelId], references: [id], onDelete: Cascade)
  outlineId   String
  outline     Outline   @relation(fields: [outlineId], references: [id], onDelete: Cascade)
  characterId String
  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  // 情感变化
  // 格式：{"from": "平静", "to": "震惊", "intensity": 8}
  emotionFrom   String?   // 变化前情绪
  emotionTo     String    // 变化后情绪
  intensity     Int       @default(5)  // 情绪强度 1-10
  description   String?   // 变化原因/触发事件（可选）

  createdAt     DateTime  @default(now())
}
```

### 2.3 关键事件表（独立）

```prisma
model KeyEvent {
  id          String    @id @default(cuid())
  novelId     String
  novel       Novel     @relation(fields: [novelId], references: [id], onDelete: Cascade)
  outlineId   String
  outline     Outline   @relation(fields: [outlineId], references: [id], onDelete: Cascade)

  title       String    // 事件名称

  createdAt   DateTime  @default(now())
}
```

### 2.4 删除的模型

- ~~`Brainstorm`~~ — 不再需要
- ~~`CharacterEmotion`~~ — 被 CharacterState 替代

---

## 三、数据格式详解

### 3.1 config JSON 结构

```json
{
  "scenes": ["房子", "广场", "竹林"],
  "keyEvents": ["初遇", "背叛"],
  "foreshadowings": ["玉佩秘密", "师兄身份"],
  "characterIds": ["char_001", "char_002"]
}
```

### 3.2 CharacterState.emotionTo 枚举值

预定义情绪选项（方便统计和颜色管理）：

| 情绪 | 颜色 | 图标 |
|------|------|------|
| 喜悦 | #22c55e (green) | Smile |
| 悲伤 | #3b82f6 (blue) | Frown |
| 愤怒 | #ef4444 (red) | Zap |
| 恐惧 | #6b21a8 (purple) | AlertTriangle |
| 紧张 | #f59e0b (amber) | Activity |
| 坚定 | #10b981 (emerald) | Shield |
| 担忧 | #6366f1 (indigo) | CloudRain |
| 安心 | #14b8a6 (teal) | CheckCircle |
| 好奇 | #f97316 (orange) | Search |
| 震惊 | #ec4899 (pink) | Bomb |
| 失望 | #64748b (slate) | CloudDrizzle |
| 期待 | #a855f7 (purple) | Sparkles |
| 愧疚 | #78716c (stone) | HeartCrack |
| 嫉妒 | #16a34a (green) | EyeOff |
| 平静 | #0ea5e9 (sky) | Wind |

### 3.3 情感走势展示

```
林小凡
  平静(5) → 震惊(8)
  ↑触发：发现密信内容

苏婉儿
  担忧(6) → 安心(4)
  ↑触发：看到林小凡平安归来
```

---

## 四、功能模块

### 4.1 大纲总览

**入口：** `/novel/[id]/outlines`

**UI 形态：** 表格视图

| 章节 | 标题 | 时间 | 地点 | 状态 | 操作 |
|------|------|------|------|------|------|
| 1 | 命运相遇 | 春·清晨 | 青云宗山门 | 🟢 已完成 | 编辑 |
| 2 | 暗流涌动 | 春·深夜 | 后山竹林 | 🟡 写作中 | 编辑 |
| 3 | 初次冲突 | 春·傍晚 | 弟子宿舍 | ⚪ 已规划 | 编辑 |

### 4.2 大纲编辑

**入口：** 点击大纲行 或 `/novel/[id]/outlines/edit?[chapterId=xxx]`

**UI 布局：** 声明式配置渲染

```
┌─────────────────────────────────────────────────────────────┐
│  大纲编辑 — 第2章：暗流涌动                    [保存] [取消] │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┬─────────────────────────────────┐│
│  │ 基本信息               │  时空                           ││
│  │ 标题：暗流涌动         │  时间：[春-深夜]                ││
│  │                       │  地点：[后山竹林]               ││
│  │ 简约大纲：             │                                 ││
│  │ [林小凡秘密潜入后山...] │  场景：                       ││
│  │                       │  [房子 ▼] [广场 ▼] [+]         ││
│  │ 详细大纲：             │                                 ││
│  │ [分场景详细规划...]    │  ─────────────────────────────  ││
│  │                       │  基调：                         ││
│  │ 出场人物：             │  [紧张▼]                        ││
│  │ [● 林小凡] [● 张师兄] │                                 ││
│  │ [+添加]                │  ─────────────────────────────  ││
│  │                       │  伏笔：                         ││
│  │  ──────────────────── │  [玉佩秘密 ▼] [师兄身份 ▼] [+] ││
│  │ 情感走势               │                                 ││
│  │                       │  ─────────────────────────────  ││
│  │ 林小凡                 │  关键事件：                     ││
│  │   发现密信 → 震惊(8)  │  [初遇 ▼] [背叛 ▼] [+]        ││
│  │   听到真相 → 愤怒(9)  │                                 ││
│  │                       │  ─────────────────────────────  ││
│  │ 张师兄                 │  进度                           ││
│  │   家人被挟持 → 决绝  │  状态: [🟡 写作中▼]             ││
│  │                       │  排序: [#2]                    ││
│  │  ──────────────────── │                                 ││
│  │ 关键事件               │  └─────────────────────────────┘│
│  │ [初遇] [背叛]         │
│  │ [+添加]                │
│  │  ──────────────────── │
│  │ 伏笔                   │
│  │ [玉佩秘密]             │
│  │ [+添加]                │
│  └───────────────────────┴─────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## 五、大纲编辑配置定义

### 5.1 outline-defs.ts

```typescript
// src/lib/configs/outline-defs.ts

import {
  buildDefaultValues,
  flattenFields,
  type ConfigOf,
  type ConfigOption,
  type ConfigSection,
  type ConfigFieldDef,
} from "@/lib/configs/config-utils";
import { toneOptions as NOVEL_TONE_OPTIONS } from "@/lib/configs/novel-defs";

// ─── 情绪选项（用于 CharacterState）───

const emotionOptions: ConfigOption[] = [
  { value: "喜悦", icon: "Smile", color: "success" },
  { value: "悲伤", icon: "Frown", color: "default" },
  { value: "愤怒", icon: "Zap", color: "destructive" },
  { value: "恐惧", icon: "AlertTriangle", color: "default" },
  { value: "紧张", icon: "Activity", color: "warn" },
  { value: "坚定", icon: "Shield", color: "success" },
  { value: "担忧", icon: "CloudRain", color: "default" },
  { value: "安心", icon: "CheckCircle", color: "success" },
  { value: "好奇", icon: "Search", color: "warn" },
  { value: "震惊", icon: "Bomb", color: "destructive" },
  { value: "失望", icon: "CloudDrizzle", color: "default" },
  { value: "期待", icon: "Sparkles", color: "warn" },
  { value: "平静", icon: "Wind", color: "success" },
];

// ─── 状态选项 ───

const outlineStatusOptions: ConfigOption[] = [
  { value: "planned", icon: "Calendar" },
  { value: "writing", icon: "PenTool" },
  { value: "completed", icon: "CheckCircle" },
  { value: "skipped", icon: "SkipForward" },
];

// ─── 扩展字段定义：支持 storeKey 动态获取选项 ───

export interface DynamicConfigFieldDef<K extends string = string> extends Omit<ConfigFieldDef<K>, 'options'> {
  /** 从全局 context 获取选项的 key */
  storeKey?: string;
  options?: ConfigOption[];
}

// ─── 配置定义（单一数据源） ───

export const OUTLINE_CONFIG_SECTIONS: ConfigSection[] = [
  {
    type: "grid",
    cols: 2,
    sections: [
      {
        type: "card",
        title: "基本信息",
        icon: "FileText",
        children: [
          { key: "title", label: "标题", type: "text", placeholder: "章纲标题" },
          {
            key: "contentBrief",
            label: "简约大纲",
            type: "text",
            placeholder: "80字以内概述本章",
            maxLength: 80,
          },
          {
            key: "contentDetail",
            label: "详细大纲",
            type: "longtext",
            placeholder: "400字以内详细描述本章内容",
            maxLength: 400,
          },
        ],
      },
      {
        type: "card",
        title: "时空",
        icon: "MapPin",
        children: [
          {
            key: "timeline",
            label: "时间",
            type: "text",
            placeholder: "春-上午 / 天元历127年三月廿·深夜",
          },
          {
            key: "location",
            label: "地点",
            type: "text",
            placeholder: "后山竹林",
          },
        ],
      },
      {
        type: "card",
        title: "基调",
        icon: "Palette",
        children: [
          {
            key: "tone",
            label: "基调",
            type: "single",
            options: NOVEL_TONE_OPTIONS,
            display: "flex",
          },
        ],
      },
      {
        type: "card",
        title: "出场人物",
        icon: "Users",
        children: [
          {
            key: "characterIds",
            label: "人物",
            type: "multi",
            storeKey: "characters",  // 从全局 context 获取人物列表
            display: "flex",
          },
        ],
      },
      {
        type: "card",
        title: "场景",
        icon: "Map",
        children: [
          {
            key: "scenes",
            label: "场景",
            type: "list",
            subFields: [
              { placeholder: "场景名称", width: "flex-1" },
            ],
          },
        ],
      },
      {
        type: "card",
        title: "伏笔",
        icon: "Eye",
        children: [
          {
            key: "foreshadowings",
            label: "伏笔",
            type: "list",
            subFields: [
              { placeholder: "伏笔内容", width: "flex-1" },
            ],
          },
        ],
      },
      {
        type: "card",
        title: "关键事件",
        icon: "Star",
        children: [
          {
            key: "keyEvents",
            label: "事件",
            type: "multi",
            storeKey: "keyEvents",  // 从全局 context 获取关键事件列表
            display: "flex",
          },
        ],
      },
      {
        type: "card",
        title: "进度",
        icon: "TrendingUp",
        children: [
          {
            key: "status",
            label: "状态",
            type: "single",
            options: outlineStatusOptions,
            display: "flex",
          },
          {
            key: "sortOrder",
            label: "排序",
            type: "text",
            placeholder: "章节序号",
          },
        ],
      },
    ],
  },
];

// ─── 类型推导 ───

const _allOutlineFields = flattenFields(OUTLINE_CONFIG_SECTIONS);
export type OutlineConfig = ConfigOf<typeof _allOutlineFields>;

export const DEFAULT_OUTLINE_CONFIG = buildDefaultValues(_allOutlineFields);
```

### 5.2 扩展 config-utils 支持 storeKey

需要在 `ConfigFieldDef` 中添加 `storeKey` 和 `maxLength` 支持：

```typescript
// src/lib/configs/config-utils.ts 新增

export interface ConfigFieldDef<K extends string = string> {
  // ... 现有字段
  /** 从全局 context 获取选项的 key */
  storeKey?: string;
  /** text/longtext 类型的最大长度 */
  maxLength?: number;
}
```

### 5.3 全局 Store Context

需要创建一个全局 context 来管理 storeKey 对应的数据：

```typescript
// src/hooks/useOutlineStore.ts

import { createContext, useContext, useState, type ReactNode } from 'react';

interface OutlineStoreContextValue {
  /** 人物列表 */
  characters: { id: string; name: string }[];
  /** 关键事件列表 */
  keyEvents: string[];
  /** 场景列表 */
  scenes: string[];
  /** 加载 store 数据 */
  load: (novelId: string) => Promise<void>;
}

const OutlineStoreContext = createContext<OutlineStoreContextValue | null>(null);

export function OutlineStoreProvider({ novelId, children }: {
  novelId: string;
  children: ReactNode;
}) {
  const [store, setStore] = useState<OutlineStoreContextValue>({
    characters: [],
    keyEvents: [],
    scenes: [],
    load: async () => { /* 加载数据 */ },
  });

  return (
    <OutlineStoreContext.Provider value={store}>
      {children}
    </OutlineStoreContext.Provider>
  );
}

export function useOutlineStore() {
  const ctx = useContext(OutlineStoreContext);
  if (!ctx) throw new Error('useOutlineStore must be used within OutlineStoreProvider');
  return ctx;
}
```

---

## 六、写作助手面板

### 6.1 章节编辑器右侧面板

```
┌─────────────────────────────────────┐
│ 📝 写作助手 — 第12章                │
├─────────────────────────────────────┤
│ 🕐 时间：春·深夜                    │
│ 📍 地点：后山竹林                   │
│ 🎭 基调：紧张                       │
│                                     │
│ 📋 简约大纲：                       │
│ 林小凡秘密潜入后山...               │
│                                     │
│ 📝 详细大纲：                       │
│ 分场景详细规划...                   │
│                                     │
│ 👥 情感走势：                       │
│                                     │
│ 林小凡                              │
│   平静 → 震惊(8)                   │
│   触发：发现密信内容                │
│                                     │
│ 张师兄                              │
│   焦虑 → 决绝(7)                   │
│   触发：家人被挟持真相揭露          │
│                                     │
│ 📌 前情提要：                       │
│ 第11章：林小凡发现师兄行踪诡异     │
│ 第10章：师兄收到神秘信件           │
│                                     │
│ ⚡ 关键事件：                       │
│ 初遇 · 背叛                         │
│                                     │
│ 🔮 伏笔：                           │
│ 玉佩秘密 · 师兄身份                 │
└─────────────────────────────────────┘
```

---

## 七、API 设计

### 7.1 大纲 API

```
GET    /api/novels/[novelId]/outlines          获取大纲列表
POST   /api/novels/[novelId]/outlines          创建大纲
GET    /api/novels/[novelId]/outlines/[id]     获取大纲详情
PATCH  /api/novels/[novelId]/outlines/[id]     更新大纲
DELETE /api/novels/[novelId]/outlines/[id]     删除大纲
```

### 7.2 人物状态 API

```
GET    /api/novels/[novelId]/outlines/[id]/states   获取大纲的人物状态
POST   /api/novels/[novelId]/outlines/[id]/states   创建人物状态
PATCH  /api/novels/[novelId]/states/[id]            更新人物状态
DELETE /api/novels/[novelId]/states/[id]            删除人物状态
```

### 7.3 关键事件 API

```
GET    /api/novels/[novelId]/outlines/[id]/events   获取大纲的关键事件
POST   /api/novels/[novelId]/outlines/[id]/events   创建关键事件
DELETE /api/novels/[novelId]/events/[id]            删除关键事件
```

### 7.4 故事进度 API

```
GET    /api/novels/[novelId]/progress
```

### 7.5 写作助手上下文 API

```
GET    /api/novels/[novelId]/writing-context?[chapterId=x]
```

---

## 八、实施步骤

### Phase 1: 数据库层

1. 更新 `prisma/schema.prisma`
2. 运行 `npx prisma migrate dev`
3. 运行 `npx prisma generate`

### Phase 2: 配置与工具

4. 扩展 `config-utils.ts` 支持 storeKey 和 maxLength
5. 创建 `src/lib/configs/outline-defs.ts`
6. 创建 `src/hooks/useOutlineStore.ts`

### Phase 3: UI 组件

7. 创建 `src/components/ui/dynamic-select.tsx`（可搜索选择组件）
8. 扩展 `render-utils.tsx` 支持 storeKey 动态选项

### Phase 4: API 层

9. 创建大纲相关 API
10. 创建 CharacterState API
11. 创建 KeyEvent API

### Phase 5: 页面集成

12. 创建大纲列表页面
13. 创建大纲编辑页面
14. 集成写作助手面板到章节编辑器

---

## 九、文件清单

```
# 新建
src/lib/configs/outline-defs.ts
src/hooks/useOutlineStore.ts
src/components/ui/dynamic-select.tsx
src/app/api/novels/[novelId]/outlines/route.ts
src/app/api/novels/[novelId]/outlines/[id]/route.ts
src/app/api/novels/[novelId]/outlines/[id]/states/route.ts
src/app/api/novels/[novelId]/outlines/[id]/events/route.ts
src/app/api/novels/[novelId]/progress/route.ts
src/app/api/novels/[novelId]/writing-context/route.ts
src/hooks/useOutline.ts
src/components/outline/OutlineList.tsx
src/components/outline/OutlineEditor.tsx
src/components/writer/WritingAssistant.tsx
src/components/progress/StoryProgress.tsx

# 修改
prisma/schema.prisma
src/lib/configs/config-utils.ts
src/lib/configs/render-utils.tsx
```

---

## 十、关键技术决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 情感数据存储 | CharacterState 独立表 | 方便统计、修改、颜色管理 |
| 关键事件存储 | 两部分：config.keyEvents[] + KeyEvent 独立表 | 轻量用 config，需要关联用独立表 |
| 伏笔存储 | JSON 字符串数组 | 轻量级，不需要独立查询 |
| 场景存储 | JSON 字符串数组 | 用户自由填写 |
| 大纲内容 | 两个字段：contentBrief + contentDetail | 简约版 + 详细版 |
| 基调 | 复用 novel-defs 的 toneOptions | 统一数据源 |
| 大纲编辑 | 声明式 config-defs | 与人物编辑一致 |
| 动态选项 | storeKey + global context | 暂时管理人物 |
| 类型定义 | 不需要单独 types 文件 | def 自动生成 |