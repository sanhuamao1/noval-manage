---
name: character-card-layout
overview: 将人物列表从左侧固定宽度侧边栏改造为 flex 卡片网格布局，点击卡片后右侧弹出无固定宽度的编辑面板
todos:
  - id: refactor-characters-layout
    content: 重构 characters/page.tsx 的 JSX 布局：将左侧列表改为flex-wrap卡片网格，右侧改为可抽拉编辑面板，使用CSS transition实现平滑展开效果，并移除编辑区max-w-3xl固定宽度限制
    status: completed
---

## 产品概述

人物管理页面的布局重构，将人物列表从左侧固定宽度的竖向列表改为 flex 卡片网格布局，点击卡片时右侧抽拉出编辑面板。

## 核心功能

- **flex 卡片布局**：人物以卡片形式展示在 flex-wrap 网格中，每张卡片当前只显示姓名
- **选中高亮**：点击卡片时，选中卡片添加主题色（amber-500）边框+光晕，其余保持默认样式
- **右侧抽拉面板**：选中人物后，右侧平滑抽拉出编辑面板（占用空间，非浮动），面板宽度不固定；取消选择时面板收回

## 技术栈

- **框架**: Next.js + TypeScript（现有）
- **样式**: Tailwind CSS + 琥珀设计系统 CSS 变量（现有）
- **组件**: 项目已有的 shadcn/ui + 自定义组件（不变）

## 实现方案

### 布局策略

将原左右分栏改为**动态双栏布局**：

```
┌──────────────────────────────────────────────────┐
│  flex h-full                                      │
│  ┌──────────────────────┬────────────────────────┐│
│  │  flex-1              │  右栏（条件渲染）       ││
│  │  overflow-auto       │  overflow-auto          ││
│  │                      │  transition-all         ││
│  │  ┌── header ────┐   │  w-[520px] / w-0       ││
│  │  │ 标题  [+添加] │   │                        ││
│  │  └──────────────┘   │  编辑面板               ││
│  │                      │  (无 max-w-3xl, full)   ││
│  │  ┌── flex-wrap ──┐  │                        ││
│  │  │ [卡][卡][卡]   │  │                        ││
│  │  │ [卡][卡]       │  │                        ││
│  │  └────────────────┘  │                        ││
│  └──────────────────────┴────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### 关键设计决策

1. **选中边框**: 使用 `border-amber-500` 主题色 + `shadow-glow` 光晕，对应 CSS 变量 `--border-accent` 和 `--shadow-glow`

2. **抽拉面板动效**: 使用 `transition-[width] duration-300` 配合条件式 class，实现平滑展开/收起：

- 选中时：`w-[520px] min-w-0 border-l p-6`
- 未选中时：`w-0 min-w-0 overflow-hidden border-l-0 p-0`
- 纯 CSS transition，无额外动画库

3. **编辑区宽度**: 移除当前 `max-w-3xl mx-auto` 限制，改为 `w-full` 自适应填充右侧面板

4. **卡片设计**: 遵循项目 design system：

- 默认：`bg-bg-700 border border-border-default` 圆角
- hover：`bg-bg-600 border-border-strong` + 微上移
- 选中：`border-amber-500 shadow-glow`

### 性能与可靠性

- 仅改动 return 中的 JSX 布局部分，不涉及数据/状态/API 逻辑变更
- auto-save 逻辑（useEffect 定时保存）保持不变
- 卡片点击逻辑复用现有 `selectCharacter` 函数

### 具体代码变化要点

**需要修改的区域**（lines 236-543）：

1. 外层容器不变：`<div className="flex h-full">`

2. 左栏改为：

```
<div className="flex-1 overflow-auto p-6">
  {/* Header: 标题 + 添加按钮 */}
  {/* flex-wrap 卡片网格 */}
</div>
```

3. 右栏条件渲染，用 `selectedChar` 控制：

```
{selectedChar && (
  <div className="w-[520px] min-w-0 overflow-auto border-l p-6">
    {/* 原编辑区内容，去掉 max-w-3xl mx-auto */}
  </div>
)}
```

取消选择（点击空白或再次点击同卡片）暂不处理（用户未提需求），保持当前状态管理逻辑。