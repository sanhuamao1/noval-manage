# useAppStore 全局状态管理

Zustand 全局 store，位于 `@/stores/useAppStore`。

## 什么数据适合放全局 store

**适合放 store：**
- 跨页面/组件共享的数据（如 `novel`）
- 多个地方需要选择的列表型数据（characters / locations / foreshadowings — 供 TagSelect 使用）
- 初始化时就需要加载的数据

**不适合放 store：**
- 仅单个页面使用的列表数据
- 组件内部临时状态

> 如果某个数据只在单个页面使用，优先用页面内 `useState` + `api()`，不要放进 store。

---

## Store 结构

### State

| key | 类型 | 说明 |
|---|---|---|
| `novel` | `NovelData \| null` | 当前小说 |
| `characters` | `{ id, name }[]` | 人物列表 |
| `locations` | `{ id, name }[]` | 地点列表 |
| `foreshadowings` | `{ id, name }[]` | 伏笔列表 |
| `outlines` | `Record<string, unknown>[]` | 大纲列表（手动管理，见下文） |

### Actions

| action | 用途 |
|---|---|
| `init(novelId)` | 首次并行加载 novel + 实体列表 |
| `mutate(novelId, refreshKey, apiCall)` | 通用 CRUD：执行 apiCall → 自动刷新对应数据 |
| `setOutlines(outlines)` | 手动设置大纲列表（仅 outlines 使用）|
| `reset()` | 清理 store |

---

## RefreshKey

```ts
type RefreshKey = "novel" | "characters" | "locations" | "foreshadowings" | "outlines";
```

每个 `RefreshKey` 对应 store 中的一个 state key，`mutate` 执行后会自动重新请求该 key 对应的数据。

---

## mutate 使用示例

```ts
const mutate = useAppStore((s) => s.mutate);

// 创建
await mutate(novelId, "characters", () =>
  api<Character>({
    url: "/api/characters",
    method: "POST",
    data: { novelId, name, ...config },
  }),
);

// 更新
await mutate(novelId, "characters", () =>
  api({
    url: "/api/characters",
    method: "PUT",
    data: { id: editingId, ...config },
  }),
);

// 删除
await mutate(novelId, "characters", () =>
  api({ url: `/api/characters?id=${id}&novelId=${novelId}`, method: "DELETE" }),
);

// 更新 novel 后自动刷新
await mutate(novelId, "novel", () =>
  api({ url: `/api/novels/${novelId}`, method: "PATCH", data }),
);
```

### 在页面组件中使用

```ts
const mutate = useAppStore((s) => s.mutate);

async function handleSave() {
  await mutate(id, "novel", () =>
    api({ url: `/api/novels/${id}`, method: "PATCH", data: formData }),
  );
  drawer.close();
}
```

---

## 关于 outlines

`outlines` 数据虽然也在 store 中，但由页面手动管理：

- 使用 `setOutlines` 写入数据
- 使用 `useAppStore(s => s.outlines)` 读取数据

原因：outlines 的展示形式是卡片列表，不在多个页面间共享，不需要 TagSelect 引用。放在 store 是为了与现有页面模式保持一致。

---

## 关于 useEntityItems

`useEntityItems(entity)` hook 封装了从 store 读取实体列表 + 创建实体的逻辑，用于 TagSelect 组件：

```ts
const { items, createFn } = useEntityItems("characters");
// items: 所有人物列表
// createFn(novelId, name): 创建新人物 → 自动刷新 store
```

内部使用 `mutate` 实现创建，无需每个实体写单独的 action。

---

## 原则

- **不需要每个实体都往 store 加 action**，一个 `mutate` 就够了
- **store 负责数据缓存和共享**，不负责业务逻辑
- **页面负责业务逻辑**（拼装 CRUD 参数），通过 `mutate` 触发 store 刷新
- **单页面专用数据**用 `useState` + `api()`，不放进 store

## 参考文件

- 当前 store：[src/stores/useAppStore.ts](../../../src/stores/useAppStore.ts)
- useEntityItems hook：[src/hooks/useEntityItems.ts](../../../src/hooks/useEntityItems.ts)
- 页面中使用 store：[page-single.md](page-single.md)
- 页面中使用 api：[page-list.md](page-list.md)
