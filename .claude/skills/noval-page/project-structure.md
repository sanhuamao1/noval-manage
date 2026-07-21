# 项目结构

## 目录总览

```
noval-manage/
├── .claude/skills/noval-page/          # 技能文档（SKILL.md + 参考指南）
├── configs/                            # Config YML — 实体字段/布局定义（构建时→TS）
│   ├── novel.yml                       # 小说配置
│   ├── character.yml                   # 人物配置
│   ├── location.yml                    # 地点配置
│   ├── organization.yml                # 组织配置
│   ├── outline.yml                     # 大纲配置
│   ├── polish-rule.yml                 # 润色规则配置
│   ├── polish-sample.yml               # 风格样本配置
│   ├── shared-options.yml              # 共享选项（选项池）
│   ├── preset-styles.yml               # 预设风格
│   └── frameworks/                     # 写作框架参考文档（.md）
├── prisma/                             # Prisma ORM
│   ├── schema.prisma                   # 数据库 schema
│   ├── migrations/                     # 数据库迁移
│   └── data/                           # Prisma seed 数据
├── scripts/                            # 构建 & 工具脚本
│   ├── generate-configs.cjs            # YAML → TS 类型生成
│   ├── migrate-to-prisma.ts            # YAML → Prisma 迁移
│   ├── test-enrich-prompt.ts           # 测试：完善设定 prompt
│   ├── test-gen-outline-prompt.ts      # 测试：生成大纲 prompt
│   └── query-oldest-characters.cjs     # 辅助查询
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── page.tsx                    # 首页（小说列表）
│   │   ├── layout.tsx                  # 根布局
│   │   ├── globals.css                 # 全局样式
│   │   ├── api/                        # API 路由（每个实体对应子目录）
│   │   │   ├── novels/                 # 小说 API
│   │   │   ├── characters/            # 人物 API
│   │   │   ├── locations/             # 地点 API
│   │   │   ├── organizations/         # 组织 API
│   │   │   ├── chapters/              # 章节 API
│   │   │   ├── outlines/              # 大纲 API
│   │   │   ├── key-events/            # 关键事件 API
│   │   │   ├── foreshadowings/        # 伏笔 API
│   │   │   ├── relations/             # 关系 API
│   │   │   ├── character-emotions/    # 情感曲线 API
│   │   │   ├── frameworks/            # 写作框架 API
│   │   │   ├── polish/                # 润色 API
│   │   │   └── factory/               # 梦工厂 AI API
│   │   └── novel/[id]/                 # 小说详情页（路由组）
│   │       ├── layout.tsx              # 侧边栏导航 + 面板布局
│   │       ├── page.tsx                # 概览页（NovelOverviewPreview）
│   │       ├── NovelOverviewPreview.tsx# 概览预览组件
│   │       ├── characters/page.tsx     # 人物管理
│   │       ├── organizations/page.tsx  # 组织管理
│   │       ├── outlines/page.tsx       # 大纲管理
│   │       ├── chapters/               # 章节编辑（含润色面板）
│   │       │   ├── page.tsx           # 章节列表页
│   │       │   ├── components/        # 章节子组件
│   │       │   └── hooks/             # useChapters hook
│   │       ├── polish/page.tsx         # 润色规则管理
│   │       ├── resources/              # 资源关系图
│   │       │   ├── page.tsx           # 关系图页
│   │       │   └── components/        # 关系图组件
│   │       └── factory/                # 梦工厂（AI 辅助创作）
│   │           ├── page.tsx           # 梦工厂首页
│   │           ├── enrich-settings.tsx # 完善设定 tab
│   │           ├── gen-outline.tsx     # 生成大纲 tab
│   │           └── components/        # 空/错误状态组件
│   ├── components/                     # 全局组件
│   │   ├── ui/                         # UI 组件库（无 barrel export）
│   │   │   ├── button.tsx              # 按钮
│   │   │   ├── card.tsx                # 卡片
│   │   │   ├── card-list.tsx           # 卡片列表（CRUD 列表视图）
│   │   │   ├── card-slider.tsx         # 卡片滑块
│   │   │   ├── drawer.tsx              # 抽屉（CRUD 编辑面板）
│   │   │   ├── editor-form.tsx         # 编辑器表单（ref 驱动）
│   │   │   ├── form-item.tsx           # 表单项包装
│   │   │   ├── input.tsx               # 输入框
│   │   │   ├── no-border-input.tsx     # 无边框输入框
│   │   │   ├── label.tsx               # 标签
│   │   │   ├── select.tsx              # 下拉选择
│   │   │   ├── radio-group.tsx         # 单选组
│   │   │   ├── toggle.tsx              # 开关
│   │   │   ├── textarea.tsx            # 文本域
│   │   │   ├── long-text-field.tsx     # 长文本字段
│   │   │   ├── tag.tsx                 # 标签
│   │   │   ├── tags.tsx                # 标签列表
│   │   │   ├── tag-select.tsx          # 标签选择器
│   │   │   ├── tabs.tsx                # 选项卡
│   │   │   ├── stepper.tsx             # 步骤条
│   │   │   ├── list.tsx                # 列表
│   │   │   ├── popover.tsx            # 气泡卡片
│   │   │   ├── tooltip.tsx            # 工具提示
│   │   │   ├── config-badges.tsx       # 配置徽章
│   │   │   └── page-layout.tsx         # 页面布局包装
│   │   ├── SelectionMenu.tsx           # 选择菜单
│   │   └── skeleton.tsx                # 骨架屏
│   ├── hooks/                          # 通用 hooks
│   │   ├── useEntityCrud.ts            # 通用实体 CRUD hook
│   │   ├── useEntityItems.ts           # 实体列表 hook
│   │   └── useDrawer.ts               # 抽屉状态管理
│   ├── stores/                         # Zustand 全局状态
│   │   ├── useNovelStore.ts            # 当前小说数据
│   │   ├── useEntityStore.ts           # 实体列表缓存
│   │   ├── useMenuStore.ts             # 侧边栏菜单状态
│   │   ├── usePanelStore.ts            # 面板状态
│   │   ├── useFactoryStore.tsx         # 梦工厂 tab 缓存
│   │   └── usePolishStore.ts           # 润色状态
│   ├── lib/                            # 工具库
│   │   ├── api.ts                      # HTTP 请求封装
│   │   ├── db.ts                       # Prisma 客户端
│   │   ├── store.ts                    # Zustand store 工厂
│   │   ├── utils.ts                    # 通用工具函数
│   │   ├── colors.ts                   # 颜色工具
│   │   ├── api-routes/index.ts          # API 路由辅助
│   │   └── configs/                    # 配置系统
│   │       ├── generated.ts            # 构建生成的配置常量 + 类型
│   │       ├── config-registry.ts      # getEntry 注册表
│   │       ├── config-utils.ts         # buildDefaultValues / fillConfig
│   │       ├── crud-config.ts          # 实体 CRUD 映射表
│   │       └── render-utils.tsx        # renderField / renderSections
│   ├── types/                          # TypeScript 类型
│   │   ├── index.ts                    # 类型导出入口
│   │   ├── entity.ts                   # 实体基础类型
│   │   ├── configs.ts                  # 配置类型
│   │   └── data.ts                     # 数据持久化类型
│   └── ai/                             # AI Prompt 组装系统（原 src/lib/ai/）
│       ├── index.ts                    # AI 入口（callAI / callAIStream）
│       ├── json-parser.ts              # 通用 JSON 解析
│       ├── validators.ts               # 操作校验器
│       ├── context/                    # 数据 → Prompt 上下文
│       │   ├── field-schema.ts         # YAML 字段手册
│       │   ├── novel.ts                # 小说基本信息
│       │   ├── entities.ts             # 人物/组织/地点
│       │   └── relations.ts            # 角色关系网络
│       └── prompt/                     # Prompt 组装
│           ├── index.ts                # Prompt 入口
│           ├── buildOperationOutputSection.ts  # 操作输出节
│           ├── buildRandomizationRules.ts      # 随机化规则
│           └── templates/              # Prompt 模板
│               ├── gen-outline-output.ts       # 生成大纲输出
│               ├── operations-output.ts        # 操作输出
│               └── relations-params.ts         # 关系参数
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── postcss.config.mjs
├── package.json
├── CLAUDE.md                            # 项目级 Agent 指令
└── skills-lock.json                     # 技能锁定文件
```

## 数据流向

```
Config YML (configs/*.yml)
       │  构建时（generate-configs.cjs）
       ▼
src/lib/configs/generated.ts
       │  运行时
       ▼
getEntry() + renderSections()
       │
       ▼
page.tsx → EditorForm / CardList
       │
       ▼
api() 请求 → Prisma → SQLite/PostgreSQL
                     │  或
                     ▼
              Data YML (data/xxx.yml) 持久化（双向同步）
```

## 页面分类

| 类型 | 核心 Hook/工具 | 代表页面 |
|------|---------------|----------|
| CRUD 单实体 | `useEntityCrud` | characters, organizations |
| CRUD 地点/大纲 | `useEntityCrud` | locations, outlines |
| CRUD 多实体 | `useEntityCrud` + `switchEntity` | polish |
| 章节编辑（含润色） | `useChapters` | chapters |
| 单数据编辑 | `useNovelStore` + `api()` | 概览页 |
| 资源图 | `useEntityItems` | resources（关系图） |
| AI 工作流 | `useFactoryStore` | factory |

## 关键文件

| 文件 | 职责 |
|------|------|
| `configs/<entity>.yml` | 字段定义 + 布局结构 |
| `configs/shared-options.yml` | 共享选项池（枚举值定义） |
| `src/lib/configs/crud-config.ts` | 实体 CRUD 配置映射 |
| `src/lib/configs/config-registry.ts` | `getEntry` 注册表 |
| `src/hooks/useEntityCrud.ts` | 通用 CRUD hook |
| `src/hooks/useEntityItems.ts` | 通用实体列表 hook |
| `src/components/ui/editor-form.tsx` | 编辑器表单（ref 驱动） |
| `src/components/ui/drawer.tsx` | 抽屉弹窗（CRUD 编辑容器） |
| `src/components/ui/card-list.tsx` | 卡片列表（CRUD 列表容器） |
| `src/stores/useNovelStore.ts` | 当前小说数据 store |
| `src/stores/useEntityStore.ts` | 实体列表缓存 store |
| `src/stores/useFactoryStore.tsx` | 梦工厂 store |
| `prisma/schema.prisma` | 数据库 schema |
| `src/lib/db.ts` | Prisma 客户端实例 |
| `scripts/generate-configs.cjs` | YAML → TS 配置生成器 |
| `src/ai/index.ts` | AI 调用入口（callAI / callAIStream） |