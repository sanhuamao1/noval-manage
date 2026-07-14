# 如何编写页面



## 配置获取
```tsx
// 1. 从注册表获取配置（惰性构建 + 缓存）
const { fields, sections, defaults, fieldMap } = getEntry(ConfigEntity.NOVEL);
```

## 编辑区（如果需要）

```tsx
// 1 用 useAppStore 获取数据
// 2 用 fillConfig 填充表单
const novel = useAppStore((s) => s.novel);
useEffect(() => {
  if (novel) {
    setEditorConfig(fillConfig(novel, defaults, fields));
  }
}, [novel]);

// 3 使用抽屉作为编辑区，使用renderSections渲染表单
<SlidingDrawer open={drawer.open} onClose={drawer.close} onUpdate={handleSave}>
  {renderSections(sections, editorConfig, (c) => setEditorConfig(c))}
</SlidingDrawer>

// 4 创建与保存：
// 使用useAppStore的mutate进行 创建/保存/删除，实现数据跨组件更新
const mutate = useAppStore((s) => s.mutate);
await mutate(id, "novel", () =>
  api({ url: `/api/novels/${id}`, method: "PATCH", data: editorConfig as Record<string, unknown> }),
);
```
## 预览区

```tsx
// 1. 单数据，通过useAppStore拿到数据，再通过getEntry拿到fieldsMap（feild对应的配置）
const { novel } = useAppStore()
const { fieldsMap } = getEntry(ConfigEntity.NOVEL)

// 对于选项类型 可以使用renderOptions方法渲染信息
renderOptions(fieldsMap['status']?.options, novel.status)

// 2 多数据
// 使用CardList作为卡片容器，使用SimpleCard作为子元素
// 使用ConfigBadges渲染卡片的其他自定义信息
<SimpleCard
  key={char.id}
  title={char.name}
  selected={editingId === char.id}
  onClick={() => openForEdit(char)}
  onDelete={() => deleteCharacter(char.id)}
>
  <ConfigBadges
    config={char}
    items={[
      ["性别", "gender"],
      ["年龄", "age"],
      ["身份", "identity"],
      ["叙事功能", "narrativeFunction"],
      ["内在动机", "innerMotivation"],
    ]}
  />
</SimpleCard>
```


