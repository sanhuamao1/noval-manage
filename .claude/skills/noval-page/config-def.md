# Config YML 速查

Config YML 的详细说明已迁移至 [yml-guide.md](yml-guide.md)（Config YML 章节）。本文档仅保留快速参考。

## 新增实体三步

1. 在 `configs/` 下新建 `<name>.yml`
2. 在 `scripts/generate-configs.cjs` 的 `entities` 数组中添加文件名
3. 运行 `node scripts/generate-configs.cjs`

## 字段类型速查

| 类型 | TS 默认值 | 说明 |
|------|-----------|------|
| `text` | `undefined` | 单行文本 |
| `longtext` | `undefined` | 多行文本（设 `maxLength`） |
| `single` | `undefined` | 单选 |
| `multi` | `[]` | 多选（设 `max`） |
| `toggle` | `false` | 开关 |
| `list` | `[]` | 动态列表（`subFields`） |
| `tagselect` | `[]` | 实体标签选择（`entity`） |
| `tags` | `[]` | 自定义标签 |

## 布局类型速查

| 类型 | 说明 |
|------|------|
| `card` | 卡片容器，`fields` 引用字段 key |
| `tabs` | 标签页，支持单字段 tab 或 `tab-group` |
| `grid` | 网格，`sections` 嵌套子布局 |

> 完整的字段属性表、选项系统、list subFields 说明见 [yml-guide.md](yml-guide.md)。

## 参考文件

- [yml-guide.md](yml-guide.md) — 完整 Config YML 规范 + Data YML 体系
- 简单示例：[configs/novel.yml](../../../configs/novel.yml)
- 复杂示例：[configs/character.yml](../../../configs/character.yml)