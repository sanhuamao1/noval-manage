---
name: component-use-guide
description: 写UI页面/组件时参考本项目已有的UI组件体系
---

# UI 组件选用指南

所有组件来自 `@/components/ui/`。写页面/组件时优先使用以下组件，不要重复造轮子。

## 可用组件一览

| 组件 | 何时使用 | 关键 props |
|------|---------|-----------|
| `Button` | 任何按钮操作（提交、取消、打开弹窗等） | `variant` (default/destructive/outline/secondary/ghost/link), `size` (default/sm/lg/icon) |
| `AddButton` | 添加按钮（带 Plus 图标的 icon Button） | `onClick` |
| `Input` | 单行文本输入 | 标准 HTML input props |
| `SlidingDrawer` | **右侧滑出编辑面板**：列表+编辑的布局，替代 Dialog 用于内容较多的编辑表单 | `open`, `onClose`, `title` (ReactNode), `onCreate` (SavePlus), `onUpdate` (SaveCheck) |
| `Popover` | 悬浮/点击后弹出的浮动面板（工具提示、快捷选择） | `<Popover><PopoverTrigger /><PopoverContent>...</PopoverContent></Popover>` |
| `Tag` | 状态/分类/属性的彩色徽标 | `color` (primary/success/warn/default), `icon` (可选 ComponentType) |
| `Card` | 区块容器 | `icon` (可选) |
| `CardHeader` | Card 的标题行 | `icon`, `title`, `rightHandler` |
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

## 页面布局模式

### 导航页标题行 + 添加按钮

导航选中展示的页面，只要该功能具有添加属性，标题行统一使用以下模式：

```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <h1 className="text-2xl font-bold">页面标题</h1>
    <AddButton onClick={...} />
  </div>
</div>
```

- `AddButton` 点击后打开 `SlidingDrawer`

### 列表 + 编辑面板布局

左右结构：左侧列表（`SimpleCard` 列表） + 右侧滑出编辑面板（`SlidingDrawer`）：

```tsx
<div className="flex h-full gap-0">
  {/* 左侧列表 */}
  <div className="flex-1 min-w-0 space-y-2 p-6">
    {items.length === 0 ? (
      <CardEmpty>暂无数据</CardEmpty>
    ) : (
      items.map(item => (
        <SimpleCard
          key={item.id}
          title={item.name}
          description={item.description}
          selected={selectedId === item.id}
          onClick={() => onSelect(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      ))
    )}
  </div>

  {/* 右侧编辑面板 */}
  <SlidingDrawer
    open={!!drawerOpen}
    onClose={() => setDrawerOpen(false)}
    title={<h2 className="text-lg font-semibold">编辑标题</h2>}
    onUpdate={handleSave}
    width={480}
  >
    {/* 编辑表单内容 */}
  </SlidingDrawer>
</div>
```

### SlidingDrawer 按钮模式

- `onCreate` → 显示**创建**按钮（SavePlus 图标），用于新增场景
- `onUpdate` → 显示**保存**按钮（SaveCheck 图标），用于编辑场景
- `onClose` → 显示**关闭**按钮（X 图标）
- 三个按钮可组合使用，左侧书签式排列
- `title` 支持 `ReactNode`，可传入自定义标题组件

### Tag 组件用法

```tsx
<Tag color="primary">状态标签</Tag>
<Tag color="success" icon={Check}>已完成</Tag>
<Tag color="warn">注意</Tag>
<Tag color="default">默认</Tag>
```
