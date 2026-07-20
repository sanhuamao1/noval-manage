# YML 配置指南

`configs/*.yml` 是实体字段定义和页面布局的**唯一数据源**，由 `scripts/generate-configs.cjs` 编译为 `src/lib/configs/generated.ts`（`CONFIGS` 运行时对象）。

## 目录

```
configs/
├── shared-options.yml    # 跨实体共享的选项
├── preset-styles.yml     # 独立选项集合
├── novel.yml / character.yml / location.yml / organization.yml / outline.yml
├── polish-rule.yml / polish-sample.yml
└── frameworks/           # 框架文档（.md），非 YML
```

## 新增实体

1. 在 `configs/` 下新建 `<name>.yml`
2. 在 `scripts/generate-configs.cjs` 的 `entities` 数组中添加文件名
3. 运行 `node scripts/generate-configs.cjs`

> 枚举 Key 自动转 SCREAMING_SNAKE，类型名自动转 PascalCase。

## YML 结构

```yaml
entity: Character          # 实体显示名

fields:                    # 字段定义字典
  name:
    type: text
    label: 角色名称
    defaultValue: ""

sections:                  # 布局定义，引用 fields 中的 key
  - type: card
    fields: [name, ...]
```

## 字段类型

| 类型 | TS 类型 | 默认值 | 说明 |
|------|---------|--------|------|
| `text` | `string \| undefined` | `undefined` | 单行文本 |
| `longtext` | `string \| undefined` | `undefined` | 多行文本（建议设 `maxLength`） |
| `single` | `string \| undefined` | `undefined` | 单选 |
| `multi` | `string[]` | `[]` | 多选（可设 `max` 上限） |
| `toggle` | `boolean` | `false` | 开关 |
| `list` | `string[]` | `[]` | 动态列表，子字段用 `;` 拼接 |
| `tagselect` | `string[]` | `[]` | 从关联实体选择（需 `entity` 字段） |
| `tags` | `string[]` | `[]` | 自定义标签输入 |

## 常用字段属性

| 属性 | 说明 |
|------|------|
| `label` | **必填**。显示标签 |
| `defaultValue` | 自定义默认值，优先级高于类型推导 |
| `placeholder` | 输入框占位文本（text/longtext） |
| `maxLength` | 文本最大长度（longtext） |
| `max` | 最大可选数（multi） |
| `options` | 选项列表（内联数组）或引用名（字符串，指向 shared-options） |
| `subFields` | 子字段定义（list），每个条目支持 `placeholder`、`width`、`type`、`optionsFrom`、`entity` |
| `entity` | tagselect 必填；list subField 可选（从 store 取 name 字段） |

## 布局类型

| 类型 | 说明 |
|------|------|
| `card` | 卡片容器，`fields` 引用字段 key，支持 `title`、`titleKey`、`titleEditable` |
| `tabs` | 标签页容器，`children` 下每项支持单字段 tab 或 `type: tab-group` 多字段组 |
| `grid` | 网格容器，`sections` 嵌套子布局，支持 `cols`、`colspan` |

布局可任意深度嵌套。

## 构建

```bash
node scripts/generate-configs.cjs
```

## 参考

- 简单示例：[configs/novel.yml](../../../configs/novel.yml)
- 复杂嵌套：[configs/character.yml](../../../configs/character.yml)
- 共享选项：[configs/shared-options.yml](../../../configs/shared-options.yml)
