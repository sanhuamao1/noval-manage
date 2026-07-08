# 系统架构与设计模式

## 整体架构

```
┌─────────────────────────────────────────────────┐
│                   前端层 (React/Next.js)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ 作品管理  │ │ 章节编辑  │ │ 人物管理/其他    │ │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
│       │            │                 │           │
│  ┌────▼────────────▼─────────────────▼─────────┐ │
│  │           API 层 (Next.js API Routes)        │ │
│  └────┬────────────┬─────────────────┬─────────┘ │
└───────┼────────────┼─────────────────┼───────────┘
        │            │                 │
┌───────▼────────────▼─────────────────▼───────────┐
│             Prisma ORM + SQLite                   │
└──────────────────────────────────────────────────┘
```

## 核心架构模式

### 1. App Router 路由架构
```
src/app/
├── page.tsx                    # 首页 → 作品列表
├── layout.tsx                  # 全局布局
├── novels/
│   ├── page.tsx                # 作品列表页
│   └── [id]/
│       ├── page.tsx            # 作品详情
│       ├── chapters/
│       │   ├── page.tsx        # 章节列表
│       │   └── [chapterId]/
│       │       └── page.tsx    # 编辑器
│       └── characters/
│           ├── page.tsx        # 人物列表
│           └── [characterId]/
│               └── page.tsx    # 人物详情/编辑
└── api/                        # API Routes
    ├── novels/                 # 作品 CRUD
    ├── chapters/               # 章节 CRUD
    ├── characters/             # 人物 CRUD
    └── polish/                 # AI 润色
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
├── ui/              # 基础 UI 组件 (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/          # 布局组件
│   ├── sidebar.tsx
│   └── header.tsx
├── novels/          # 作品管理相关
├── editor/          # 编辑器相关
├── characters/      # 人物管理相关
└── polish/          # 润色相关
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
用户选中文本 → 选择润色规则
  → POST /api/polish { text, ruleId }
  → 后端组装 prompt（附加上下文信息）
  → 调用 DeepSeek API
  → 返回润色结果
  → 前端展示对比视图
```

## 关键设计决策

1. **Server Components 优先**：能静态获取的数据尽量在 Server 端获取，减少客户端渲染负担
2. **API Routes 做数据校验**：所有数据变更走 API Routes，确保数据完整性
3. **Prisma 作为唯一数据源**：数据库操作统一通过 Prisma Client，不直接写 SQL
4. **模块化路由**：按业务模块组织 pages/api，便于后期拆分微服务