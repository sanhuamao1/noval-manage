# 多数据列表页面

适合管理**多条记录**的场景（如人物列表、大纲列表）。数据通过 `api()` 从接口获取。展示区使用 `CardList + SimpleCard + ConfigBadges`。

## 模板（仅供参考）

```tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AddButton, SlidingDrawer, PageLayout, CardList, SimpleCard } from "@/components/ui";
import { renderSections } from "@/lib/configs/render-utils";
import { ConfigBadges } from "@/components/ui/config-badges";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import type { SomeConfig } from "@/lib/configs/generated";
import { api } from "@/lib/api";

interface SomeItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

export default function SomeListPage() {
  const params = useParams();
  const novelId = params.id as string;
  const [items, setItems] = useState<SomeItem[]>([]);
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { fields, sections, defaults } = getEntry(ConfigEntity.SOME_ENTITY);
  const [editorConfig, setEditorConfig] = useState<SomeConfig>(defaults);

  useEffect(() => { fetchItems(); }, [novelId]);

  async function fetchItems() {
    const data = await api<SomeItem[]>({ url: `/api/some-endpoint?novelId=${novelId}` });
    setItems(data);
  }

  function openForEdit(item: SomeItem) {
    setMode("edit");
    setEditingId(item.id);
    setEditorConfig(fillConfig(item, defaults, fields));
  }

  function startCreate() {
    setMode("create");
    setEditingId(null);
    setEditorConfig(defaults as SomeConfig);
  }

  async function saveItem() {
    const name = String(editorConfig.name ?? "").trim();
    if (!name) return;

    const { id, novelId, createdAt, updatedAt, ...config } = editorConfig as any;

    if (mode === "create") {
      await api({ url: "/api/some-endpoint", method: "POST", data: { novelId: id, name, ...config } });
    } else if (mode === "edit" && editingId) {
      await api({ url: "/api/some-endpoint", method: "PUT", data: { id: editingId, novelId: id, ...config } });
    }
    fetchItems();
    setMode(null);
    setEditingId(null);
  }

  async function deleteItem(itemId: string) {
    if (!confirm("确定要删除吗？")) return;
    await api({ url: `/api/some-endpoint?id=${itemId}&novelId=${novelId}`, method: "DELETE" });
    if (editingId === itemId) { setMode(null); setEditingId(null); }
    fetchItems();
  }

  return (
    <PageLayout
      title="列表标题"
      handler={<AddButton onClick={startCreate} />}
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={() => { setMode(null); setEditingId(null); }}
          width={890}
          onCreate={mode === "create" ? saveItem : undefined}
          onUpdate={mode === "edit" ? saveItem : undefined}
        >
          <div className="space-y-4">
            {renderSections(sections, editorConfig, (c) => setEditorConfig(c))}
          </div>
        </SlidingDrawer>
      }
    >
      <CardList emptyText="还没有数据，点击上方按钮添加">
        {items.map((item) => {
          const cfg = fillConfig(item, defaults, fields);
          return (
            <SimpleCard
              key={item.id}
              title={item.name}
              selected={editingId === item.id}
              onClick={() => openForEdit(item)}
              onDelete={() => deleteItem(item.id)}
            >
              <ConfigBadges
                config={cfg}
                items={[
                  ["性别", "gender"],
                  ["年龄", "age"],
                ]}
              />
            </SimpleCard>
          );
        })}
      </CardList>
    </PageLayout>
  );
}
```

## 关键点

1. **`getEntry` 在组件顶层调用**，不要在 map 循环里重复获取（参考人物页面反例）
2. 使用 `mode`（`"create" | "edit" | null`）控制抽屉状态
3. `SlidingDrawer` 的 `onCreate` / `onUpdate` 根据 mode 传入不同保存函数
4. 保存时剥离系统字段：`const { id, novelId, createdAt, updatedAt, ...config } = editorConfig`
5. 删除后如果删除的是当前编辑项，关闭抽屉



## fillConfig 用法

`fillConfig(data, defaults, fields)` 将 API 数据合并到默认值，自动解析数组字段（JSON 字符串 → 数组）：

```ts
const cfg = fillConfig(apiData, defaults, fields);
// 相当于 { ...defaults, ...(只保留 fields 中定义的 key 的 apiData 值) }
```

## 参考文件

- 基础列表页：[src/app/novel/[id]/characters/page.tsx](../../../src/app/novel/%5Bid%5D/characters/page.tsx)
- 自定义展示（Tag 替代 ConfigBadges）：[src/app/novel/[id]/outlines/page.tsx](../../../src/app/novel/%5Bid%5D/outlines/page.tsx)
- 混合页面（两组列表）：[src/app/novel/[id]/polish/page.tsx](../../../src/app/novel/%5Bid%5D/polish/page.tsx)