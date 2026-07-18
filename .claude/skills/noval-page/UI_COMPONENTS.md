# UI 组件速查表

以下所有组件从 `@/components/ui` 统一导出。

## 布局组件

| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| `PageLayout` | 页面骨架：标题 + 操作区 + 主内容 + 抽屉 | `title`, `handler`, `children`, `drawer` |
| `Card` | 带内边距和边框的卡片容器 | `icon?`, `className` |
| `CardHeader` | Card 的标题栏（图标 + 标题 + 右操作） | `icon?`, `title`, `rightHandler?` |
| `CardContent` | Card 的内容区，透传 className | `className` |
| `CardEmpty` | 卡片空状态提示 | — |
| `SimpleCard` | 可点击/可删除的摘要卡片 | `title`, `description?`, `selected?`, `onClick?`, `onDelete?`, `icon?`, `children` |
| `CardList` | SimpleCard 列表容器（带空状态文案） | `emptyText`, `children`, `className?` |
| `Tabs` | Tab 切换容器 | `defaultValue`, `className?` |
| `TabsList` | Tab 选项条 | — |
| `TabsTrigger` | 单个 Tab 选项 | `value`, `label`, `icon?` |
| `TabsContent` | Tab 内容区 | `value`, `onAdd?`（显示 + 按钮） |
| `SimpleTabs` | 简洁型 Tab 条（无卡片背景） | `tabs: {key,label}[]`, `value`, `onChange`, `counts?` |

## 表单组件

| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| `FormItem` | 表单项封装（标签 + 控件 + 布局） | `label?`, `children`, `display?`, `handler?` |
| `Input` | 单行文本输入 | 标准 HTML input props |
| `LongTextField` | 多行文本（带字数统计 + 上限） | `value`, `maxLength`, `label`, `onChange`, `placeholder?` |
| `NoBorderInput` | 无边框输入（内联编辑） | 标准 HTML input props |
| `Textarea` | 纯文本域（不含字数统计） | 标准 HTML textarea props |
| `Toggle` | 开关 | `value: boolean`, `onChange` |
| `RadioGroup` | 单选/多选按钮组 | `options: RadioOption[]`, `type: "single"\|"multi"`, `value`, `onChange`, `variant?`, `max?` |
| `Select` | 下拉选择（基于 Radix） | Radix Select 组件集 |
| `Stepper` | 滑块步进器 | `min?`, `max?`, `step?`, `value?`, `onChange?` |
| `ListField` | 动态列表编辑器（子字段用 `;` 拼接） | `subFields: ListSubField[]`, `values: string[]`, `onChange` |
| `TagSelect` | 从关联实体选择标签（引入自 `@/components/outline/TagSelect`） | `label`, `entity`, `novelId`, `selectedIds`, `onChange` |
| `Tags` | 自定义标签输入 | `value`, `onChange` |

## 展示组件

| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| `Tag` | 标签徽章 | `icon?`, `color?`, `variant: "rounded"\|"sharp"`, `children` |
| `ConfigBadges` | 从配置对象提取字段渲染为标签列表 | `config: T`, `items: [label, key][]` |
| `Label` | 表单标签（支持图标） | `icon?`, `children` |
| `Tooltip` | 悬停提示 | `content`, `side?`, `children` |
| `Popover` | 弹出层（基于 Radix） | Radix Popover 组件集 |

## 操作组件

| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| `Button` | 按钮 | `variant: "default"\|"destructive"\|"outline"\|"ghost"\|"link"\|"radio"`, `size`, `isActive?` |
| `AddButton` | 预设为 `+` 图标的圆形按钮 | 同 Button props（自动设为 `size="icon"`） |
| `SlidingDrawer` | 滑动侧边抽屉 | `open`, `onClose?`, `width?`, `title?`, `onCreate?`, `onUpdate?`, `rightHandler?` |

## 编辑器组件

| 组件 | 用途 | 关键 Props | Ref 方法 |
|------|------|-----------|----------|
| `EditorForm` | 配置驱动表单，内部自管状态，父组件通过 ref 读写 | `sections`, `defaults`, `key`(必传,用于切换实体时重挂载) | `getData()`, `setData(data)`, `reset()` |

## 何时询问用户

- **组件表不足以支撑当前交互**（如需要特殊手势、拖拽、富文本编辑），描述可选方案（自行封装 / 引入第三方库 / 调整设计），让用户决策
- **不确定用哪个组件**时，向用户列出相近选项的差异，让用户选择

## 关键关系

```
PageLayout
├── title + handler（标题行）
│   └── AddButton onClick={createItem}
├── children（主内容区）
│   ├── CardList > SimpleCard > ConfigBadges  （列表展示）
│   └── Card > CardHeader + CardContent        （卡片分组）
└── drawer（滑动抽屉）
    └── SlidingDrawer
        └── EditorForm ref={editorRef} key={currentEntity} sections={sections} defaults={defaults}
            └── renderSections(sections, config, onChange)  // 内部调用
```
