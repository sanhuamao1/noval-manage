# 系统架构

## 三层架构

```
前端 (React/Next.js) → API (Next.js Routes) → Prisma + SQLite
```

## App Router

```
src/app/
├── page.tsx                    # 作品列表
├── novel/[id]/
│   ├── page.tsx                # 概览
│   ├── layout.tsx              # 侧边栏导航 + 计数
│   ├── chapters/page.tsx       # 章节编辑器
│   ├── characters/page.tsx     # 人物管理
│   └── polish/page.tsx         # 润色规则 + 风格样本
└── api/
    ├── novels/                 # CRUD
    ├── chapters/               # CRUD
    ├── characters/             # CRUD
    ├── polish/                 # AI 润色调用（支持 rule/sample 模式）
    └── polish/rules/           # 规则 & 样本 CRUD
```

## 数据流

- Server Components：直接 import Prisma
- Client Components：fetch API → 更新 UI
- AI 调用：选中文本 → POST /api/polish → 组装 prompt → 调用 DeepSeek → 返回

## API 规范

```
GET    /api/resource      → 列表（?id= 单个）
POST   /api/resource      → 创建
PUT    /api/resource      → 更新
DELETE /api/resource?id=  → 删除
```

统一 `{ error: string }` 格式，JSON 字段 API 层序列化，级联 Cascade。


## AI 服务

- `buildPolishPrompt(rule, text)` — 规则模式 prompt
- `buildStylePrompt(samples)` — 样本模式 prompt（正例/反例）
- 环境变量：`AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL`

## 关键设计

| 决策 | 说明 |
|------|------|
| 编辑器 | 原生 Textarea，居中 800px，font-serif |
| 人物数据 | JSON 字段存储结构化特征 |
| 润色状态 | React Context |
| 侧边栏计数 | API `_count` 聚合 |
| 配置系统 | 声明式配置化表单（config-utils → defs → render-utils） |
