# 技术上下文

## 技术栈

| 层级 | 技术 | 版本/说明 |
|------|------|-----------|
| **前端框架** | Next.js | ^14.2.0 (App Router) |
| **语言** | TypeScript | ^5.4.0 |
| **样式** | Tailwind CSS | ^3.4.0 |
| **UI 组件** | shadcn/ui (Radix UI) | 自定义构建 |
| **编辑器** | 原生 Textarea | 简单文本编辑，支持 Tab 缩进 |
| **数据库 ORM** | Prisma | ^5.14.0 |
| **数据库** | SQLite | 文件数据库 (novel.db) |
| **AI API** | DeepSeek (兼容 OpenAI) | 通过 `@/lib/ai.ts` 封装 |
| **图标** | lucide-react | ^0.378.0 |

## 开发环境

- **运行时**: Node.js v22.12.0 (通过 nvm 管理)
- **包管理器**: npm 8.15.0
- **构建工具**: Next.js 内置
- **代码检查**: ESLint (eslint-config-next)

## 项目依赖

### 生产依赖
- `next`, `react`, `react-dom` — 核心框架
- `@prisma/client` — 数据库客户端
- `lucide-react` — 图标库
- `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate` — 样式工具链
- `@radix-ui/*` — 无头 UI 组件（dialog, dropdown-menu, slot, tabs, toast, label, select, separator, popover, scroll-area, tooltip）
- `@tiptap/*` — 已安装但暂未启用（当前使用 Textarea）
- `react-markdown` — Markdown 渲染

### 开发依赖
- `@types/node`, `@types/react`, `@types/react-dom` — TypeScript 类型
- `typescript` — 编译器
- `tailwindcss`, `postcss`, `autoprefixer` — CSS 工具链
- `eslint`, `eslint-config-next` — 代码规范
- `prisma` — ORM 迁移工具

## 已实现的功能模块

### 作品管理 (Novels)
- [x] 列表查看（支持计数：章节数、人物数）
- [x] 创建（标题 + 简介）
- [x] 删除（级联删除关联数据）
- [x] 作品详情概览页

### 章节管理 (Chapters)
- [x] 列表查看（过滤：全部/草稿/定稿）
- [x] 创建（自动排序）
- [x] 编辑（标题 + 内容 + 自动保存 3s 防抖）
- [x] 状态切换（草稿 ↔ 定稿）
- [x] 字数统计
- [x] 删除

### 人物管理 (Characters)
- [x] 列表查看
- [x] 创建/编辑（基本信息 + 特征数据）
- [x] 特征数据：标志性物件、主角原型、核心矛盾、能力、关系网络、成长弧光、写作注意事项
- [x] 自动保存（2s 防抖）
- [x] 删除

### AI 润色 (Polish)
- [x] 润色规则 CRUD
- [x] 润色执行（选中规则 → 输入文本 → 调用 AI）
- [x] 润色结果展示 + 复制
- [x] 错误处理

### UI 布局
- [x] 全局布局（flex h-screen bg-background）
- [x] 作品内布局（侧边栏导航 + 主内容区）
- [x] 返回按钮
- [x] 响应式网格

## 数据库模型

### Novel
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| title | String | 作品名称 |
| description | String? | 简介 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |
| chapters | Chapter[] | 关联章节 |
| characters | Character[] | 关联人物 |

### Chapter
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| novelId | String | 外键 → Novel |
| title | String | 章节标题 |
| content | String | 正文内容 |
| status | String (default: "draft") | draft/published |
| relatedCharacters | String? | JSON 数组 ["id1","id2"] |
| sortOrder | Int | 排序序号 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### Character
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| novelId | String | 外键 → Novel |
| name | String | 姓名 |
| gender | String? | 男/女 |
| age | String? | 年龄 |
| identity | String? | 身份/职业/组织归属 |
| traits | String? | JSON 结构化特征数据 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### PolishRule
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| name | String | 规则名称 |
| description | String? | 规则描述 |
| prompt | String | AI 提示词 |
| createdAt | DateTime | 创建时间 |

### PolishHistory
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| chapterId | String | 外键 → Chapter |
| ruleId | String? | 外键 → PolishRule |
| originalText | String | 原文 |
| polishedText | String | 润色后文本 |
| createdAt | DateTime | 创建时间 |

## 关键配置

### .gitignore 忽略项
- `node_modules/`, `.next/`, `out/` — 构建输出
- `*.db`, `*.db-journal`, `prisma/novel.db` — 数据库文件
- `.env`, `.env.local` — 环境变量（含 AI API Key）
- `.vscode/`, `.idea/` — IDE 配置

### 环境变量 (需要创建 .env.local)
```
AI_API_KEY=your_deepseek_api_key
AI_BASE_URL=https://api.deepseek.com/v1/chat/completions
AI_MODEL=deepseek-chat
```

### 路径别名
- `@/*` → `./src/*`