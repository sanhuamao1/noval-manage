---
name: noval-page
description: noval-manage 项目页面编写指南。当需要编写/修改基于 configs/*.yml 配置驱动的 CRUD 页面、AI 工作流页面（梦工厂）时使用。
---

# 项目速查

## 我要做

| 场景 | 关键步骤 | 详细 |
|------|----------|------|
| **新建 CRUD 页面** | 1. `crud-config.ts` 注册实体 → 2. 根据类型使用不同渲染方式 | [page-combine.md](page-combine.md) |
| **修改 YML 配置/加新实体** | 1. 编辑 `configs/*.yml` → 2. 跑 `node scripts/generate-configs.cjs` | [yml-guide.md](yml-guide.md) |
| **AI 工作流页面** | `useFactory` + Tab 缓存，见模板 | [factory-page.md](factory-page.md) |
| **注册导航 / 路由规范** | 在 `layout.tsx` 的 `navItems` 加一项 | [entry-points.md](entry-points.md) |
| **了解项目结构** | 目录总览 + 数据流向 + 关键文件职责 | [project-structure.md](project-structure.md) |
| **选 UI 组件** | 优先查 | [UI_COMPONENTS.md](UI_COMPONENTS.md) |
| **用全局 store** | `useAppStore` / `useEntityStore` | [store-guide.md](store-guide.md) |
| **发 API 请求** | `api()` from `@/lib/api.ts` | 禁止使用fetch，如果api不满足，就扩展api|
| **AI 调用 & Prompt** | `callAI()` / `callAIChat()` / prompt 模板 / templates 占位替换 | [ai-guide.md](ai-guide.md) |

## 三条铁律

1. **CRUD 页面一律 `useEntityCrud` + `EditorForm`**，不手写样板
2. **新增实体只在 `crud-config.ts` 加一行**映射
3. **布局：`PageLayout` + `CardList` + `SimpleCard`**，表单用 `EditorForm`
