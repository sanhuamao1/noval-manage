# 系统架构与设计模式

## 整体架构

```
┌──────────────────────────────────────────────────────────┐
│                    前端层 (React/Next.js)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ 作品管理  │ │ 章节编辑  │ │ 人物管理  │ │  大纲/情感  │  │
│  │ 概览/设  │ │ 续写扩写 │ │ 情感追踪  │ │  头脑风暴  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬─────┘  │
│       │            │             │               │        │
│  ┌────▼────────────▼─────────────▼───────────────▼─────┐ │
│  │              API 层 (Next.js API Routes)              │ │
│  └────┬────────────┬─────────────┬───────────────┬─────┘ │
└───────┼────────────┼─────────────┼───────────────┼───────┘
        │            │             │               │
┌───────▼────────────▼─────────────▼───────────────▼───────┐
│                   Prisma ORM + SQLite                      │
│  Novel → Chapter → Character → Outline → Brainstorm       │
│                          → CharacterEmotion               │
└──────────────────────────────────────────────────────────┘
```

## 核心架构模式

### 1. App Router 路由架构
```
src/app/
├── page.tsx                    # 首页 → 作品列表
├── layout.tsx                  # 全局布局
├── novel/
│   └── [id]/
│       ├── page.tsx            # 作品详情（概览 + 编辑）
│       ├── layout.tsx          # 作品内布局（侧边栏 + 导航计数）
│       ├── chapters/
│       │   └── page.tsx        # 章节列表 + 编辑器
│       ├── characters/
│       │   └── page.tsx        # 人物管理
│       └── polish/
│           └── page.tsx        # AI 润色/续写/扩写规则管理
│       └── outline/            # 【计划】故事大纲
│           └── page.tsx
│       └── brainstorm/         # 【计划】头脑风暴
│           └── page.tsx
│       └── emotions/           # 【计划】人物情感追踪
│           └── page.tsx
└── api/
    ├── novels/                 # 作品 CRUD
    ├── chapters/               # 章节 CRUD
    ├── characters/             # 人物 CRUD
    ├── polish/                 # AI 润色/续写/扩写
    ├── outlines/               # 【计划】大纲 CRUD
    ├── brainstorms/            # 【计划】头脑风暴 CRUD
    └── emotions/               # 【计划】情感追踪 CRUD
```

### 2. 数据流模式

**Server Components** → 数据获取（直接调用 Prisma）
```
Server Component
  → 直接 import prisma from '@/lib/db'
  → async function Page() 中获取数据
  → 传递 props 给 Client Components
```

**Client Components** → 用户交互
```
Client Component
  → 用户操作（点击/输入/选择）
  → fetch('/api/xxx') 调用 API
  → 更新 UI 状态
```

### 3. 组件设计模式

```
src/components/
├── ui/              # 基础 UI 组件 (shadcn/ui + 自定义)
│   ├── button.tsx
│   ├── card.tsx
│   ├── tag.tsx           # 可复用标签组件（图标 + 颜色主题）
│   ├── form-input.tsx    # 带图标的表单输入
│   ├── radio-group.tsx   # 单选/多选按钮组
│   └── ...
├── chapters/        # 章节相关
│   └── ChapterEditor.tsx
└── polish/          # 润色相关
    ├── PolishContext.tsx
    ├── PolishPanel.tsx
    ├── PolishResultPopover.tsx
    └── SelectionMenu.tsx
```

### 4. API 设计模式

```
/api/<resource>
  GET    /        → 列表查询
  POST   /        → 创建
  GET    /[id]    → 详情
  PUT    /[id]    → 更新
  DELETE /[id]    → 删除
```

### 5. AI 服务模式

```
调用链路：
用户选中文本 → 选择 AI 动作（润色/续写/扩写）
  → POST /api/polish { text, ruleId, action: "polish"|"continue"|"expand" }
  → 后端根据 action 组装不同的 prompt 模板
  → 附加作品上下文（人物/大纲等信息）
  → 调用 DeepSeek API
  → 返回 AI 结果
  → 前端展示对比/预览视图
```

## 关键设计决策

1. **Server Components 优先**：能静态获取的数据尽量在 Server 端获取，减少客户端渲染负担
2. **API Routes 做数据校验**：所有数据变更走 API Routes，确保数据完整性
3. **Prisma 作为唯一数据源**：数据库操作统一通过 Prisma Client，不直接写 SQL
4. **模块化路由**：按业务模块组织 pages/api，便于后期拆分微服务
5. **Context 模式管理状态**：润色功能使用 React Context 管理编辑器状态
6. **组件拆分原则**：按功能区域拆分为独立组件，页面层仅做布局编排
7. **JSON 字段存储结构化数据**：人物特征、多选题材等通过 JSON 字段灵活存储
8. **层级大纲设计**：使用 parentId 实现树形结构，支持无限层级 (卷→章→情节→场景)
