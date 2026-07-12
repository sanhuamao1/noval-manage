# YAML 配置定义 (`configs/*.yml`)

`configs/` 是配置系统的**唯一数据源**，由 `scripts/generate-configs.cjs` 编译为 `src/lib/configs/generated.ts`（TypeScript 类型 + 运行时数据）。

```
configs/
├── shared-options.yml    # 跨实体共享的选项
├── preset-styles.yml     # 独立选项集合
├── novel.yml / character.yml / outline.yml / polish-rule.yml / polish-sample.yml
```

## 新增实体流程

1. 在 `configs/` 下新建 `<name>.yml`
2. 在 `scripts/generate-configs.cjs` 的 `entities` 数组中添加文件名
3. 运行 `node scripts/generate-configs.cjs` 重新生成

> 枚举 Key 自动转 SCREAMING_SNAKE（`polish-rule` → `POLISH_RULE`），类型名自动转 PascalCase（`polish-rule` → `PolishRuleConfig`）。

## YAML 结构

```yaml
entity: Character          # 实体显示名（供 AI prompt 等处使用）

fields:                    # 字段定义字典
  name:
    type: text
    label: 角色名称
    placeholder: 角色名称
    defaultValue: ""

sections:                  # 布局定义，引用 fields 中的 key
  - type: card
    fields: [name, ...]
```

## 字段类型

| 类型 | TS 类型 | 默认值 | 说明 |
|------|---------|--------|------|
| `text` | `string \| undefined` | `undefined` | 单行文本 |
| `longtext` | `string \| undefined` | `undefined` | 多行文本（带字数统计，需 `maxLength`） |
| `single` | `string \| undefined` | `undefined` | 单选 |
| `multi` | `string[]` | `[]` | 多选（可设 `max` 上限） |
| `toggle` | `boolean` | `false` | 开关 |
| `list` | `string[]` | `[]` | 动态列表，子字段用 `;` 拼接 |
| `tagselect` | `string[]` | `[]` | 从关联实体选择（需 `entity` 字段） |

## 字段属性

| 属性 | 适用类型 | 说明 |
|------|---------|------|
| `label` | 全部 | **必填**。显示标签 |
| `defaultValue` | 全部 | 自定义默认值，优先级高于类型推导 |
| `placeholder` | text/longtext | 输入框占位文本 |
| `maxLength` | longtext | 文本最大长度 |
| `icon` | 全部 | Lucide 图标名，在 tabs trigger 等处显示 |
| `noLabel` | 全部 | 不显示 label |
| `display` | single/multi | 排列方式：`default` / `flex` / `grid` / `between` |
| `className` | 全部 | 控件外层 Tailwind 类名 |
| `options` | single/multi | 选项列表（内联数组）或引用名（字符串） |
| `max` | multi | 最大可选数 |
| `variant` | single/multi | 控件变体，如 `"box"` |
| `subFields` | list | 子字段定义：`[{ placeholder, width }]` |
| `entity` | tagselect | **必填**。关联实体名，选项从 store 动态获取 |

### defaultValue 使用场景

```yaml
# text 默认是 undefined，改为空字符串
name:
  type: text
  label: 角色名称
  defaultValue: ""

# list 默认是 []，预填提示项
notes:
  type: list
  label: 写作注意事项
  defaultValue:
    - "破局方式;"
    - "关键行为模式;"
```

## 选项系统

**内联定义** — 选项直接写在 `options:` 下：

```yaml
pace:
  type: single
  options:
    - { value: 快 }
    - { value: 中 }
    - { value: 慢 }
```

**共享引用** — `options: genre` 引用 `shared-options.yml` 中的 `genre:` 列表：

```yaml
genre:
  type: multi
  options: genre        # 字符串引用名
```

选项对象支持：`value`（必填）、`label`、`icon`（Lucide 名）、`color`、`description`。

## 布局类型

### card — 卡片容器

```yaml
- type: card
  title: 基本信息
  icon: BookOpen
  class: grid grid-cols-2 gap-4    # 内容区 Tailwind
  titleKey: name                   # 从 config 取动态标题
  titleEditable: true              # 标题可编辑（需 titleKey）
  fields: [gender, role]           # 引用字段 key
```

### tabs — 标签页容器

```yaml
- type: tabs
  title: 能力与关系
  children:
    - key: abilities               # 单字段 tab
      label: 能力
      fields: [abilities]
    - key: mainTone       # 多字段 tab 组
      label: 基调
      type: tab-group
      class: space-y-2    # tab-group 内容区 Tailwind 类名
      fields: [primaryTone, secondaryTones]
```

### grid — 网格容器

```yaml
- type: grid
  cols: 3
  colspan: 2                      # 在父级中跨越的列数
  sections:
    - type: card
      fields: [...]
```

布局可**任意深度嵌套**，grid 内可嵌套 card、tabs、grid。

## 构建命令

```bash
node scripts/generate-configs.cjs
```

生成物：`ConfigEntity` 枚举、TypeScript 类型接口（如 `CharacterConfig`）、`EntityConfigMap`、`CONFIGS` 运行时对象、`ALL_OPTIONS` 选项集合。

## 何时询问用户

- **现有字段类型不够用**（如需要特殊输入方式）时，说明类型系统边界，让用户决定调整设计还是接受替代方案
- **布局方案不明确**（如不确定用 tabs 还是 grid），列出利弊让用户选
- **不确定字段归属**或**是否需要拆分实体**，先问用户再动手

## 参考文件

- 简单示例：[configs/novel.yml](../../../configs/novel.yml)
- 复杂嵌套：[configs/character.yml](../../../configs/character.yml)（grid + tabs + tab-group 三层嵌套）
- 共享选项：[configs/shared-options.yml](../../../configs/shared-options.yml)