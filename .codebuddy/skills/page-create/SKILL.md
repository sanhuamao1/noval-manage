---
name: page-create
description: 创建列表+编辑抽屉类页面（PageLayout + SlidingDrawer）。当需要"概览预览+右侧编辑抽拉"或"卡片列表+创建/编辑抽屉"页面时使用。
allowed-tools: Read, Write, Grep, Edit, Bash
---

# 列表 + 编辑抽屉页面创建

使用 `PageLayout` 统一骨架。所有内容组件放在 `children`，编辑面板放在 `drawer` prop。

## 页面结构

```
PageLayout
  ├─ title         ← 页面标题（string）
  ├─ handler       ← 标题右侧操作区（编辑按钮 / AddButton）
  ├─ children      ← 内容区（Preview 组件 / CardList）
  └─ drawer        ← SlidingDrawer（编辑面板）
```

## 关键组件路径

| 组件 | 路径 |
|------|------|
| `PageLayout` | `@/components/PageLayout` |
| `SlidingDrawer` | `@/components/ui/drawer` |
| `CardList` | `@/components/CardList` |
| `SimpleCard` | `@/components/ui/card` |
| `AddButton` | `@/components/ui/button` |
| `useDrawer` | `@/hooks/useDrawer` |
| `FormItem` | `@/components/form-item` |
| `FormInput` | `@/components/form-input` |
| `NoBorderInput` | `@/components/ui/no-border-input` |

## 常用公共工具方法

| 方法 | 来源 | 用途 |
|------|------|------|
| `parseConfig(raw, defaults)` | `@/lib/configs/config-utils` | 安全解析 JSON 配置，缺失字段用默认值补齐 |
| `buildConfigTags(config, items)` | `@/lib/configs/render-utils` | 从配置对象提取摘要标签数组 |
| `ConfigBadges({ tags })` | `@/lib/configs/render-utils` | 将标签数组渲染为圆角小标签 |
| `renderSections(sections, config, onChange)` | `@/lib/configs/render-utils` | 渲染配置表单区段 |
| `renderField(field, config, onChange)` | `@/lib/configs/render-utils` | 渲染单个配置字段控件 |

### 配置解析 + 摘要标签 — 常用组合

在列表页的每个 `SimpleCard` 中展示子实体的配置摘要：

```typescript
import { parseConfig } from "@/lib/configs/config-utils"
import { buildConfigTags, ConfigBadges } from "@/lib/configs/render-utils"
import { DEFAULT_CHARACTER_CONFIG } from "@/lib/configs/character-defs"

// 列表中每个项的摘要展示
{items.map((item) => {
  const cfg = parseConfig(item.config, DEFAULT_CHARACTER_CONFIG)
  return (
    <SimpleCard key={item.id} title={item.name} onClick={() => openForEdit(item)}>
      <ConfigBadges
        tags={buildConfigTags(cfg, [
          ["性别", "gender"],
          ["年龄", "age"],
          ["身份", "identity"],
        ])}
      />
    </SimpleCard>
  )
})}
```

## 变体 A：单数据（预览 + 编辑）

适用场景：编辑单个详情（小说概览、设置页）。
需要将预览区和编辑区抽离出来封装

### 页面骨架

```tsx
import { useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SlidingDrawer } from "@/components/ui/drawer"
import { Edit3 } from "lucide-react"
import { PageLayout } from "@/components/PageLayout"
import { useDrawer } from "@/hooks/useDrawer"
import { parseConfig } from "@/lib/configs/config-utils"

export default function XxxPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<XxxData | null>(null)
  const editorRef = useRef<XxxEditorHandle>(null)
  const drawer = useDrawer()

  const fetchData = useCallback(async () => {
    setData(await (await fetch(`/api/xxx?id=${id}`)).json())
  }, [id])
  useEffect(() => { fetchData() }, [fetchData])

  // 解析配置（常见模式）
  const config = data ? parseConfig(data.config, DEFAULT_CONFIG) : DEFAULT_CONFIG

  async function handleSave() {
    if (!editorRef.current) return
    const { title, description, config } = editorRef.current.getData()
    if (!title.trim()) return
    const res = await fetch(`/api/xxx/${id}`, { method: "PATCH", /* ... */ })
    if (res.ok) { drawer.close(); fetchData() }
  }

  if (!data) return <Loading />

  return (
    <PageLayout
      title="概览"
      handler={<Button variant="link" size="sm" onClick={() => drawer.setOpen(true)}><Edit3 className="mr-1.5 h-4 w-4" />编辑</Button>}
      drawer={<SlidingDrawer open={drawer.open} onClose={drawer.close} onUpdate={handleSave}>
        <XxxEditor ref={editorRef} initialTitle={data.title} initialDescription={data.description ?? ""} initialConfig={config} />
      </SlidingDrawer>}
    >
      <XxxPreview data={data} config={config} />
    </PageLayout>
  )
}
```

### 编辑器组件模式
使用renderSections渲染
```tsx
export interface XxxEditorHandle { getData: () => { title: string; description: string; config: XxxConfig } }

export const XxxEditor = forwardRef<XxxEditorHandle, XxxEditorProps>(
  function XxxEditor({ initialTitle, initialDescription, initialConfig }, ref) {
    const [title, setTitle] = useState(initialTitle)
    const [description, setDescription] = useState(initialDescription)
    const [config, setConfig] = useState(initialConfig)
    useImperativeHandle(ref, () => ({ getData: () => ({ title, description, config }) }), [title, description, config])
    return <>{/* 表单 UI，可用 renderSections(sections, config, setConfig) */}</>
  },
)
```

完整样板：`${CODEBUDDY_SKILL_DIR}/docs/variant-single.md`

## 变体 B：列表数据（CardList + 创建/编辑）

适用场景：CRUD 子实体集合（角色、规则、章节）。
需要将编辑区抽离出来

### 页面骨架

```tsx
import { parseConfig } from "@/lib/configs/config-utils"
import { buildConfigTags, ConfigBadges } from "@/lib/configs/render-utils"
import { DEFAULT_CHARACTER_CONFIG } from "@/lib/configs/character-defs"

export default function XxxPage() {
  const [items, setItems] = useState<XxxItem[]>([])
  const [mode, setMode] = useState<"create" | "edit" | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const editorRef = useRef<XxxEditorHandle>(null)

  useEffect(() => { fetchItems() }, [])
  async function fetchItems() { setItems(await (await fetch("/api/xxx")).json()) }

  function startCreate() { setMode("create"); setEditingId(null) }
  function openForEdit(item: XxxItem) { setMode("edit"); setEditingId(item.id) }

  async function saveItem() {
    if (!editorRef.current) return
    const data = editorRef.current.getData()
    if (mode === "create") {
      await fetch("/api/xxx", { method: "POST", body: JSON.stringify(data) })
    } else if (mode === "edit" && editingId) {
      await fetch("/api/xxx", { method: "PUT", body: JSON.stringify({ id: editingId, ...data }) })
    }
    fetchItems(); setMode(null); setEditingId(null)
  }

  const editingItem = editingId ? items.find((i) => i.id === editingId) ?? null : null

  return (
    <PageLayout
      title="页面标题"
      handler={<AddButton onClick={startCreate} />}
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={() => { setMode(null); setEditingId(null) }}
          title={<h2 className="text-lg font-semibold">{mode === "create" ? "新建" : "编辑"}</h2>}
          onCreate={mode === "create" ? saveItem : undefined}
          onUpdate={mode === "edit" ? saveItem : undefined}
        >
          <XxxEditor key={editingId ?? "create"} ref={editorRef}
            initialTitle={editingItem?.name ?? ""}
            initialConfig={parseConfig(editingItem?.config, DEFAULT_CONFIG)}
          />
        </SlidingDrawer>
      }
    >
      <CardList emptyText="还没有数据，请先创建">
        {items.map((item) => {
          // 常用模式：解析配置 → 生成摘要标签
          const cfg = parseConfig(item.config, DEFAULT_CONFIG)
          return (
            <SimpleCard key={item.id} title={item.name} selected={editingId === item.id}
              onClick={() => openForEdit(item)} onDelete={() => deleteItem(item.id)}>
              <ConfigBadges
                tags={buildConfigTags(cfg, [
                  ["性别", "gender"],
                  ["年龄", "age"],
                ])}
              />
            </SimpleCard>
          )
        })}
      </CardList>
    </PageLayout>
  )
}
```

完整样板：`${CODEBUDDY_SKILL_DIR}/docs/variant-list.md`

## 两种变体对比

| 维度 | 变体 A | 变体 B |
|------|--------|--------|
| 数据量 | 单条（detail API） | 集合（list API） |
| 创建新项 | 无（仅编辑已有） | `AddButton` → drawer create mode |
| 抽屉开关 | `useDrawer()` hook | `mode` 三态（create/edit/null） |
| 编辑切换 | 同一项 | 多项目切换，`key` 强制重挂载 |
| 保存 | PATCH + refetch | POST/PUT + refetch + close |
| 配置摘要 | — | `parseConfig` + `buildConfigTags` + `ConfigBadges` |
