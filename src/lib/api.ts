export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type ApiOptions = {
  url: string;
  method?: HttpMethod;
  /** 查询参数，自动拼接到 URL */
  params?: Record<string, string | number>;
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
};

export async function api<T = unknown>({ url, method = "GET", params, data, headers }: ApiOptions): Promise<T> {
  const finalUrl = params
    ? `${url}?${new URLSearchParams(
        Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
      ).toString()}`
    : url;

  const options: RequestInit = { method, headers: { "Content-Type": "application/json", ...headers } };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(finalUrl, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json();
}
