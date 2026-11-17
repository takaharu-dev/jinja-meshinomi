import type { AreaGroupCount, Feature, FeatureDetail, StationGroup, VisitLog, VisitLogDetail, ShrineDetail, ShrineListResponse, TopResponse } from "./types";

export class NotFoundError extends Error {}

// ブラウザでは同じドメインの /api を使う。ビルド時の描画では API の URL を setApiBase で指定する
let apiBase = "";

export function setApiBase(base: string) {
  apiBase = base.replace(/\/$/, "");
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(apiBase + path, { signal });
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

export const fetchFeatures = (signal?: AbortSignal) => get<Feature[]>("/api/features", signal);

export const fetchFeature = (id: string, signal?: AbortSignal) =>
  get<FeatureDetail>(`/api/features/${encodeURIComponent(id)}`, signal);

export const fetchLogs = (signal?: AbortSignal) => get<VisitLog[]>("/api/logs", signal);

export const fetchLog = (id: string, signal?: AbortSignal) =>
  get<VisitLogDetail>(`/api/logs/${encodeURIComponent(id)}`, signal);
