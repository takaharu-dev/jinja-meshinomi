import type { TopResponse } from "./types";

export async function fetchTop(signal?: AbortSignal): Promise<TopResponse> {
  const res = await fetch("/api/top", { signal });
  if (!res.ok) throw new Error(`GET /api/top failed: ${res.status}`);
  return res.json();
}
