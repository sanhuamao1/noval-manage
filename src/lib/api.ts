type ApiOptions = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: Record<string, unknown>;
};

export async function api<T = unknown>({ url, method = "GET", data }: ApiOptions): Promise<T> {
  const options: RequestInit = { method };

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
