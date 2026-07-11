---
name: form-config
description: 声明式表单配置化系统。用于用配置数组+渲染引擎自动生成表单 UI，而非手写每个表单项。涉及 config-utils 类型定义、render-utils 渲染、FormItem/radio-group 组件。
allowed-tools: Read, Write, Grep, Edit
---

# 表单配置化生成

核心原则：**单一数据源** — 定义配置区段 + 字段数组 → 动态渲染表单 → 类型自动推导。

## 整体流程

```
类型定义层 (config-utils.ts)  →  配置声明层 (xxx-defs.ts)  →  渲染层 (render-utils.tsx)  →  UI组件
```

## 关键文件

| 文件 | 作用 |
|------|------|
| `src/lib/configs/config-utils.ts` | 类型定义 + 工具函数：`ConfigOf`、`ConfigSection`、`ConfigFieldDef`、`ConfigOption`、`flattenFields`、`buildDefaultValues`、`parseConfig` |
| `src/lib/configs/render-utils.tsx` | 渲染引擎 + 公共组件：**`renderField`**、**`renderSections`**、**`resolveIcon`**、**`buildConfigTags`**、**`ConfigBadges`** |
| `src/components/form-item.tsx` | 表单项布局容器，props：`label?`、`display`(default/flex/grid/between)、`handler`、`flexCols` |
| `src/components/radio-group.tsx` | `RadioGroup`（单选）+ `MultiRadioGroup`（多选），支持 icon/color/description |
| `src/components/form-input.tsx` | 带 Label + Icon 的文本输入框 |
| `src/components/form-list.tsx` | 列表输入（多行，每行多个子输入框），配合 type="list" 使用 |
| `src/components/ui/no-border-input.tsx` | `NoBorderInput` — 无边框可编辑输入框，用于卡片动态标题等场景 |

## 常用公共方法

| 方法 | 来源 | 用途 |
|------|------|------|
| `parseConfig(raw, defaults)` | config-utils | 安全解析 JSON 字符串，缺失字段用默认值补齐 |
| `buildConfigTags(config, items)` | render-utils | 从配置对象提取标签文本数组 `string[]` |
| `ConfigBadges({ tags })` | render-utils | 将标签数组渲染为居中的小圆角标签 |
| `renderField(field, config, onChange)` | render-utils | 渲染单个字段控件 |
| `renderSections(sections, config, onChange, skipKeys?)` | render-utils | 渲染完整配置区段（card/tabs/grid） |

### `parseConfig` — 安全解析配置

```typescript
import { parseConfig } from "@/lib/configs/config-utils"

// 从 API 返回的 JSON 字符串安全解析，缺失字段用 DEFAULT 补齐
const config = parseConfig(dbRecord.config, DEFAULT_CONFIG)
```



### `NoBorderInput` — 无边框标题输入框

```typescript
import { NoBorderInput } from "@/components/ui/no-border-input"

// 默认 text-base（卡片标题）
<NoBorderInput value={name} onChange={(e) => setName(e.target.value)} placeholder="角色名称" />

// 传 className 覆盖字号（text-lg 章节标题等）
<NoBorderInput ref={inputRef} value={title} onChange={...} className="text-lg" placeholder="章节标题" />
```

## 步骤

### 1. 定义配置（`src/lib/configs/xxx-defs.ts`）

```typescript
import { type ConfigOf, type ConfigOption, type ConfigFieldDef, type ConfigSection, buildDefaultValues, flattenFields } from "@/lib/configs/config-utils"

// 选项
const options: ConfigOption[] = [
  { value: "选项A", icon: "Check", color: "primary", meta: "AI用描述" },
  { value: "选项B", icon: "X", color: "warn" },
]

// 字段或区段（二选一或组合）
// 方式A：纯字段数组
const FIELDS = [{ key: "fieldKey", label: "标签", type: "single", options }] as const satisfies readonly ConfigFieldDef<string>[]

// 方式B：区段（推荐，支持 card/tabs/grid 布局）
export const CONFIG_SECTIONS: ConfigSection[] = [{
  type: "card",
  title: "分组名",
  icon: "Heart",
  children: [{ key: "fieldKey", label: "标签", type: "single", options }],
}]

// 类型推导
const _allFields = flattenFields(CONFIG_SECTIONS)
export type MyConfig = ConfigOf<typeof _allFields> & { prompt?: string }
export const DEFAULT_CONFIG = buildDefaultValues(_allFields)
```

### 2. 在组件中使用

```typescript
import { renderSections } from "@/lib/configs/render-utils"
import { CONFIG_SECTIONS, DEFAULT_CONFIG, type MyConfig } from "@/lib/configs/xxx-defs"

// 初始化
const [config, setConfig] = useState<MyConfig>(DEFAULT_CONFIG)

// 渲染（覆盖初始值用 parseConfig：parseConfig(dbRecord.config, DEFAULT_CONFIG)）
{ renderSections(CONFIG_SECTIONS, config, setConfig) }

// 混合渲染：flattenFields 抽某个字段，skipKeys 排除
const statusField = flattenFields(CONFIG_SECTIONS).find(f => f.key === "status")
{ renderSections(CONFIG_SECTIONS, config, setConfig, ["status"]) }
{ statusField && renderField(statusField, config, setConfig) }

// 编辑器 forwardRef 模式
useImperativeHandle(ref, () => ({ getData: () => config }), [config])
```

### 3. 解析与摘要`buildConfigTags` + `ConfigBadges`

```typescript
import { parseConfig } from "@/lib/configs/config-utils"
import { buildConfigTags, ConfigBadges } from "@/lib/configs/render-utils"

// 安全解析
const parsed = parseConfig(rawJson, DEFAULT_CONFIG)

// 新版摘要（推荐）：指定要显示的字段
const tags = buildConfigTags(parsed, [
  ["题材", "genre"],
  ["状态", "status"],
])
<ConfigBadges tags={tags} />

```

### 4. 卡片动态标题

`card` 区段支持 `titleKey` + `titleEditable` 实现动态可编辑标题：

```typescript
{
  type: "card",
  title: "角色名称",       // 作为 placeholder / fallback
  icon: "UserRound",
  titleKey: "name",       // 从 config.name 读取标题
  titleEditable: true,    // 标题变为可编辑输入框
}
```

## 字段定义

### 字段配置项

```typescript
{
  key: string               // 必填，config 对象的 key
  label: string             // 必填，显示标签
  type: "single"|"multi"|"toggle"|"list"|"text"  // 必填
  options?: ConfigOption[]  // single/multi 必需
  display?: "default"|"flex"|"grid"|"between"  // 控件布局
  cols?: number             // display="grid" 时有效
  max?: number              // multi 可选，最大可选数
  handler?: "全选"          // multi 可选，label 旁显示全选按钮
  icon?: string             // lucide 图标名，tabs 中显示在 tab trigger 上
  placeholder?: string      // text 类型输入框占位文本
  subFields?: ListSubField[] // list 类型的子字段定义
  noLabel?: boolean         // 不显示 label
  className?: string        // 自定义类名
  variant?: string          // 控件变体，如 "box"（multi/single）
}
```

### 选项格式

```typescript
{ value: string; icon?: string; color?: "primary"|"success"|"warn"|"default"; meta?: string }
```

### 字段类型

| type | 值类型 | UI | 说明 |
|------|--------|-----|------|
| `single` | `string` | `RadioGroup` | 单选，需 options |
| `multi` | `string[]` | `MultiRadioGroup` | 多选，需 options |
| `toggle` | `boolean` | `Toggle` | 开关，无需 options |
| `text` | `string` | `FormInput` | 文本输入框，需 placeholder |
| `list` | `string[]` | `ListField` | 列表（每行 N 个子输入框，分号拼接），在 tabs 中自动显示 `+` 按钮 |

## 区段布局

### card — 带标题/图标的卡片

```typescript
{ type: "card"; title: string; icon?: string; class?: string; titleKey?: string; titleEditable?: boolean; children: ConfigFieldDef[] }
```

### tabs — Tab 切换（list 类型自动显示添加按钮）

```typescript
{ type: "tabs"; title: string; icon?: string; class?: string; children: ConfigFieldDef[] }
// 每个 field.label 作为 tab 标题，field.icon 可显示在 tab trigger 上
// field.type === "list" 时，该 tab 右上角自动显示 + 按钮
// list 为空时显示"点击右上角 + 添加"提示
```

### grid — CSS Grid 等分布局，嵌套子区段

```typescript
{ type: "grid"; cols: number; class?: string; sections: ConfigSection[] }
```

## 实战参考

- **`src/lib/configs/novel-defs.ts`** — 单个数据，tabs 区段（题材/主基调/副基调/状态），`display: "flex"`
- **`src/lib/configs/character-defs.ts`** — grid 3 列嵌套，`titleKey`+`titleEditable` 动态标题，tabs + list 搭配
- **`src/components/novel/NovelOverviewEditor.tsx`** — `renderSections` + `flattenFields` + `skipKeys` 混合使用
