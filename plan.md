# 📚 小说创作辅助系统 - 完整项目规划

你好！很高兴你想做一个小说创作辅助工具。根据你的需求，我为你设计了一个**分阶段、可落地**的方案。先说说你的环境情况：

## 当前环境检查 ✅
- ✅ **nvm (Node Version Manager)** — 已安装，可以轻松切换 Node 版本
- ✅ **当前 Node.js v22.12.0** 
- ✅ **npm 8.15.0** — 可用

---

## 一、整体架构设计

```
novel-writing-assistant/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── page.tsx            # 首页 - 作品列表
│   │   ├── layout.tsx          # 全局布局
│   │   ├── novel/[id]/         # 单个作品页面
│   │   │   ├── page.tsx        # 作品概览
│   │   │   ├── chapters/       # 章节管理
│   │   │   ├── characters/     # 人物管理
│   │   │   ├── timeline/       # 时间线[暂时不实现]
│   │   │   ├── relations/      # 关系图谱[暂时不实现]
│   │   │   ├── plot/           # 情节设计[暂时不实现]
│   │   │   └── brainstorm/     # 头脑风暴[暂时不实现]
│   │   └── api/                # API 路由（后端）
│   │       ├── novels/         # 作品 CRUD
│   │       ├── chapters/       # 章节 CRUD
│   │       ├── characters/     # 人物 CRUD
│   │       ├── polish/         # AI 润色
│   │       └── brainstorm/     # AI 头脑风暴[暂时不实现]
│   ├── components/             # 可复用组件
│   │   ├── ui/                 # shadcn/ui 基础组件
│   │   ├── editor/             # 富文本编辑器
│   │   ├── character-card/     # 人物卡片
│   │   ├── relation-graph/     # 关系图谱（可视化）[暂时不实现]
│   │   └── timeline/           # 时间线组件[暂时不实现]
│   ├── lib/                    # 工具函数
│   │   ├── db.ts               # SQLite 数据库连接
│   │   ├── ai.ts               # AI API 调用封装
│   │   └── utils.ts            # 通用工具
│   └── types/                  # TypeScript 类型定义
├── prisma/                     # Prisma ORM 配置
│   └── schema.prisma           # 数据库模型定义
├── public/                     # 静态资源
└── package.json
```

---

## 二、技术栈详解

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | Next.js 14 (App Router) | 全栈框架，前后端一体 |
| **语言** | TypeScript | 类型安全，减少 bug |
| **样式** | Tailwind CSS + shadcn/ui | 美观且易用的组件库 |
| **富文本编辑器** | Novel 或 TipTap | 类 Notion 体验 |
| **数据库** | SQLite (via Prisma) | 零配置，文件即数据库 |
| **AI 接入** | OpenAI 兼容 API | 支持 DeepSeek / Ollama / Claude |
| **关系图谱** | React Flow 或 vis-network | 可视化人物关系 [暂时不实现]|
| **状态管理** | React Context | 轻量够用 |

---

## 三、第一阶段功能详解（你列出的内容）

### 1️⃣ 项目骨架搭建
- 用 `create-next-app` 初始化项目
- 配置 Tailwind CSS + shadcn/ui
- 配置 Prisma + SQLite
- 搭建基础布局（侧边栏 + 主内容区）

### 2️⃣ 作品管理
- 创建/切换/删除小说项目
- 每个项目包含：名称、简介、封面、创建时间
- 数据库表：`Novel`

### 3️⃣ 章节编辑器
- 基于 Novel 开源编辑器（支持 Markdown 快捷键）
- 自动保存（防丢失）
- 章节标题 + 正文 + 字数统计
- 数据库表：`Chapter`

### 4️⃣ 人物管理
- 人物卡片：姓名、身份、性格、背景、外貌、动机
- 支持标签分类（主角/配角/反派）
- 简单的 CRUD 界面
- 数据库表：`Character`

### 5️⃣ AI 润色
- **润色规则管理**：创建/编辑/删除润色规则
  - 规则示例：`「口语化→书面化」`、`「简化冗长句子」`、`「增强情感表达」`
- **使用流程**：选中文本 → 选择规则 → 调用 AI API → 返回润色结果
- 支持对比查看（原文 vs 润色后）
- 数据库表：`PolishRule` + `PolishHistory`

### 6️⃣ 本地存储
- SQLite 数据库文件存储在项目根目录
- 所有数据本地保存，无需联网（除 AI 调用外）

---

## 四、数据库设计（Prisma Schema）

```prisma
model Novel {
  id          String    @id @default(cuid())
  title       String
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  chapters    Chapter[]
  characters  Character[]
}

model Chapter {
  id        String   @id @default(cuid())
  novelId   String
  novel     Novel    @relation(fields: [novelId], references: [id])
  title     String
  content   String   // 富文本 HTML 或 Markdown
  relatedCharacters String?  // 关联人物ID列表，JSON数组格式 ["id1","id2"]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Character {
  id          String   @id @default(cuid())
  novelId     String
  novel       Novel    @relation(fields: [novelId], references: [id])
  name        String
  identity    String?  // 身份/职业
  personality String?  // 性格
  background  String?  // 背景故事
  appearance  String?  // 外貌
  motivation  String?  // 动机/目标
  tags        String?  // 标签（主角/配角/反派）
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PolishRule {
  id          String   @id @default(cuid())
  name        String   // 规则名称
  description String?  // 规则描述
  prompt      String   // AI 提示词模板
  createdAt   DateTime @default(now())
}

model PolishHistory {
  id          String   @id @default(cuid())
  chapterId   String
  chapter     Chapter  @relation(fields: [chapterId], references: [id])
  ruleId      String?
  rule        PolishRule? @relation(fields: [ruleId], references: [id])
  originalText String  // 原文
  polishedText String  // 润色后
  createdAt   DateTime @default(now())
}
```

---

## 五、第一阶段实施步骤

| 步骤 | 内容 | 预计工作量 |
|------|------|-----------|
| **Step 1** | 环境准备：切换 Node 版本、初始化 Next.js 项目 | ~15 分钟 |
| **Step 2** | 配置 Tailwind + shadcn/ui + Prisma + SQLite | ~30 分钟 |
| **Step 3** | 搭建基础布局（侧边栏导航 + 页面框架） | ~30 分钟 |
| **Step 4** | 实现作品管理（CRUD） | ~45 分钟 |
| **Step 5** | 实现章节编辑器（集成 Novel 编辑器） | ~1 小时 |
| **Step 6** | 实现人物管理（卡片 CRUD） | ~45 分钟 |
| **Step 7** | 实现 AI 润色功能（规则管理 + 调用 API） | ~1 小时 |
| **Step 8** | 联调测试、优化体验 | ~30 分钟 |

**总计：约 4-5 小时**

---

## 六、后续阶段规划（你提到的其他功能）

### 第二阶段：时间线管理 + 关系追踪
- **时间线**：可视化时间轴，拖拽调整事件顺序
- **关系图谱**：人物关系可视化（React Flow），支持添加关系类型（朋友/敌人/恋人等）

### 第三阶段：情节设计 + 头脑风暴
- **情节设计**：三幕式/英雄之旅等模板，情节节点管理
- **头脑风暴**：AI 辅助生成灵感，思维导图式展示

### 第四阶段：高级功能
- 伏笔系统（埋设→推进→回收）
- 事实核查（一致性检查）
- 全书优化（一键诊断）
- 导出功能（PDF/EPUB/TXT）

---

## 七、需要你确认的问题

在开始动手之前，我想确认几个事情：

2. **AI API**：DeepSeek。
3. **编辑器偏好**：富文本编辑器，但只需要简单的功能，编辑的是txt文件
4. **UI 风格**：简洁

## 八、web要求
1. 模块化
2. 可自定义修改主题色
