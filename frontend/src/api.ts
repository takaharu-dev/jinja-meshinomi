import type { ShrineListResponse, TopResponse } from "./types";

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, { signal });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export const fetchTop = (signal?: AbortSignal) => get<TopResponse>("/api/top", signal);

/** query は一覧ページの URL のクエリ文字列をそのまま渡す */
export const fetchShrines = (query: string, signal?: AbortSignal) =>
  get<ShrineListResponse>(`/api/shrines${query ? `?${query}` : ""}`, signal);
