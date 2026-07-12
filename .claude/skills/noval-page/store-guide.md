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

## 当前 store 分析

### 现有 action 局限

```
updateNovel(novelId, data)             — ✅ PATCH + 自动 re-fetch
createCharacter / createLocation / ...  — ❌ 每个实体写一个重复 action
setOutlines(outlines)                   — ❌ 手动 set，不做 API 请求
```

根本问题：每个实体都要写单独的 CRUD action，store 越来越臃肿。

### 优化方向

用一个 **通用 mutate action** 替代所有实体专用的 create/update/delete action：

```ts
mutate(novelId, refreshKey, apiCall)
// 1. 执行 apiCall（你传入的 API 请求）
// 2. 自动重新请求 refreshKey 对应的数据
// 3. 更新 store
```

---

## 通用 mutate 设计方案

```ts
/** store 中可被刷新的数据 key */
type RefreshKey = "novel" | "characters" | "locations" | "foreshadowings" | "outlines";

/** 每个 key 对应的 API URL 模板 */
const KEY_API: Record<RefreshKey, (novelId: string) => string> = {
  novel:          (id) => `/api/novels?id=${id}`,
  characters:     (id) => `/api/characters?novelId=${id}`,
  locations:      (id) => `/api/locations?novelId=${id}`,
  foreshadowings: (id) => `/api/foreshadowings?novelId=${id}`,
  outlines:       (id) => `/api/outlines?novelId=${id}`,
};
```

### 核心 action

```ts
// store 中只需要这一个通用 action
mutate: async <T>(
  novelId: string,
  refreshKey: RefreshKey,
  apiCall: () => Promise<T>,
): Promise<T> => {
  const result = await apiCall();
  const url = KEY_API[refreshKey](novelId);
  const freshData = await api<unknown>({ url });
  set({ [refreshKey]: freshData });
  return result;
},
```

### 页面中使用

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

// 更新 novel 后只刷新 novel
await mutate(novelId, "novel", () =>
  api({ url: `/api/novels/${novelId}`, method: "PATCH", data }),
);
```

### 优势

1. **一个 action 替代所有实体 CRUD** — store 不再膨胀
2. **自动刷新** — 每次操作后重新 fetch 保证数据最新
3. **类型安全** — `apiCall` 的返回值类型由调用方泛型决定

---

## 迁移建议

```
移除: createCharacter / createLocation / createForeshadowing
移除: setOutlines
移除: updateNovel（统一用 mutate + refreshKey="novel" 替代）

保留: init(novelId)     — 首次并行加载
新增: mutate(...)       — 通用 CRUD + 自动刷新
保留: reset()            — 清理 store
```

### 可选：init 支持按需加载

```ts
init: async (novelId, keys?: RefreshKey[]) => {
  const allKeys = keys ?? ["novel", "characters", "locations", "foreshadowings"];
  const results = await Promise.all(
    allKeys.map((key) => {
      const url = KEY_API[key](novelId);
      return api<unknown>({ url }).then((data) => ({ key, data }));
    }),
  );
  const updates: Record<string, unknown> = {};
  for (const { key, data } of results) updates[key] = data;
  set(updates);
},
```

页面可以按需初始化：`init(novelId, ["novel", "characters"])`。

---

## 原则

- **不需要每个实体都往 store 加 action**，一个 `mutate` 就够了
- **store 负责数据缓存和共享**，不负责业务逻辑
- **页面负责业务逻辑**（拼装 CRUD 参数），通过 `mutate` 触发 store 刷新
- **单页面专用数据**用 `useState` + `api()`，不放进 store

## 参考文件

- 当前 store：[src/stores/useAppStore.ts](../../../src/stores/useAppStore.ts)
- 页面中使用 store：[page-single.md](page-single.md)
- 页面中使用 api：[page-list.md](page-list.md)
