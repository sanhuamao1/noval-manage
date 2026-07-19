# YML 体系

项目中 YML 文件分三种类型，用途和位置各不相同。

## 三类 YML 总览

| 类型 | 位置 | 用途 | 示例 |
|------|------|------|------|
| **Config YML** | `configs/*.yml` | 实体字段/布局定义，构建时编译为 TS 类型 + 运行时数据 | `character.yml` |
| **Data YML（实体）** | `data/novels/<id>/<entity>/*.yml` | 实体实例数据，一个文件对应一条记录 | `characters/mrp4bkeobh6vdv.yml` |
| **Data YML（独立）** | `data/novels/<id>/relations.yml` 等 | 脱离实体体系的独立数据文件 | `relations.yml` |

---

## Config YML (`configs/*.yml`)

实体字段定义和页面布局的**唯一数据源**，由 `scripts/generate-configs.cjs` 编译为三个文件：
- `src/types/entity.ts` — `ConfigEntity` 枚举 + `EntityConfig` 接口
- `src/types/entityConfig.ts` — 各实体的配置类型（如 `NovelConfig`、`CharacterConfig`）
- `src/lib/configs/generated.ts` — `CONFIGS` 运行时数据常量

```
configs/
├── shared-options.yml    # 跨实体共享的选项
├── preset-styles.yml     # 独立选项集合
├── novel.yml / character.yml / location.yml / organization.yml / outline.yml
├── polish-rule.yml / polish-sample.yml
└── frameworks/           # 框架文档（.md），非 YML
```

### 新增实体流程

1. 在 `configs/` 下新建 `<name>.yml`
2. 在 `scripts/generate-configs.cjs` 的 `entities` 数组中添加文件名
3. 运行 `node scripts/generate-configs.cjs`

> 枚举 Key 自动转 SCREAMING_SNAKE，类型名自动转 PascalCase。

### YML 结构

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

### 字段类型

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

### 常用字段属性

| 属性 | 说明 |
|------|------|
| `label` | **必填**。显示标签 |
| `defaultValue` | 自定义默认值，优先级高于类型推导 |
| `placeholder` | 输入框占位文本（text/longtext） |
| `maxLength` | 文本最大长度（longtext） |
| `icon` | Lucide 图标名 |
| `options` | 选项列表（内联数组）或引用名（字符串，指向 shared-options） |
| `max` | 最大可选数（multi） |
| `subFields` | 子字段定义（list），每个条目支持 `placeholder`、`width`、`type`、`optionsFrom`、`entity` |
| `entity` | tagselect 必填；list subField 可选（从 store 取 name 字段） |

### 布局类型

| 类型 | 说明 |
|------|------|
| `card` | 卡片容器，`fields` 引用字段 key，支持 `title`、`titleKey`、`titleEditable` |
| `tabs` | 标签页容器，`children` 下每项支持单字段 tab 或 `type: tab-group` 多字段组 |
| `grid` | 网格容器，`sections` 嵌套子布局，支持 `cols`、`colspan` |

布局可任意深度嵌套。

### 构建命令

```bash
node scripts/generate-configs.cjs
```

### 参考文件

- 简单示例：[configs/novel.yml](../../../configs/novel.yml)
- 复杂嵌套：[configs/character.yml](../../../configs/character.yml)
- 共享选项：[configs/shared-options.yml](../../../configs/shared-options.yml)

---

## Data YML — 实体数据 (`data/novels/<id>/`)

每个小说目录下按实体分子目录存储数据，一个 YML 文件对应一条实体实例记录。

### 目录结构

```
data/novels/<novelId>/
├── novel.yml              # 小说本身的数据（id、title、description、genre 等）
├── relations.yml          # 独立数据（见下节）
├── chapters/              # 章节数据
│   └── <chapterId>.yml
├── characters/            # 人物数据
│   └── <characterId>.yml
├── locations/             # 地点数据
│   └── <locationId>.yml
├── organizations/         # 组织数据
│   └── <orgId>.yml
├── outlines/              # 大纲数据
│   └── <outlineId>.yml
└── foreshadowings/        # 伏笔数据
    └── <fsId>.yml
```

### 实体文件内容

每个实体 YML 文件包含对应 Config YML 定义的所有字段值，外加系统字段（`id`、`novelId`、`createdAt`、`updatedAt`）。字段名与 Config YML 中的 `fields` key 一一对应。

示例 `characters/mrp4bkeobh6vdv.yml`：

```yaml
novelId: mrp2zihp9397xf
name: 徐竹樾
gender: 男
role: 主角
age: '20'
identity: 椿城大学医学院大四学生
abilities:
  - 记忆力强
  - 观察力强
growthArcs:
  - 偏执;为追查线索会主动涉险;学会接受不确定性
id: mrp4bkeobh6vdv
createdAt: '2026-07-17T15:54:05.712Z'
updatedAt: '2026-07-19T07:52:20.832Z'
```

---

## Data YML — 独立数据

脱离实体体系的独立 YML 文件，不与任何 Config YML 绑定。

### relations.yml

**位置**：`data/novels/<novelId>/relations.yml`

**用途**：存储角色关系图数据（人物节点连线 + 画布位置），一个 novel 仅一份。

**结构**：

```yaml
relations:
  links:                     # 连线列表
    - source: <characterId>  # 源角色 ID
      target: <characterId>  # 目标角色 ID
      description: 关系描述   # 如 "童年羁绊。但觉得自己配不上他"
  positions:                 # 画布坐标（key 为角色 ID）
    <characterId>:
      x: <number>
      'y': <number>          # y 需加引号（YML 保留字）
```

**特点**：
- **不隶属任何实体**：它描述的是人物之间的关系，而非人物本身的属性
- **一个 novel 仅一份**：与 `characters/*.yml`（每个角色一份）不同
- **自身有独立 API**：`/api/relations`（GET 读取）+ `/api/relations/link`（POST 更新连线）

**API 操作**：

```ts
// 读取关系数据
const data = await api({ url: `/api/relations?novelId=${novelId}` });

// 更新连线
await api({
  url: "/api/relations/link",
  method: "POST",
  data: { novelId, links: [...], positions: {...} },
});
```

### polish-rules / polish-samples

**位置**：`data/polish-rules/`、`data/polish-samples/`

**用途**：全局润色规则和风格样本，不隶属于任何 novel（跨小说共享）。

结构与对应 Config YML（`configs/polish-rule.yml`、`configs/polish-sample.yml`）定义一致，API 路径分别为 `/api/polish/rules` 和 `/api/polish/samples`，CRUD 配置中 `needsNovelId: false`。

### 后续扩展

如需新增其他独立数据（如全局写作模板、通用设定库），遵循同样模式：
- 放在 `data/` 下独立目录（非 `<novelId>/<entity>/` 内）
- 不与 Config YML 实体体系绑定
- 如需 API，在 `src/app/api/` 下创建对应路由