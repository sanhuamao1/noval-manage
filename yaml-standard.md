# Configs YAML 定义指南

`configs/` 目录是配置系统的**唯一数据源**。所有 YAML 文件由构建脚本 `scripts/generate-configs.cjs` 编译为 `src/lib/configs/generated.ts`，生成 TypeScript 类型接口和运行时数据。

---

## 文件结构

```
configs/
├── shared-options.yml    # 跨实体共享的选项数据
├── preset-styles.yml     # 预设文风等独立选项集合
├── <entity>.yml          # 每个实体一个配置文件
│   ├── novel.yml
│   ├── character.yml
│   ├── outline.yml
│   ├── polish-rule.yml
│   └── polish-sample.yml
```

---

## 新增实体流程

1. 在 `configs/` 下新建 `<entity-name>.yml`
2. 在 `scripts/generate-configs.cjs` 的 `entities` 数组中添加文件名：

```js
const entities = ["novel", "character", "outline", "polish-rule", "polish-sample", "new-entity"];
```

3. 运行 `node scripts/generate-configs.cjs` 重新生成
4. 生成物会自动包含：ConfigEntity 枚举值、TypeScript 类型接口、运行时配置对象

> 枚举 Key 由 kebab-case 自动转为 SCREAMING_SNAKE：`polish-rule` → `POLISH_RULE`。类型名由 kebab-case 自动转为 PascalCase：`polish-rule` → `PolishRuleConfig`。

---

## 配置文件整体结构

每个 `<entity>.yml` 由三个顶层节点组成：

```yaml
entity: EntityName  # 实体显示名（英文，供 AI prompt 等处使用）

fields:             # 字段定义字典，key 为字段名
  fieldKey:
    type: ...
    label: ...
    # ...

sections:           # 页面布局定义，引用 fields 中的 key
  - type: card
    fields: [fieldKey, ...]
```

---

## 字段定义（`fields`）

字段定义是一个字典（map），key 是字段的唯一标识符，value 是字段配置对象。

### 字段控件类型（`type`）

| type | 值类型 | 默认值 | 说明 |
|------|--------|--------|------|
| `text` | `string \| undefined` | `undefined` | 单行文本输入 |
| `longtext` | `string \| undefined` | `undefined` | 多行文本输入 |
| `single` | `string \| undefined` | `undefined` | 单选 |
| `multi` | `string[]` | `[]` | 多选 |
| `toggle` | `boolean` | `false` | 开关 |
| `list` | `string[]` | `[]` | 动态列表 |
| `tagselect` | `string[]` | `[]` | 标签选择器（从其他实体动态获取选项） |

### 通用属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | `string` | **必填**。控件类型，取上述表格中的值 |
| `label` | `string` | **必填**。字段显示标签 |
| `defaultValue` | `any` | 自定义默认值，优先级高于 type 自动推导的默认值 |
| `placeholder` | `string` | 输入框占位文本（text/longtext） |
| `maxLength` | `number` | 文本最大长度（longtext） |
| `icon` | `string` | Lucide 图标名（如 `BookOpen`），在 tabs trigger 或卡片背景显示 |
| `noLabel` | `boolean` | 不显示 label |
| `display` | `string` | 选项排列方式：`default` / `flex` / `grid` / `between`, 会传给FormItem作为属性 |
| `className` | `string` | 附加到字段外层的 Tailwind 类名， 会传给FormItem作为属性，FormItem内部会传给放控件的子元素容器 |

### `single` / `multi` 专属属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `options` | `array` 或 `string` | 选项列表，可以是内联数组或引用名（见下文选项系统） |
| `max` | `number` | 最大可选项数（仅 multi） |
| `variant` | `string` | 控件变体，如 `"box"` |

### `list` 专属属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `subFields` | `array` | 子字段定义，每项包含 `placeholder` 和 `width` |

```yaml
notes:
  type: list
  label: 写作注意事项
  subFields:
    - { placeholder: 标签, width: w-1/3 }
    - { placeholder: 内容, width: flex-1 }
```

### `tagselect` 专属属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `entity` | `string` | **必填**。关联的实体名，选项从该实体的 store 动态获取 |
| `optionValue` | `string` | 选项对象中用作 value 的 key，默认 `"id"` |
| `optionLabel` | `string` | 选项对象中用作 label 的 key，默认 `"name"` |

### `defaultValue` 使用场景

当字段的期望默认值不是按 type 自动推导的值时使用：

```yaml
# text 类型默认是 undefined，这里显式设为空字符串
name:
  type: text
  label: 角色名称
  defaultValue: ""

# list 类型默认是 []，这里预填一些提示项
notes:
  type: list
  label: 写作注意事项
  defaultValue:
    - "破局方式;"
    - "关键行为模式;"
```
---

## 选项系统

### 方式一：内联定义

```yaml
pace:
  type: single
  label: 节奏
  options:
    - { value: 快 }
    - { value: 中 }
    - { value: 慢 }
```

### 方式二：引用 shared-options.yml

`shared-options.yml` 存放跨实体复用的选项集，顶层 key 即引用名：

```yaml
# novel.yml 中
genre:
  type: multi
  label: 题材
  options: genre   # 引用 shared-options.yml 中的 genre

```


### 选项对象属性

```yaml
- value: "显示值"        # 必填
  label: "显示标签"       # 可选，默认显示 value
  icon: LucideIcon名     # 可选，Lucide 图标名称
  color: 语义色           # 可选，取 @/lib/colors的ColorName
  description: "说明文案" # 可选，hover 提示或 AI 指令生成时使用
```

---

## 布局定义（`sections`）

sections 是一个嵌套数组，支持三种节点类型：

### `card` — 卡片容器

```yaml
- type: card
  title: 基本信息          # 卡片标题
  icon: BookOpen          # 标题旁图标（Lucide 名）
  class: grid grid-cols-2 gap-4  # 卡片内容区 Tailwind 类名
  titleKey: name          # 从 config 取值做动态标题
  titleEditable: true     # 标题是否可编辑（需配合 titleKey）
  fields: [field1, field2] # 引用的字段 key 列表
```

### `tabs` — 标签页容器

```yaml
- type: tabs
  title: 作品设定          # tabs 标题
  children:
    - key: preset         # 单字段 tab
      label: 预设文风      # tab 显示名
      fields: [enablePreset] # 在tab中要展示的内容
    - key: mainTone       # tab-group（多字段 tab）
      label: 基调
      type: tab-group
      class: space-y-2    # tab-group 内容区 Tailwind 类名
      fields: [primaryTone, secondaryTones]
```

`children` 中每项有两种形态：
- **单字段**：省略 `type`，`fields` 数组通常只有一项，取第一个字段的控件渲染
- **多字段**：`type: tab-group`，`fields` 数组可含多项，按字段逐个渲染

### `grid` — 网格容器

```yaml
- type: grid
  cols: 3              # 列数
  colspan: 2           # 当前 grid 在父级中跨越的列数，默认 1
  sections:            # 子 sections（可嵌套任意类型）
    - type: card
      fields: [...]
```

### 布局可以任意深度嵌套

```yaml
sections:
  - type: grid
    cols: 3
    sections:
      - type: grid
        colspan: 2
        cols: 1
        sections:
          - type: card
            fields: [name, age]
          - type: tabs
            children: [...]
      - type: card
        fields: [narrativeFunction]
```

---

## 完整示例

以 `character.yml` 为例：

```yaml
entity: Character

fields:
  name:
    type: text
    label: 角色名称
    placeholder: 角色名称
    defaultValue: ""
  gender:
    type: single
    label: 性别
    options: gender       # 引用 shared-options.yml
    display: flex
  role:
    type: single
    label: 角色类型
    options: role         # 引用 shared-options.yml
    display: flex
  narrativeFunction:
    type: multi
    label: 叙事功能原型
    max: 3
    options: narrative-function
    display: grid
    noLabel: true
    variant: box
  notes:
    type: list
    label: 写作注意事项
    defaultValue:
      - "破局方式;"
      - "关键行为模式;"
    subFields:
      - { placeholder: 标签, width: w-1/3 }
      - { placeholder: 内容, width: flex-1 }

sections:
  - type: grid
    cols: 3
    sections:
      - type: grid
        colspan: 2
        cols: 1
        sections:
          - type: card
            title: 角色名称
            icon: UserRound
            titleKey: name
            titleEditable: true
            class: grid grid-cols-2 gap-3 parent
            fields: [gender, role, age, identity, item, coreConflict, emotionExpression]
          - type: tabs
            title: 能力与关系
            children:
              - key: abilities
                label: 能力
                fields: [abilities]
              - key: notes
                label: 写作注意事项
                fields: [notes]
      - type: grid
        colspan: 1
        cols: 1
        sections:
          - type: card
            title: 叙事功能原型（沃格勒体系）
            icon: Shield
            fields: [narrativeFunction]
```

---

## 构建与验证

```bash
# 修改任何 YAML 后运行
node scripts/generate-configs.cjs
```

生成的 `src/lib/configs/generated.ts` 包含：
- `ConfigEntity` 枚举
- 每个实体的 TypeScript 配置类型（如 `NovelConfig`）
- `EntityConfigMap` 类型映射表
- `CONFIGS` 运行时对象（fields + sections）
- `ALL_OPTIONS` 选项集合（供 `findOptionInConfig` 查找）


