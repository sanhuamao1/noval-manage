# 如何编写页面

## 页面注册

1. 在 `src/app/novel/[id]/` 下创建路由目录和 `page.tsx`（如 `characters/page.tsx`）
2. 在 `src/app/novel/[id]/layout.tsx` 的 `navItems` 数组中添加导航项：
```tsx
const navItems = [
  // ...已有项
  { href: "/characters", label: "人物", icon: Users },
]
```

## 实体 CRUD 注册（新增实体只需加一行）

`src/lib/configs/crud-config.ts` 中维护 `ConfigEntity → { storeKey, deleteLabel, apiPath?, needsNovelId? }` 映射：

```ts
export const ENTITY_CRUD_CONFIG: Partial<Record<ConfigEntity, EntityCrudMeta>> = {
  [ConfigEntity.CHARACTER]:  { storeKey: "characters",    deleteLabel: "人物" },

  // API 路径与 storeKey 不一致时用 apiPath，不使用 novelId 时设 needsNovelId: false
  [ConfigEntity.POLISH_RULE]:  { storeKey: "polishRules",  deleteLabel: "润色规则", apiPath: "/api/polish/rules",  needsNovelId: false },
  [ConfigEntity.POLISH_SAMPLE]:{ storeKey: "polishSamples",deleteLabel: "风格样本", apiPath: "/api/polish/samples",needsNovelId: false },

  // 新增实体只需加一行
};
```

`EntityCrudMeta` 字段说明：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `storeKey` | `RefreshKey` | **必填** | store 中的 key + mutate 刷新 key |
| `deleteLabel` | `string` | **必填** | 删除确认提示中显示的实体名 |
| `apiPath` | `string?` | `/api/${storeKey}` | 自定义 API 路径（如 storeKey 与路由不一致） |
| `needsNovelId` | `boolean?` | `true` | 是否在 POST/PUT/DELETE 中注入 `novelId`（全局资源设 `false`） |

## 标准 CRUD 页面（推荐写法）

使用 `useEntityCrud` hook 接管整个 drawer 的创建/编辑/删除逻辑，编辑器通过 `EditorForm` 组件内部自管状态，父组件只通过 ref 读写数据。

**关键步骤：**

1. 调用 `useEntityCrud(ConfigEntity.XXX)` 获取 `items / mode / openEdit / openAdd / createItem / updateItem / deleteItem / close / editorRef / ...`
2. `PageLayout` 的 `handler` 绑 `<AddButton onClick={openAdd} />`
3. `SlidingDrawer` 的 `onCreate` 绑 `createItem`，`onUpdate` 绑 `updateItem`
4. 抽屉内放 `<EditorForm ref={editorRef} key={currentEntity} sections={sections} defaults={defaults} />`
5. 卡片用 `CardList` + `SimpleCard`，`onClick` 绑 `openEdit(item)`，`onDelete` 绑 `deleteItem(id)`
6. 卡片内容用 `renderOptions()` 展示选项类字段，`ConfigBadges` 展示文本类字段

> 完整示例参考：`src/app/novel/[id]/characters/page.tsx`、`src/app/novel/[id]/locations/page.tsx`、`src/app/novel/[id]/organizations/page.tsx`

### useEntityCrud 返回值

| 字段 | 类型 | 说明 |
|------|------|------|
| `items` | `any[]` | 实体列表数据（来自 store） |
| `mode` | `"create" \| "edit" \| null` | drawer 当前模式 |
| `editingId` | `string \| null` | 正在编辑的条目 ID |
| `fieldsMap` | `Record<string, ConfigFieldDef>` | 字段定义映射（卡片渲染用） |
| `sections` | `ConfigSection[]` | section 分组定义（EditorForm 用） |
| `defaults` | `Record<string, any>` | 默认值对象（EditorForm 初始化用） |
| `currentEntity` | `ConfigEntity` | 当前实体类型（EditorForm key 用） |
| `editorRef` | `RefObject<EditorFormHandle>` | 编辑器 ref，传给 `<EditorForm>` |
| `openEdit(item)` | `Function` | 打开编辑已有条目 |
| `openAdd()` | `Function` | 打开新建表单 |
| `createItem()` | `Function` | 提交创建（POST） |
| `updateItem()` | `Function` | 提交更新（PUT） |
| `deleteItem(id)` | `Function` | 删除条目 |
| `close()` | `Function` | 关闭 drawer |
| `switchEntity(next)` | `Function` | 切换到另一实体类型（多实体页面用） |

### EditorForm 组件

编辑器内部自管状态，通过 `useImperativeHandle` 暴露操作接口：

```ts
interface EditorFormHandle {
  getData(): Record<string, any>;   // 取表单数据
  setData(data): void;              // 写入已有数据（编辑时填充）
  reset(): void;                    // 重置为默认值（新建时调用）
}
```

Props：

| Prop | 类型 | 说明 |
|------|------|------|
| `sections` | `ConfigSection[]` | 表单分区定义 |
| `defaults` | `Record<string, any>` | 默认值对象 |
| `key` | `string` | **必须传** `String(currentEntity)`，保证切换实体时表单重挂载 |

### 多实体页面（运行时切换 entity）

一个页面需对多种实体 CRUD 时，用 `switchEntity` 切换。切换时自动关闭 drawer、重置表单、切换数据源。

**关键步骤：**

1. **定义 tabs 配置**：`{ key: ConfigEntity, label: string }[]`
2. **用 `SimpleTabs` 驱动切换**：`onChange` 调用 `switchEntity(key)`
3. **根据 `currentEntity` 条件渲染不同卡片内容**：

> 完整示例参考 [`src/app/novel/[id]/polish/page.tsx`](../../../src/app/novel/[id]/polish/page.tsx)，单实体标准模板参考上方"[标准 CRUD 页面](#标准-crud-页面推荐写法)"。
```

### 数据流

```
useEntityCrud(entity)
    ├── currentEntity (state, 可 switchEntity 切换)
    │   ├── getEntry(currentEntity) → sections, defaults, fields, fieldsMap
    │   └── getCrudMeta(currentEntity) → storeKey, deleteLabel
    │
    ├── useAppStore(storeKey) → items (响应式列表)
    │
    ├── editorRef → EditorForm (表单自管状态)
    │   ├── openEdit → ref.current.setData(item)
    │   ├── openAdd → ref.current.reset()
    │   ├── createItem → ref.current.getData() → api POST → mutate
    │   └── updateItem → ref.current.getData() → api PUT → mutate
    │
    └── mode / editingId (drawer 开关状态)
```

## 单数据页面（如 Novel 概览）

无需 CRUD 列表，只需展示和编辑单个数据时：

```tsx
// 1 用 useAppStore 获取单条数据
const novel = useAppStore((s) => s.novel);

// 2 用 getEntry + fillConfig 填充表单
const { fields, sections, defaults } = getEntry(ConfigEntity.NOVEL);
const [editorConfig, setEditorConfig] = useState(defaults);

useEffect(() => {
  if (novel) setEditorConfig(fillConfig(novel, defaults, fields));
}, [novel]);

// 3 用 SlidingDrawer + renderSections 渲染编辑表单
<SlidingDrawer open={drawer.open} onClose={drawer.close} onUpdate={handleSave}>
  {renderSections(sections, editorConfig, (c) => setEditorConfig(c))}
</SlidingDrawer>

// 4 用 mutate 提交
const mutate = useAppStore((s) => s.mutate);
await mutate(id, "novel", () =>
  api({ url: `/api/novels/${id}`, method: "PATCH", data: editorConfig }),
);
```

## 卡片内信息渲染

```tsx
// 选项类信息（如角色、状态）用 renderOptions
renderOptions(fieldsMap["status"]?.options, item.status)

// 普通文本信息用 ConfigBadges
<ConfigBadges
  config={item}
  items={[
    ["性别", "gender"],
    ["身份", "identity"],
  ]}
/>
```
