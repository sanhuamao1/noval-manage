---
name: noval-page
description: noval-manage 项目页面编写指南。当需要编写/修改基于 configs/*.yml 配置驱动的 CRUD 页面、AI 工作流页面（梦工厂）时使用。
---

# noval-manage 页面编写技能

本项目使用 **YAML 配置驱动** 模式：`configs/*.yml` 定义字段和布局，构建脚本生成 TypeScript，页面通过 `getEntry()` + `renderSections()` 动态渲染。

## 我想做什么？

| 场景 | 看这里 |
|------|--------|
| 创建/修改 YML 配置（字段、布局、选项） | [yml-guide.md](yml-guide.md) |
| 编写 CRUD 页面 / 多实体切换页面 / 单数据编辑页 | [page-combine.md](page-combine.md) |
| 编写梦工厂（AI 工作流）页面 | [page-combine.md](page-combine.md)（工厂模式章节），详细见 [factory-page.md](factory-page.md) |
| 了解入口文件规范（page.tsx / layout.tsx）| [entry-points.md](entry-points.md) |
| 了解项目结构和模块职责 | [project-structure.md](project-structure.md) |
| 查 UI 组件选型 | [UI_COMPONENTS.md](UI_COMPONENTS.md) |
| 使用全局 store | [store-guide.md](store-guide.md) |
| 发 API 请求 | [api-guide.md](api-guide.md) |
| 组装 AI Prompt / 调用 AI | [ai-guide.md](ai-guide.md) |

## 核心原则

1. **CRUD 页面统一用 `useEntityCrud` + `EditorForm`**，不手写样板逻辑
2. **新增实体只需在 `crud-config.ts` 加一行**映射 `ConfigEntity → { storeKey, deleteLabel }`
3. **布局用 `PageLayout`，表单用 `EditorForm`，列表用 `CardList` + `SimpleCard`**

## 何时询问用户

- YML 配置无法满足需求时，说明限制并提供替代方案
- UI 组件不足以支撑当前交互时，描述可选方案让用户决策
- 存在多个合理实现路径时，先问用户再动手