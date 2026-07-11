---
name: form-config
description: 声明式表单配置化系统。用于用配置数组+渲染引擎自动生成表单 UI，而非手写每个表单项。涉及 config-utils 类型定义、render-utils 渲染、FormItem/radio-group 组件。
allowed-tools: Read, Write, Grep, Edit
---

# 表单配置化生成

核心：**定义配置区段 + 字段数组 → 动态渲染 → 类型自动推导**。

## 流程

```
类型定义 (config-utils.ts) → 配置声明 (xxx-defs.ts) → 渲染 (render-utils.tsx) → UI
```

## 关键文件

| 文件 | 作用 |
|------|------|
| `src/lib/configs/config-utils.ts` | 类型 + 工具：`ConfigOf`、`ConfigSection`、`ConfigFieldDef`、`ConfigOption`、`flattenFields`、`buildDefaultValues`、`parseConfig` |
| `src/lib/configs/render-utils.tsx` | 渲染引擎：`renderField`、`renderSections`、`resolveIcon`、`buildConfigTags`、`ConfigBadges` |
| `src/components/form-item.tsx` | 表单项布局容器，props：`label?`、`display`(default/flex/grid/between)、`handler`、`flexCols` |
| `src/components/radio-group.tsx` | `RadioGroup`（单选）+ `MultiRadioGroup`（多选），支持 icon/color/description |
| `src/components/form-input.tsx` | 带 Label + Icon 的文本输入框 |
| `src/components/form-list.tsx` | 列表输入（多行，每行多个子输入框），配合 type="list" |
| `src/components/ui/no-border-input.tsx` | 无边框可编辑输入框，用于卡片动态标题 |

## 核心方法

| 方法 | 来源 | 用途 |
|------|------|------|
| `parseConfig(raw, defaults)` | config-utils | 安全解析 JSON，缺失字段用默认值补齐 |
| `buildConfigTags(config, items)` | render-utils | 从配置提取标签文本数组 |
| `ConfigBadges({ tags })` | render-utils | 标签数组渲染为圆角标签 |
| `renderField(field, config, onChange)` | render-utils | 渲染单个字段控件 |
| `renderSections(sections, config, onChange, skipKeys?)` | render-utils | 渲染完整区段（card/tabs/grid） |

## 步骤

### 1. 定义配置（`src/lib/configs/xxx-defs.ts`）

```typescript
import { type ConfigOf, type ConfigOption, type ConfigFieldDef, type ConfigSection, buildDefaultValues, flattenFields } from "@/lib/configs/config-utils"

// 选项
const options: ConfigOption[] = [
  { value: "选项A", icon: "Check", color: "primary", meta: "AI用描述" },
  { value: "选项B", icon: "X", color: "warn" },
]

// 字段或区段
// 纯字段数组
const FIELDS = [{ key: "fieldKey", label: "标签", type: "single", options }] as const satisfies readonly ConfigFieldDef<string>[]

// 区段（推荐，支持 card/tabs/grid）
export const CONFIG_SECTIONS: ConfigSection[] = [{
  type: "card", title: "分组名", icon: "Heart",
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

const [config, setConfig] = useState<MyConfig>(DEFAULT_CONFIG)

{ renderSections(CONFIG_SECTIONS, config, setConfig) }

// 混合渲染：flattenFields + skipKeys
const statusField = flattenFields(CONFIG_SECTIONS).find(f => f.key === "status")
{ renderSections(CONFIG_SECTIONS, config, setConfig, ["status"]) }
{ statusField && renderField(statusField, config, setConfig) }

// 编辑器 forwardRef 模式
useImperativeHandle(ref, () => ({ getData: () => config }), [config])
```

### 3. 安全解析 + 摘要

```typescript
const parsed = parseConfig(rawJson, DEFAULT_CONFIG)
const tags = buildConfigTags(parsed, [["题材", "genre"], ["状态", "status"]])
<ConfigBadges tags={tags} />
```

### 4. 卡片动态标题

`card` 区段支持 `titleKey` + `titleEditable`：

```typescript
{ type: "card", title: "角色名称", icon: "UserRound", titleKey: "name", titleEditable: true }
```

## 字段定义

```typescript
{
  key: string               // config 对象的 key
  label: string             // 显示标签
  type: "single"|"multi"|"toggle"|"list"|"text"
  options?: ConfigOption[]  // single/multi 必需
  display?: "default"|"flex"|"grid"|"between"
  cols?: number             // display="grid" 时有效
  max?: number              // multi 最大可选数
  icon?: string             // lucide 图标名
  placeholder?: string      // text 输入框占位
  subFields?: ListSubField[] // list 子字段定义
  noLabel?: boolean
  className?: string
  variant?: string          // "box"（multi/single）
}
```

**选项格式**：`{ value: string; icon?: string; color?: "primary"|"success"|"warn"|"default"; meta?: string }`

**字段类型**：

| type | 值类型 | UI | 说明 |
|------|--------|-----|------|
| `single` | `string` | `RadioGroup` | 单选，需 options |
| `multi` | `string[]` | `MultiRadioGroup` | 多选，需 options |
| `toggle` | `boolean` | `Toggle` | 开关，无需 options |
| `text` | `string` | `FormInput` | 文本输入，需 placeholder |
| `list` | `string[]` | `ListField` | 每行 N 个子输入框，分号拼接 |

## 区段布局

- **card**：`{ type: "card"; title: string; icon?: string; class?: string; titleKey?: string; titleEditable?: boolean; children: ConfigFieldDef[] }`
- **tabs**：`{ type: "tabs"; title: string; icon?: string; class?: string; children: ConfigFieldDef[] }` — field.label 为 tab 标题；type="list" 自动显示 `+` 按钮
- **grid**：`{ type: "grid"; cols: number; class?: string; sections: ConfigSection[] }` — 嵌套子区段等分布局

## 实战参考

- `src/lib/configs/novel-defs.ts` — tabs 区段（题材/主基调/副基调/状态），`display: "flex"`
- `src/lib/configs/character-defs.ts` — grid 3列嵌套，`titleKey`+`titleEditable`，tabs + list
- `src/components/novel/NovelOverviewEditor.tsx` — `renderSections` + `flattenFields` + `skipKeys` 混合
