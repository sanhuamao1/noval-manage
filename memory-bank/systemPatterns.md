# 系统架构与设计模式

## 整体架构

```
┌─────────────────────────────────────────┐
│    前端层 (React/Next.js)              │
│  作品管理 / 章节编辑 / 人物管理 / 润色  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        API 层 (Next.js API Routes)      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Prisma ORM + SQLite                │
│  Novel → Chapter → Character → PolishRule│
└─────────────────────────────────────────┘
```

## App Router 路由架构

```
src/app/
├── page.tsx                    # 首页（作品列表）
├── layout.tsx                  # 全局布局
├── novel/[id]/
│   ├── page.tsx                # 作品概览
│   ├── layout.tsx              # 侧边栏导航 + 计数
│   ├── chapters/page.tsx       # 章节列表 + 编辑器
│   ├── characters/page.tsx     # 人物管理
│   └── polish/page.tsx         # 润色规则管理
└── api/
    ├── novels/                 # 作品 CRUD
    ├── novels/[id]/            # 作品更新 (PATCH)
    ├── chapters/               # 章节 CRUD
    ├── characters/             # 人物 CRUD
    ├── polish/                 # AI 润色调用
    └── polish/rules/           # 润色规则 CRUD
```

## 数据流模式

- **Server Components**：直接 import Prisma 获取数据，传递给 Client Components
- **Client Components**：用户操作 → fetch API → 更新 UI
- **AI 调用流**：选中文本 → POST /api/polish → 后端组装 prompt → 调用 DeepSeek → 返回结果

## 组件层级

```
components/
├── ui/          # 基础 UI（Button/Card/Tag/FormInput/RadioGroup/Drawer/Tabs）
├── chapters/    # ChapterEditor（Textarea + Tab 缩进 + 润色事件）
├── polish/      # PolishContext/PolishPanel/ResultPopover/SelectionMenu/ConfigEditor
└── configs/     # 配置工具（config-utils/polish-defs/render-utils）
```

## API 设计规范

```
GET    /api/resource        → 列表（?id= 获取单个）
POST   /api/resource        → 创建
PUT    /api/resource        → 更新（按需字段）
DELETE /api/resource?id=xxx → 删除
```

- 统一错误格式：`{ error: string }`
- JSON 字段在 API 层序列化/反序列化（题材 genre 等）
- 级联删除：Prisma schema 配置 `onDelete: Cascade`

## 状态管理

- **润色 Context**：PolishProvider 管理 selectedText/panelOpen/结果，子组件用 `usePolishContext()` 获取
- **页面本地状态**：各页面自行管理（chapters: chapters[]/selectedChapter，characters: characters[]/editTraits）
- **自动保存**：章节 3s 防抖，人物 2s 防抖，作品概览手动保存

## AI 服务模式

- `buildPolishPrompt(rule, text)` → 规则说明 + 配置指令 + 自定义补充 + 原文
- 配置指令由 `buildConfigInstructions` 从 CONFIG_FIELDS 生成，未设置选项自动跳过
- 环境变量：`AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL`

## 关键设计决策

### 已实施

1. **编辑器**：原生 Textarea（非 TipTap），简单够用
2. **人物数据**：JSON 字段存储结构化特征（灵活、少 joins）
3. **自动保存**：防抖策略（章节 3s，人物 2s）
4. **路由**：`[id]` 动态路由组织子页面
5. **润色状态**：React Context 管理，避免 prop drilling
6. **润色历史**：不记录，保持简洁
7. **编辑器居中**：最大宽度 800px，font-serif，模拟纸质书体验
8. **题材**：JSON 数组字符串，兼容旧格式
9. **侧边栏计数**：API `_count` 聚合获取

### 计划中

10. **大纲**：Outline parentId 树形结构，type 区分层级，关联章节
11. **情感追踪**：CharacterEmotion 关联人物+章节，11 种情绪，强度 1-10
12. **头脑风暴**：Brainstorm 支持 type 分类 + tags 标签

## 技术债

- 章节列表无分页/虚拟列表（50+ 章节时性能下降）
- 无拖拽排序视觉反馈
- 无单元测试/E2E 测试
- 人物关系无外键约束（仅 UI 层约束）
