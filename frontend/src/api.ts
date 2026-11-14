import type { AreaGroupCount, StationGroup, ShrineDetail, ShrineListResponse, TopResponse } from "./types";

export class NotFoundError extends Error {}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, { signal });
  if (res.status === 404) throw new NotFoundError(path);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export const fetchTop = (signal?: AbortSignal) => get<TopResponse>("/api/top", signal);

/** query は一覧ページの URL のクエリ文字列をそのまま渡す */
export const fetchShrines = (query: string, signal?: AbortSignal) =>
  get<ShrineListResponse>(`/api/shrines${query ? `?${query}` : ""}`, signal);

export const fetchShrine = (id: string, signal?: AbortSignal) =>
  get<ShrineDetail>(`/api/shrines/${encodeURIComponent(id)}`, signal);

export const fetchAreas = (signal?: AbortSignal) => get<AreaGroupCount[]>("/api/areas", signal);

export const fetchStations = (signal?: AbortSignal) => get<StationGroup[]>("/api/stations", signal);
