---
name: component-use-guide
description: 写UI页面/组件时参考本项目已有的UI组件体系
---

# UI 组件选用指南

组件来自 `@/components/ui/`。写页面/组件时优先使用以下组件，不要重复造轮子。

## 组件一览

| 组件 | 何时使用 | 关键 props |
|------|---------|-----------|
| `Button` | 任何按钮操作 | `variant` (default/destructive/outline/secondary/ghost/link), `size` (default/sm/lg/icon) |
| `AddButton` | 添加按钮（Plus 图标 icon Button） | `onClick` |
| `Input` | 单行文本输入 | 标准 HTML input props |
| `SlidingDrawer` | 右侧滑出编辑面板，替代 Dialog | `open`, `onClose`, `title` (ReactNode), `onCreate` (SavePlus), `onUpdate` (SaveCheck) |
| `Popover` | 悬浮/点击后弹出浮动面板 | `<Popover><PopoverTrigger /><PopoverContent>...</PopoverContent></Popover>` |
| `Tag` | 状态/分类/属性的彩色徽标 | `color` (primary/success/warn/default), `icon` (可选 ComponentType) |
| `Card` | 区块容器 | `icon` (可选) |
| `CardHeader` | Card 标题行 | `icon`, `title`, `rightHandler` |
| `CardContent` | Card 内容区 | 标准 div props |
| `CardEmpty` | 空状态占位 | 标准 div props |
| `SimpleCard` | 可点击/可删除的卡片列表项 | `title`, `description`, `selected`, `onClick`, `onDelete` |

## 引入方式

```tsx
import { Button, AddButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SlidingDrawer } from "@/components/ui/drawer"
import { Tag } from "@/components/ui/tag"
import { Card, CardHeader, CardContent, CardEmpty, SimpleCard } from "@/components/ui/card"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
```

## 页面布局

### 导航页标题行 + 添加按钮

```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <h1 className="text-2xl font-bold">页面标题</h1>
    <AddButton onClick={...} />
  </div>
</div>
```

`AddButton` 点击后打开 `SlidingDrawer`。

### 列表 + 编辑面板

左侧列表（`SimpleCard`）+ 右侧滑出编辑面板（`SlidingDrawer`）：

```tsx
<div className="flex h-full gap-0">
  <div className="flex-1 min-w-0 space-y-2 p-6">
    {items.length === 0 ? <CardEmpty>暂无数据</CardEmpty> : items.map(item => (
      <SimpleCard key={item.id} title={item.name} description={item.description}
        selected={selectedId === item.id} onClick={() => onSelect(item.id)}
        onDelete={() => onDelete(item.id)} />
    ))}
  </div>
  <SlidingDrawer open={!!drawerOpen} onClose={() => setDrawerOpen(false)}
    title={<h2 className="text-lg font-semibold">编辑标题</h2>} onUpdate={handleSave} width={480}>
    {/* 编辑表单 */}
  </SlidingDrawer>
</div>
```

### SlidingDrawer 按钮

- `onCreate` → 创建按钮（SavePlus）
- `onUpdate` → 保存按钮（SaveCheck）
- `onClose` → 关闭按钮（X）
- 可组合，左侧书签式排列
- `title` 支持 ReactNode

### Tag

```tsx
<Tag color="primary">状态</Tag>
<Tag color="success" icon={Check}>已完成</Tag>
<Tag color="warn">注意</Tag>
<Tag color="default">默认</Tag>
```
