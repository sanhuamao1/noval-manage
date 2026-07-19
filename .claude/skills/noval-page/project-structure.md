# 项目结构

## 目录总览

```
noval-manage/
├── configs/                            # Config YML — 实体字段/布局定义（构建时→TS）
│   ├── *.yml                           # 各实体配置 + shared-options / preset-styles
│   └── frameworks/                     # 写作框架参考文档（.md）
├── data/                               # Data YML — 运行时持久化数据
│   ├── novels/<id>/                    # 小说实例数据
│   │   ├── novel.yml                   # 小说本身
│   │   ├── relations.yml               # 独立数据：角色关系图
│   │   ├── characters/*.yml            # 人物实例
│   │   ├── locations/*.yml             # 地点实例
│   │   ├── organizations/*.yml         # 组织实例
│   │   ├── chapters/*.yml              # 章节
│   │   ├── outlines/*.yml              # 大纲
│   │   └── foreshadowings/*.yml        # 伏笔
│   ├── polish-rules/*.yml              # 独立数据：润色规则（跨小说共享）
│   └── polish-samples/*.yml            # 独立数据：风格样本（跨小说共享）
├── scripts/                            # 构建脚本
│   └── generate-configs.cjs            # YAML → TS 类型生成
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── page.tsx                    # 首页
│   │   ├── layout.tsx                  # 根布局
│   │   ├── api/                        # API 路由
│   │   └── novel/[id]/                 # 小说详情页
│   │       ├── layout.tsx              # 侧边栏导航
│   │       ├── page.tsx                # 概览页
│   │       ├── <feature>/              # 各功能页面
│   │       └── factory/                # 梦工厂
│   ├── components/ui/                  # UI 组件库（统一 barrel export）
│   ├── hooks/                          # useEntityCrud / useEntityItems / useDrawer
│   ├── lib/                            # 工具库
│   │   ├── api.ts                      # HTTP 封装
│   │   ├── ai.ts                       # AI 底层调用（callAI / callAIStream）
│   │   ├── ai/                         # AI Prompt 组装系统
│   │   │   ├── json-parser.ts          # 通用 JSON 解析
│   │   │   ├── operations-schema.ts    # Operations 共享配置 + Prompt 片段
│   │   │   ├── validators.ts           # 操作校验
│   │   │   ├── context/                # 数据→Prompt 片段
│   │   │   │   ├── field-schema.ts     # YAML 字段手册
│   │   │   │   ├── novel.ts            # 小说基本信息
│   │   │   │   ├── entities.ts         # 人物/组织/地点
│   │   │   │   └── relations.ts        # 角色关系网络
│   │   │   └── prompt/                 # 组装完整 Prompt
│   │   │       ├── enrich-settings.ts  # 完善设定
│   │   │       ├── polish.ts           # 润色规则
│   │   │       └── style.ts            # 风格样本
│   │   └── configs/                    # 配置系统
│   │       ├── generated.ts            # 构建生成的配置常量 + 类型
│   │       ├── config-registry.ts      # getEntry 注册表
│   │       ├── config-utils.ts         # buildDefaultValues / fillConfig
│   │       ├── crud-config.ts          # 实体 CRUD 映射表
│   │       └── render-utils.tsx        # renderField / renderSections
│   ├── stores/                         # Zustand 全局状态
│   │   ├── useAppStore.ts              # 主数据
│   │   └── useFactoryStore.tsx         # 梦工厂 tab 缓存
│   └── types/                          # TypeScript 类型
└── tsconfig.json
```

## 数据流向

```
Config YML (configs/*.yml)
       │  构建时（generate-configs.cjs）
       ▼
entity.ts + entityConfig.ts + generated.ts
       │  运行时
       ▼
getEntry() + renderSections()
       │
       ▼
  page.tsx → EditorForm / CardList
       │
       ▼
    api() 请求 → API Server → Data YML (data/xxx.yml) 持久化
```

## 页面分类

| 类型 | 核心 Hook | 代表页面 |
|------|-----------|----------|
| CRUD 单实体 | `useEntityCrud` | characters, locations, organizations |
| CRUD 多实体 | `useEntityCrud` + `switchEntity` | polish |
| 单数据编辑 | `useAppStore` + `api()` | novel 概览页 |
| AI 工作流 | `useFactory` | factory |

## 关键文件

| 文件 | 职责 |
|------|------|
| `configs/<entity>.yml` | 字段定义 + 布局结构 |
| `src/lib/configs/crud-config.ts` | 实体 CRUD 配置映射 |
| `src/lib/configs/config-registry.ts` | `getEntry` 注册表 |
| `src/hooks/useEntityCrud.ts` | 通用 CRUD hook |
| `src/components/ui/editor-form.tsx` | 编辑器表单（ref 驱动） |
| `src/stores/useAppStore.ts` | 主数据 store |
| `src/stores/useFactoryStore.tsx` | 梦工厂 store |