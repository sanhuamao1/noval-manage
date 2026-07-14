# 配置驱动表单流程：YAML → 表单 → 视图

以 `novel` 实体为例，完整追踪从 YAML 配置文件到页面渲染的数据流与代码调用链。

---

## 一、YAML 源文件

`configs/novel.yml`

```yaml
entity: Novel

fields:
  title:
    type: text
    label: 作品名称
    placeholder: 作品名称
  status:
    type: single
    label: 状态
    options: novel-status        # 引用 shared-options.yml 中的选项
    display: flex
  genre:
    type: multi
    label: 题材
    max: 2
    options: genre
    variant: box
  enablePreset:
    type: toggle
    label: 启用预设文风
  presetStyle:
    type: single
    label: 预设文风
    options: preset-style         # 引用 preset-styles.yml
  primaryTone:
    type: single
    label: 主基调
    options: tone
  sections:
    - type: card
      title: 基本信息
      icon: BookOpen
      fields: [title, status, description]
    - type: tabs
      title: 作品设定
      children:
        - key: enablePreset
          type: tab-group
          fields: [enablePreset, presetStyle]
        - key: primaryTone
          fields: [primaryTone]
```

**关键字段说明：**

| 属性 | 含义 |
|------|------|
| `type` | 控件类型：`text`/`single`/`multi`/`toggle`/`list`/`longtext`/`tagselect` |
| `options` | 下拉/单选/多选选项，可引用共享选项文件或自定数组 |
| `sections` | 页面布局树，支持 `card`（卡片）、`tabs`（标签页）、`grid`（网格）三种嵌套 |
| `display` | 布局方式：`default`/`flex`/`between`/`grid` |
| `variant` | 控件变体，如 `box` 将 radio 渲染为方块样式 |

---

## 二、构建时：YAML → TypeScript

**入口：** `scripts/generate-configs.cjs`

```
configs/*.yml
  ↓ js-yaml.load()
原始配置对象
  ↓ resolveOptions() 合并 shared-options / preset-styles
带完整 options 数组的配置
  ↓ buildField() 提取字段属性
ConfigFieldDef[]
  ↓ buildSections() 递归转换 sections 树
ConfigSection[]
  ↓ JSON.stringify + 模板拼接
src/lib/configs/generated.ts
```

**生成的 `generated.ts` 包含：**

1. **类型接口** — 从 field type 推导 TypeScript 类型：
   ```ts
   export interface NovelConfig {
     title?: string | undefined;
     status?: string | undefined;
     genre?: string[];
     enablePreset?: boolean;
     presetStyle?: string | undefined;
     // ...
   }
   ```

2. **CONFIGS 常量** — 完整的 sections + fields 对象树：
   ```ts
   export const CONFIGS: Record<ConfigEntity, EntityConfig> = {
     "novel": {
       "entity": "Novel",
       "sections": [...],
       "fields": [...]
     }
   }
   ```

3. **ConfigEntity 枚举** — `NOVEL = "novel"`

4. **FIELD_MAP** — `key → ConfigFieldDef` 的快速查找表

---

## 三、运行时：页面加载

**文件：** `src/app/novel/[id]/page.tsx`

```tsx
// 1. 从注册表获取完整配置（惰性构建 + 缓存）
const { fields, sections, defaults, fieldMap } = getEntry(ConfigEntity.NOVEL);
//    ↑ registry.get("novel")
//    ↑ 内部调用 buildEntry → buildDefaultValues(fields)

// 2. 用 store 中的实际数据填充编辑器配置
useEffect(() => {
  if (novel) {
    setEditorConfig(fillConfig(novel, defaults, fields));
    //    ↑ { ...defaults } 然后逐字段覆盖 novel 的值
  }
}, [novel]);
```

**`getEntry()` 内部流程：**

```
getEntry("novel")
  → registry.has("novel") ? 返回缓存 : 构建
  → buildEntry("novel")
    → CONFIGS["novel"].fields  → fields[]
    → CONFIGS["novel"].sections → sections[]
    → buildDefaultValues(fields) → defaults 对象
    → fields.reduce 构建 fieldMap
    → { fields, sections, defaults, fieldMap }
```

**`buildDefaultValues()` 映射表：**

| field.type | 默认值 |
|------------|--------|
| `toggle` | `false` |
| `multi` / `list` / `tagselect` | `[]` |
| `single` / `text` / `longtext` | `undefined` |
| 字段有 `defaultValue` | 使用指定值 |

---

## 四、编辑抽屉：渲染表单

```tsx
<SlidingDrawer open={drawer.open} onClose={drawer.close} onUpdate={handleSave}>
  {renderSections(sections, editorConfig, (c) => setEditorConfig(c))}
</SlidingDrawer>
```

**`renderSections()` 递归渲染逻辑：**

```
renderSections(sections, config, onChange)
  │
  ├─ Section type="card"
  │   → <Card>
  │     → CardHeader(icon=resolveIcon(section.icon), title=section.title)
  │     → CardContent
  │       → 遍历 children（排除 tab-group）
  │         → renderField(field, config, onChange)
  │
  ├─ Section type="tabs"
  │   → <Tabs>
  │     → TabsList
  │       → 遍历 children
  │         ├─ type="tab-group"
  │         │   → TabsTrigger(label, icon)
  │         │   → TabsContent
  │         │     → 每个子字段 → renderField()
  │         └─ 普通字段
  │           → TabsTrigger → TabsContent → renderField()
  │
  └─ Section type="grid"
      → <div style="grid-template-columns: repeat(cols, 1fr)">
        → 遍历 sections
          → colspan 跨列
          → 递归 renderSections()
```

**`renderField()` 控件分发：**

```
renderField(field, config, onChange)
  │
  ├─ type="toggle"
  │   → <Toggle value={config[field.key]} onChange={set(key, value)} />
  │
  ├─ type="single"
  │   → options.map(toRadioOption) → 解析 icon
  │   → <RadioGroup options={radioOptions} value={config[key]} onChange={set} />
  │
  ├─ type="multi"
  │   → <RadioGroup type="multi" max={field.max} ... />
  │   → 全选按钮（无 max 限制时）
  │
  ├─ type="text"
  │   → <Input value={config[key]} onChange={set} placeholder={field.placeholder} />
  │
  ├─ type="longtext"
  │   → <LongTextField maxLength={field.maxLength} ... />
  │
  ├─ type="list"
  │   → <ListField subFields={field.subFields} ... />
  │
  └─ type="tagselect"
      → <TagSelect entity={field.entity} novelId={id} ... />
```

**每次字段变更：**

```
onChange(newConfig)
  → setEditorConfig({ ...config, [field.key]: value })
  → React state 更新
  → 整个表单重新渲染（受控组件）
```

**保存：**

```
handleSave()
  → PATCH /api/novels/{id} (editorConfig)
  → useAppStore.mutate(id, "novel", ...)
  → drawer.close()
```

---

## 五、预览视图：只读展示

```tsx
<NovelOverviewPreview fieldMap={fieldMap} />
```

**渲染逻辑：**

```
NovelOverviewPreview(fieldMap)
  │
  ├─ 读取 useAppStore().novel
  │
  ├─ renderOptions(fieldMap['status']?.options, novel.status)
  │   → options.find(o => o.value === status)
  │   → <Tag color="primary" icon={Zap}>连载中</Tag>
  │
  ├─ renderOptions(fieldMap['genre']?.options, novel.genre)
  │   → 遍历数组 → 多个 <Tag>
  │
  └─ 硬编码展示封面区、字数、创作日志等
```

---

## 六、数据流总览

```
┌──────────────┐    构建时     ┌───────────────────┐
│ configs/     │ ───────────► │ src/lib/configs/   │
│ *.yml        │   js-yaml    │   generated.ts     │
│              │   +脚本      │   (CONFIGS + 类型)  │
└──────────────┘              └─────────┬─────────┘
                                       │ 运行时
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
           ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
           │ getEntry()   │    │ fillConfig() │    │ renderSections│
           │ → 取 CONFIGS │    │ → defaults   │    │ → 递归渲染    │
           │ → buildDef.. │    │   + 覆盖数据 │    │   card/tabs/  │
           │ → 缓存 registry│  │ → editorConfig│   │   grid        │
           └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
                  │                   │                    │
                  ▼                   ▼                    ▼
           ┌─────────────────────────────────────────────────┐
           │           page.tsx: NovelOverview               │
           │                                                 │
           │  ┌─────────────┐       ┌─────────────────────┐ │
           │  │  PageLayout  │◄───── │ SlidingDrawer       │ │
           │  │  (主视图)     │       │ (编辑面板)           │ │
           │  │             │       │                     │ │
           │  │ NovelOverview│       │ renderSections      │ │
           │  │ Preview     │       │ onChange → setState │ │
           │  │ (只读展示)   │       │ handleSave → PATCH  │ │
           │  └─────────────┘       └─────────────────────┘ │
           └─────────────────────────────────────────────────┘
                  │                              │
                  ▼                              ▼
           ┌─────────────┐              ┌─────────────┐
           │ useAppStore  │              │ API Server  │
           │ (全局状态)    │◄───────────►│ (/api/novels)│
           └─────────────┘              └─────────────┘
```

---

## 七、关键文件清单

| 文件 | 职责 |
|------|------|
| `configs/novel.yml` | 字段定义 + 布局结构（YAML 源） |
| `scripts/generate-configs.cjs` | 构建时脚本：YAML → TS |
| `src/lib/configs/generated.ts` | 生成的配置常量 + 类型 |
| `src/lib/configs/config-utils.ts` | `buildDefaultValues` / `fillConfig` |
| `src/lib/configs/config-registry.ts` | `getEntry` 注册表 + `buildConfigInstructions` |
| `src/lib/configs/render-utils.tsx` | `renderField` / `renderSections` / `resolveIcon` |
| `src/app/novel/[id]/page.tsx` | 页面入口：组装配置 + 渲染 |
| `src/components/novel/NovelOverviewPreview.tsx` | 预览组件：只读展示 |
