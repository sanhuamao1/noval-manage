# API 请求 (`@/lib/api`)

统一 HTTP 请求封装，支持泛型。

## 签名

```ts
api<T = unknown>({ url, method?, data? }): Promise<T>
```

## 各方法示例

```ts
import { api } from "@/lib/api";

// GET — 获取列表
const characters = await api<Character[]>({ url: `/api/characters?novelId=${novelId}` });

// GET — 获取单条
const novel = await api<NovelData>({ url: `/api/novels?id=${novelId}` });

// POST — 创建
await api<Character>({
  url: "/api/characters",
  method: "POST",
  data: { novelId, name, ...config },
});

// PUT — 更新
await api({
  url: "/api/characters",
  method: "PUT",
  data: { id: editingId, novelId, ...config },
});

// DELETE
await api({
  url: `/api/characters?id=${charId}&novelId=${novelId}`,
  method: "DELETE",
});

// PATCH — 部分更新（用于 store action 中）
await api({ url: `/api/novels/${novelId}`, method: "PATCH", data });
```



## 参考

- api 实现：[src/lib/api.ts](../../../src/lib/api.ts)