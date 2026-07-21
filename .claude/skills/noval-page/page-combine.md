# 页面编写

## 四种页面类型

| 类型 | 核心 Hook | 参考页面 |
|------|-----------|----------|
| **CRUD 单实体列表** | `useEntityCrud` | `characters/`、`locations/`、`organizations/` |
| **CRUD 多实体列表** | `useEntityCrud` + `switchEntity` | `polish/` |
| **单数据编辑** | `useAppStore` + `api()` | `novel/[id]/page.tsx` |
| **AI 工作流（梦工厂）** | `useFactory` | [factory-page.md](factory-page.md) |

---

## CRUD 单实体

### 步骤

1. 在 `crud-config.ts` 注册实体映射
2. 使用 `useEntityCrud` + `EditorForm`

### 主要结构

```tsx
export default function MyEntityPage() {
  const {
    items, mode, fieldsMap, sections, editorRef, defaults,
    openEdit, openAdd, createItem, updateItem, deleteItem, close,
  } = useEntityCrud(ConfigEntity.MY_ENTITY)

  return (
    <PageLayout
      title="页面标题"
      handler={<AddButton onClick={openAdd} />}
      drawer={
        <SlidingDrawer open={mode !== null} onClose={close}
          onCreate={mode === "create" ? createItem : undefined}
          onUpdate={mode === "edit" ? updateItem : undefined}>
          <EditorForm ref={editorRef} key={String(ConfigEntity.MY_ENTITY)}
            sections={sections} defaults={defaults} />
        </SlidingDrawer>
      }>
      <CardList emptyText="暂无数据">
        {items.map(item => (
          <SimpleCard key={item.id} title={item.name}
            onClick={() => openEdit(item)}
            onDelete={() => deleteItem(item.id)} />
        ))}
      </CardList>
    </PageLayout>
  )
}
```

## CRUD 多实体（Tab 切换）

### 步骤


1. 在 `crud-config.ts` 注册实体映射
2. 定义 tabs 配置
3. 使用 `useEntityCrud` + `EditorForm` + `switchEntity`切换

### 主要结构
其他结构于 “CRUD 单实体”几乎一致， 而布局遵循下方的header
```tsx
  const { currentEntity, switchEntity, ...rest } = useEntityCrud(ConfigEntity.POLISH_RULE);
<PageLayout
  header={
    <div className="mb-4 flex items-center justify-between">
      <SimpleTabs tabs={TABS} variant="segment" value={currentEntity} onChange={(k) => switchEntity(k as ConfigEntity)}/>
      <AddButton onClick={openAdd} />
    </div>
  }
/>
```

> 完整示例：[src/app/novel/[id]/polish/page.tsx](../../../src/app/novel/[id]/polish/page.tsx)


## 单数据编辑（无列表）

### 步骤

1. 从 store 读取数据
2. 使用`getEntry` + `EditorForm`获取配置渲染表单
2. `fillConfig` 填充表单
3. `api()` + `mutate` 保存

### 主要结构

```tsx
const novel = useNovelStore((s) => s.novel);
const mutate = useNovelStore((s) => s.mutate);
const { fields, sections, defaults } = getEntry(ConfigEntity.NOVEL);
const [editorConfig, setEditorConfig] = useState(defaults);

const editorRef = useRef<EditorFormHandle>(null);
const openEdit = useCallback(() => {
  setOpen(true);
  queueMicrotask(() => {
    if (novel) {
      editorRef.current?.setData(fillConfig(novel, defaults, fields));
    }
  });
}, [novel, defaults, fields]);

const handleSave = async () => {
  await mutate(id, "novel", () =>
    api({
      url: `/api/novels/${id}`,
      method: "PATCH",
      data: data as Record<string, unknown>,
    }),
  );
};

<EditorForm
  ref={editorRef}
  key={ConfigEntity.NOVEL}
  sections={sections}
  defaults={defaults}
/>
```

> 完整示例：[src/app/novel/[id]/page.tsx](../../../src/app/novel/[id]/page.tsx)



## 卡片内容渲染

```tsx
// 选项类字段（角色、状态等）
{renderOptions(fieldsMap["role"]?.options, item.role)}

// 文本类字段
<ConfigBadges config={item} items={[["性别", "gender"], ["身份", "identity"]]} />
```


---

## AI 工作流（梦工厂）

基于 `useFactory` 的 Tab 维度缓存机制，核心流程：生成 → 预览 → 应用/舍弃。

> 详细架构、`useFactory()` 完整返回值见 [factory-page.md](factory-page.md)

---

## 常见反模式

| ❌ | ✅ |
|----|-----|
| 手写 CRUD 逻辑 | 用 `useEntityCrud` |
| 直接操作 store items | 通过 `mutate` 更新 |
| 手写表单渲染 | 用 `EditorForm` + `renderSections` |
| 每个页面重复写 drawer 状态 | 用 `useEntityCrud` 统一管理 |
