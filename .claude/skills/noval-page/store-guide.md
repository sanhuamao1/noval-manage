# useAppStore 全局状态管理

Zustand 全局 store，位于 `@/stores/useAppStore`。

## 什么数据放 store

**适合**：跨页面/组件共享的数据（novel、characters、locations — 供 TagSelect 使用）、初始化时就需加载的数据。

**不适合**：仅单页面使用的列表数据、组件内部临时状态。

---

## Store 结构

| key | 类型 | 说明 |
|---|---|---|
| `novel` | `NovelData \| null` | 当前小说 |
| `characters` | `{ id, name }[]` | 人物列表（轻量，仅 id + name） |
| `organizations` | `OrganizationData[]` | 组织列表 |
| `locations` | `LocationData[]` | 地点列表 |
| `foreshadowings` | `{ id, name }[]` | 伏笔列表 |
| `outlines` | `OutlineData[]` | 大纲列表 |
| `chapters` | `ChapterSummary[]` | 章节摘要列表 |
| `polishRules` | `PolishRuleData[]` | 润色规则（跨小说共享） |
| `polishSamples` | `PolishSampleData[]` | 风格样本（跨小说共享） |
| `relations` | `RelationsData` | 角色关系图（`{ links, positions }`） |

## Actions

| action | 用途 |
|---|---|
| `init(novelId)` | 并行加载 **全部** 10 类数据（novel, characters, organizations, locations, foreshadowings, outlines, chapters, polishRules, polishSamples, relations） |
| `mutate(novelId, refreshKey, apiCall)` | 执行 apiCall → 自动刷新对应 key 的数据 |
| `setOutlines(outlines)` | 手动设置大纲（仅 outlines 使用） |
| `reset()` | 清理 store |

## RefreshKey

```ts
type RefreshKey = "novel" | "characters" | "organizations" | "locations" | "foreshadowings" | "outlines" | "chapters" | "polishRules" | "polishSamples" | "relations";
```

每个 key 对应一个固定的 API 路由（在 `KEY_API` 中配置），`mutate` 执行后会自动用该路由重新请求数据。`refreshKey` 支持单个 key 或数组：

```ts
// 刷新单个
await mutate(novelId, "characters", () => api({...}));

// 刷新多个
await mutate(novelId, ["characters", "relations"], () => api({...}));
```

## mutate 使用

```ts
const mutate = useAppStore(s => s.mutate);

// 创建
await mutate(novelId, "characters", () =>
  api<Character>({ url: "/api/characters", method: "POST", data: { novelId, name, ...config } })
);

// 更新
await mutate(novelId, "characters", () =>
  api({ url: "/api/characters", method: "PUT", data: { id: editingId, ...config } })
);

// 删除
await mutate(novelId, "characters", () =>
  api({ url: `/api/characters?id=${id}&novelId=${novelId}`, method: "DELETE" })
);

// 更新 novel 后自动刷新
await mutate(novelId, "novel", () =>
  api({ url: `/api/novels/${novelId}`, method: "PATCH", data })
);
```

## 原则

- **一个 `mutate` 覆盖所有 CRUD**，不需要每个实体单独写 action
- **CRUD 页面用 `useEntityCrud`**，它封装了 store 读写和 mutate 调用
- **Store 负责数据缓存和共享**，不负责业务逻辑
- **单页面专用数据**用 `useState` + `api()`，不放进 store
- **`relations` 是独立数据**（脱离实体体系），初始化时与其他数据并行加载，通过 `mutate(novelId, "relations", ...)` 刷新

## 参考文件

- [src/stores/useAppStore.ts](../../../src/stores/useAppStore.ts)
- [src/hooks/useEntityCrud.ts](../../../src/hooks/useEntityCrud.ts)
- [src/lib/configs/crud-config.ts](../../../src/lib/configs/crud-config.ts)