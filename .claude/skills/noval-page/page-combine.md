# 页面编写

## 四种页面类型速查

| 类型 | 核心 Hook | 参考页面 |
|------|-----------|----------|
| **CRUD 单实体** | `useEntityCrud` | `characters/`、`locations/`、`organizations/` |
| **CRUD 多实体** | `useEntityCrud` + `switchEntity` | `polish/` |
| **单数据编辑** | `useAppStore` + `api()` | novel 概览页 `novel/[id]/page.tsx` |
| **AI 工作流（梦工厂）** | `useFactory` | `factory/` |

---

## CRUD 单实体（最常用）

### 核心步骤

**① 创建路由**：`src/app/novel/[id]/<feature>/page.tsx`

**② 注册实体 CRUD**：在 `src/lib/configs/crud-config.ts` 加一行：

```ts
[ConfigEntity.CHARACTER]: { storeKey: "characters", deleteLabel: "人物" },
```

**③ 写页面**（模板见下方）

### 页面模板

```tsx
"use client"

import { PageLayout, SlidingDrawer, CardList, SimpleCard, EditorForm, AddButton } from "@/components/ui"
import { useEntityCrud } from "@/hooks/useEntityCrud"
import { ConfigEntity } from "@/lib/configs/config-registry"

export default function MyEntityPage() {
  const {
    items, mode, fieldsMap, sections, editorRef, defaults,
    openEdit, openAdd, createItem, updateItem, deleteItem, close,
  } = useEntityCrud(ConfigEntity.MY_ENTITY)

  return (
    <PageLayout
      title="页面标题"
      handler={<AddButton onClick={openAdd} />}
      drawer={
        <SlidingDrawer open={mode !== null} onClose={close}
          onCreate={mode === "create" ? createItem : undefined}
          onUpdate={mode === "edit" ? updateItem : undefined}>
          <EditorForm ref={editorRef} key={String(ConfigEntity.MY_ENTITY)}
            sections={sections} defaults={defaults} />
        </SlidingDrawer>
      }>
      <CardList emptyText="暂无数据">
        {items.map(item => (
          <SimpleCard key={item.id} title={item.name}
            onClick={() => openEdit(item)}
            onDelete={() => deleteItem(item.id)} />
        ))}
      </CardList>
    </PageLayout>
  )
}
```

### 数据流

```
useEntityCrud(entity)
  ├── getEntry(entity) → sections, defaults, fields, fieldsMap
  ├── getCrudMeta(entity) → storeKey, deleteLabel
  ├── useAppStore(storeKey) → items（响应式）
  ├── editorRef → EditorForm（自管状态）
  │     ├── openEdit → ref.setData(item)
  │     ├── openAdd → ref.reset()
  │     ├── createItem → ref.getData() → api POST → mutate
  │     └── updateItem → ref.getData() → api PUT → mutate
  └── mode / editingId（drawer 状态）
```

> 完整的 `useEntityCrud` 返回值表、`EditorForm` Props 说明见本文件附录。卡片信息渲染（`renderOptions`、`ConfigBadges`）见 [UI_COMPONENTS.md](UI_COMPONENTS.md)。

---

## CRUD 多实体（Tab 切换）

一个页面管理多种实体类型，通过 Tab 切换。

### 核心步骤

**① 同单实体 ①、②**，在 `crud-config.ts` 中注册所有实体

**② 定义 tabs 配置 + 使用 `switchEntity`**：

```tsx
const TABS = [
  { key: ConfigEntity.POLISH_RULE, label: "润色规则" },
  { key: ConfigEntity.POLISH_SAMPLE, label: "风格样本" },
];

// 在 useEntityCrud 中解构 switchEntity
const { currentEntity, switchEntity, ...rest } = useEntityCrud(ConfigEntity.POLISH_RULE);
```

**③ 渲染 SimpleTabs + 根据 `currentEntity` 条件渲染卡片内容**：

```tsx
<SimpleTabs tabs={TABS} value={currentEntity} onChange={(k) => switchEntity(k as ConfigEntity)} />
```

> 完整示例见 [src/app/novel/[id]/polish/page.tsx](../../../src/app/novel/[id]/polish/page.tsx)。

---

## 单数据编辑（无列表）

只有一个数据对象（如 novel 概览），不涉及列表 CRUD。

### 核心步骤

**① 读取数据**：`const novel = useAppStore(s => s.novel)`

**② fillConfig 填充表单**：

```tsx
const { fields, sections, defaults } = getEntry(ConfigEntity.NOVEL);
const [editorConfig, setEditorConfig] = useState(defaults);

useEffect(() => {
  if (novel) setEditorConfig(fillConfig(novel, defaults, fields));
}, [novel]);
```

**③ mutate 保存**：

```tsx
const mutate = useAppStore(s => s.mutate);
await mutate(id, "novel", () =>
  api({ url: `/api/novels/${id}`, method: "PATCH", data: editorConfig })
);
```

> 完整示例见 [src/app/novel/[id]/page.tsx](../../../src/app/novel/[id]/page.tsx)。

---

## AI 工作流（梦工厂）

基于 `useFactory` 的 Tab 维度缓存机制，核心为生成 → 预览 → 应用/舍弃。

> 详细架构、新增 Tab 流程、`useFactory()` 完整返回值见 [factory-page.md](factory-page.md)。

---

## 附录

### useEntityCrud 关键返回值

| 字段 | 说明 |
|------|------|
| `items` | 实体列表数据（来自 store） |
| `mode` | `"create"` / `"edit"` / `null` |
| `sections` / `defaults` | 传给 EditorForm |
| `fieldsMap` | 字段定义映射（卡片渲染用） |
| `currentEntity` | 当前实体类型（用于 EditorForm `key`） |
| `editorRef` | 传给 `<EditorForm ref={...}>` |
| `openEdit(item)` / `openAdd()` | 切换 drawer 模式 |
| `createItem()` / `updateItem()` / `deleteItem(id)` | CRUD 操作 |
| `close()` | 关闭 drawer |
| `switchEntity(next)` | 切换到另一实体（多实体页面用） |

### EditorForm Props

| Prop | 说明 |
|------|------|
| `ref` | 必传，父组件通过 `ref.getData()` / `ref.setData()` / `ref.reset()` 操作 |
| `sections` | 表单分区定义 |
| `defaults` | 默认值对象 |
| `key` | **必传** `String(currentEntity)`，切换实体时重挂载 |

### 卡片内容渲染速查

```tsx
// 选项类字段（如角色、状态）
{renderOptions(fieldsMap["role"]?.options, item.role)}

// 文本类字段
<ConfigBadges config={item} items={[["性别", "gender"], ["身份", "identity"]]} />
```

### 常见反模式

| ❌ | ✅ |
|----|-----|
| 手写 CRUD 逻辑 | 用 `useEntityCrud` |
| 直接操作 store items | 通过 `mutate` 更新 |
| 手写表单渲染 | 用 `EditorForm` + `renderSections` |
| 每个页面重复写 drawer 状态 | 用 `useEntityCrud` 统一管理 |