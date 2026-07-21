# 梦工厂/AI 工作流页面模式

## 概述

梦工厂（Factory）是 AI 驱动的工作流页面模式，核心特征：
- **Tab 维度状态缓存**：每个 tab 独立管理 prompt、结果、应用状态
- **生成 → 预览 → 应用/舍弃** 工作流
- **可扩展**：新增 tab 只需注册配置，无需修改核心逻辑

## 页面入口 (`factory/page.tsx`)

```tsx
export default function FactoryPage() {
  const { prompt, setPrompt, loading, activeTab, tabs, handleGenerate, changeTab } = useFactory();

  return (
    <PageLayout title="梦工厂">
      <div className="flex items-center justify-between">
        <SimpleTabs tabs={tabs} value={activeTab} onChange={changeTab} variant="segment" />
        <Popover trigger={<Button>设置</Button>} content={<Textarea value={draftPrompt} onChange={...} />} />
      </div>
      <div className="mt-4">{TAB_COMPONENTS[activeTab]}</div>
    </PageLayout>
  );
}
```

**关键点**：
- `tabs` 和 `handleGenerate` 来自 `useFactory()`，不是页面内定义
- 用 `TAB_COMPONENTS[activeTab]` 对象映射渲染，非条件渲染
- Prompt 通过 Popover 输入，调用 `setPrompt` 后 `handleGenerate` 自动携带

## useFactory() 关键返回值

| 字段 | 类型 | 说明 |
|------|------|------|
| `activeTab` | `string` | 当前激活的 tab key |
| `tabs` | `SimpleTab[]` | 所有 tab 配置（由 TABS_MAP 生成） |
| `prompt` | `string` | 当前 tab 的额外 prompt |
| `setPrompt(v)` | `Function` | 设置当前 tab 的 prompt |
| `loading` | `boolean` | 是否正在生成 |
| `error` | `string \| null` | 错误信息 |
| `result` | `EnrichResult \| null` | 生成结果 `{ operations, analysis }` |
| `applied` | `Set<number>` | 已应用的操作索引集合 |
| `applying` | `Set<number>` | 正在应用的操作索引集合 |
| `applyErrors` | `Map<number, string>` | 应用失败的错误信息 |
| `discarded` | `Set<number>` | 已舍弃的操作索引集合 |
| `editedParams` | `Map<number, Record>` | 编辑过的参数（应用时覆盖原始 params） |
| `setEditedParams(idx, params)` | `Function` | 编辑某个操作的参数 |
| `drawerIndex` / `setDrawerIndex` | 用于展开操作详情的 Drawer 控制 |
| `opsCount` / `appliedCount` | 操作总数 / 已应用数 |
| `changeTab(key)` | 切换 tab（自动初始化缓存） |
| `handleGenerate(body?)` | 调用 API 生成结果（自动携带当前 prompt） |
| `handleApply(index)` | 应用单个操作 |
| `handleDiscard(index)` | 舍弃单个操作 |
| `reset()` | 重置当前 tab（保留 prompt） |

## 核心文件

| 文件 | 职责 |
|------|------|
| `src/stores/useFactoryStore.tsx` | 存储层：Zustand store（tab 缓存） + `useFactory()` hook（读取当前 tab 数据） |
| `factory/page.tsx` | 页面入口：TAB_COMPONENTS 映射 + SimpleTabs + Prompt Popover |
| `factory/<tab-name>.tsx` | 各 tab 的具体 UI 实现 |

## 新增 Tab 三步

**① 注册 Tab 配置**：在 `useFactoryStore.tsx` 的 `TABS_MAP` 中添加：

```ts
export const TABS_MAP: Record<string, { url: string; label: string; icon: ReactNode }> = {
  "enrich-settings": { url: "/api/factory/enrich-settings", label: "完善设定", icon: <Wand2 /> },
  "new-tab": { url: "/api/factory/new-tab", label: "新功能", icon: <Search /> },
};
```

`TABS` 和 `tabs` 会自动从 `TABS_MAP` 生成，无需手动维护。

**② 创建 Tab 组件**：在 `factory/` 下新建 `<tab-name>.tsx`：

```tsx
"use client";
import { useFactory } from "@/stores/useFactoryStore";

export default function NewTab() {
  const { result, loading, error, handleApply, applied, discarded } = useFactory();
  // 根据 result.operations 渲染 UI
}
```

**③ 在 page.tsx 的 TAB_COMPONENTS 中注册**：

```tsx
/** 各 tab 的组件映射（Suspense 包裹实现按需加载） */
const TAB_COMPONENTS: Record<string, React.ReactNode> = {
  "enrich-settings": (
    <Suspense fallback={<EditorSkeleton />}>
      <EnrichSettings />
    </Suspense>
  ),
  "gen-outline": (
    <Suspense fallback={<EditorSkeleton />}>
      <GenOutline />
    </Suspense>
  ),
};
```

## 与 CRUD 页面的区别

| 特征 | CRUD 页面 | 梦工厂页面 |
|------|-----------|-----------|
| 数据来源 | store（持久化列表） | API 实时生成 |
| 编辑方式 | Drawer 表单 | 参数编辑 + 应用/舍弃 |
| 状态管理 | `useEntityCrud` | `useFactory` |
| 缓存策略 | 全局 store 持久化 | tab 维度临时缓存 |

## 参考文件

- Store: [src/stores/useFactoryStore.tsx](../../../src/stores/useFactoryStore.tsx)
- 页面: [src/app/novel/[id]/factory/page.tsx](../../../src/app/novel/[id]/factory/page.tsx)
- 组件: [src/app/novel/[id]/factory/enrich-settings.tsx](../../../src/app/novel/[id]/factory/enrich-settings.tsx)