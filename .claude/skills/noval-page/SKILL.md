---
name: noval-page
description: noval-manage 项目页面编写指南。当需要编写/修改基于 configs/*.yml 配置驱动的 CRUD 页面时使用。触发条件：创建新实体页面、编写配置驱动表单、使用 PageLayout/renderSections/CardList 模式。
---

# noval-manage 页面编写技能

本项目使用 **YAML 配置驱动** 模式：`configs/*.yml` 定义字段和布局，构建脚本生成 TypeScript 代码，页面通过 `getEntry()` + `renderSections()` 动态渲染表单。

## 数据流总览

```
┌──────────────┐    构建时     ┌───────────────────┐
│ configs/     │ ───────────► │ src/lib/configs/   │
│ *.yml        │   js-yaml    │   generated.ts     │
│              │   +脚本      │   (CONFIGS + 类型)  │
└──────────────┘              └─────────┬─────────┘
                                       │ 运行时
        ┌────────────────────────────────┼──────────────────────────────┐
        │                                │                              │
        ▼                                ▼                              ▼
┌──────────────┐              ┌──────────────────┐            ┌──────────────────┐
│ crud-config  │              │ useEntityCrud    │            │ renderSections   │
│ ConfigEntity │              │ (entity)         │            │ (sections,config, │
│ → storeKey   │              │  ├─ getEntry()    │            │  onChange)        │
│ → deleteLabel│              │  ├─ getCrudMeta() │            │ → 递归渲染       │
└──────┬───────┘              │  ├─ editorRef     │            │   card/tabs/grid │
       │                      │  └─ mode/items    │            └────────┬─────────┘
       │                      └────────┬─────────┘                     │
       │                               │                               │
       ▼                               ▼                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              page.tsx                                     │
│                                                                          │
│  ┌─────────────┐              ┌─────────────────────────────────────┐   │
│  │  PageLayout  │◄────────────┤ SlidingDrawer                        │   │
│  │  (主视图)     │             │                                      │   │
│  │             │             │ ┌──────────────────────────────────┐ │   │
│  │ CardList    │             │ │ EditorForm (ref, key, sections,   │ │   │
│  │  SimpleCard │             │ │   defaults)                       │ │   │
│  │  renderOpt..│             │ │  → 内部自管状态                     │ │   │
│  │             │             │ │  → ref.getData() / ref.setData()  │ │   │
│  └─────────────┘             │ └──────────────────────────────────┘ │   │
│                              └─────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
       │                              │
       ▼                              ▼
┌─────────────┐              ┌─────────────┐
│ useAppStore  │              │ API Server  │
│ (全局状态)    │◄───────────►│ (/api/<entity>)│
└─────────────┘              └─────────────┘
```

## 导航

| 如果你要... | 读这个文件 |
|------------|-----------|
| 创建或修改 `configs/*.yml` 配置文件 | [config-def.md](config-def.md) |
| 编写页面（CRUD / 数据展示 / 多实体切换） | [page-combine.md](page-combine.md) |
| 了解 useAppStore 的用法和局限 | [store-guide.md](store-guide.md) |
| 使用 `api()` 发请求（含泛型示例） | [api-guide.md](api-guide.md) |
| 查阅 UI 组件选型 | [UI_COMPONENTS.md](UI_COMPONENTS.md) |

## 原则

- **CRUD 页面优先用 `useEntityCrud` + `EditorForm`**，不手写 CRUD 样板逻辑
- **新增实体只需在 `crud-config.ts` 加一行**映射 `ConfigEntity → { storeKey, deleteLabel, apiPath?, needsNovelId? }`
- `getEntry()` 在组件顶层调用，**不要**在循环/条件中重复获取
- 布局用 `PageLayout`，编辑区用 `EditorForm`（内部自管状态，父组件通过 ref 读写），不手写表单
- 编写 UI 时先查阅 [UI_COMPONENTS.md](UI_COMPONENTS.md)，**不要**逐个浏览 `src/components/ui/`
- 多数据列表展示用 `CardList` + `SimpleCard`，选项用 `renderOptions`，文本用 `ConfigBadges`
- **多实体页面用 `switchEntity` + `SimpleTabs`** 切换实体类型，不使用多个独立 hook 实例

## 何时询问用户

- **YAML 配置无法满足需求**（如字段类型不够用、布局无法表达）时，向用户说明限制并提供替代方案
- **UI 组件表不足以支撑当前场景**，向用户描述可选方案（自行封装 / 引入第三方库 / 调整设计）
- **存在多个合理实现路径**（如不确定字段归属哪个实体），先问用户再动手
- **新增的数据是否适合放全局 store**：跨页面共享的数据，先确认是否需要扩展 `useAppStore`

## 关键文件清单

| 文件 | 职责 |
|------|------|
| `configs/<entity>.yml` | 字段定义 + 布局结构（YAML 源） |
| `scripts/generate-configs.cjs` | 构建时脚本：YAML → TS |
| `src/lib/configs/generated.ts` | 生成的配置常量 + 类型 |
| `src/lib/configs/crud-config.ts` | 实体 CRUD 配置表（`ConfigEntity → storeKey / deleteLabel / apiPath / needsNovelId`） |
| `src/lib/configs/config-utils.ts` | `buildDefaultValues` / `fillConfig` |
| `src/lib/configs/config-registry.ts` | `getEntry` 注册表 + `buildConfigInstructions` |
| `src/lib/configs/render-utils.tsx` | `renderField` / `renderSections` / `resolveIcon` |
| `src/hooks/useEntityCrud.ts` | 通用 CRUD hook（mode / items / editorRef / switchEntity） |
| `src/components/ui/editor-form.tsx` | 编辑器表单（ref 驱动，getData / setData / reset） |
