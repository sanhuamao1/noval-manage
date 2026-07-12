---
name: noval-page
description: noval-manage 项目页面编写指南。当需要编写/修改基于 configs/*.yml 配置驱动的 CRUD 页面时使用。触发条件：创建新实体页面、编写配置驱动表单、使用 PageLayout/renderSections/CardList 模式。
---

# noval-manage 页面编写技能

本项目使用 **YAML 配置驱动** 模式：`configs/*.yml` 定义字段和布局，构建脚本生成 TypeScript 代码，页面通过 `getEntry()` + `renderSections()` 动态渲染表单。

---

## 导航

根据当前任务选择对应文件：

| 如果你要... | 读这个文件 |
|------------|-----------|
| 创建或修改 `configs/*.yml` 配置文件 | [config-def.md](config-def.md) |
| 编写**单数据**页面（概览/详情页，数据来自 useAppStore） | [page-single.md](page-single.md) |
| 编写**多数据**列表页面（CRUD 列表页，数据来自 api()） | [page-list.md](page-list.md) |
| 了解 useAppStore 的用法和局限 | [store-guide.md](store-guide.md) |
| 使用 `api()` 发请求（含泛型示例） | [api-guide.md](api-guide.md) |
| 查阅 UI 组件选型 | [UI_COMPONENTS.md](UI_COMPONENTS.md) |

## 原则

- `getEntry()` 在组件顶层调用，**不要**在循环/条件中重复获取
- 布局用 `PageLayout`，编辑区用 `renderSections` 动态生成，不手写表单
- 编写 UI 时先查阅 [UI_COMPONENTS.md](UI_COMPONENTS.md)，**不要**逐个浏览 `src/components/ui/`
- 多数据列表展示用 `CardList` + `SimpleCard` + `ConfigBadges`

## 何时询问用户

- **YAML 配置无法满足需求**（如字段类型不够用、布局无法表达）时，向用户说明限制并提供替代方案，让用户决策
- **UI 组件表不足以支撑当前场景**（如需要特殊交互），向用户描述可选方案（自行封装 / 引入第三方库 / 调整设计），让用户选择
- **存在多个合理实现路径**（如不知道该用单数据还是多数据模式、不确定字段归属哪个实体），先问用户再动手
- **新增的数据是否适合放全局 store**：如果是跨页面共享的数据（如实体列表），询问用户是否需要扩展 `useAppStore` 添加对应的 state 和 action，而不是直接写在页面内
- **不确定当前方案是否最合适**时，向用户简要说明你的判断和理由，让用户确认后再继续
