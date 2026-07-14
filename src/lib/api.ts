type ApiOptions = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
};

export async function api<T = unknown>({ url, method = "GET", data, headers }: ApiOptions): Promise<T> {
  const options: RequestInit = { method, headers: { "Content-Type": "application/json", ...headers } };

  if (data && method !== "GET") {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json();
}
