// backend の JSON と対応
export type Option = { slug: string; label: string; icon?: string };

// ---------- TOP（backend/top.go） ----------
export type ShrineCard = {
  id: string;
  name: string;
  worry: string;
  area: string;
  access: string;
  afterVisit: string;
};

export type Feature = { id: string; title: string; summary: string };

export type AreaGroup = { name: string; areas: Option[] };

export type VisitLog = { id: string; date: string; title: string; worry: string };

export type TopResponse = {
  worries: Option[];
  popular: ShrineCard[];
  mainFeature: Feature;
  subFeatures: Feature[];
  areaGroups: AreaGroup[];
  recentLogs: VisitLog[];
  instagramUser: string;
};

// ---------- 一覧（backend/shrines.go） ----------
export type ShrineItem = {
  id: string;
  name: string;
  worry: Option;
  area: Option;
  stations: string;
  access: string;
  benefit: string;
  catch: string;
  afterVisit: string;
  goshuin: boolean;
};

export type FilterOption = { slug: string; label: string; count: number; selected: boolean };

export type SortKey = "new" | "popular" | "near";

export type ShrineListResponse = {
  total: number;
  items: ShrineItem[];
  filters: { worry: FilterOption[]; area: FilterOption[]; kodawari: FilterOption[] };
  q: string;
  station: string;
  sort: SortKey;
};

// ---------- 詳細（backend/shrine_detail.go） ----------
export type InfoRow = { label: string; value: string };

export type Shop = { name: string; genre: string; distance: string; budget: string; recommend: string };

export type RelatedShrine = { id: string; name: string; area: string };

export type ShrineDetail = {
  id: string;
  name: string;
  kana: string;
  worry: Option;
  area: Option;
  tags: string[];
  catch: string;
  stations: string;
  address: string;
  mainPhoto: string;
  thumbs: string[];
  days: string[];
  info: InfoRow[];
  shops: Shop[];
  sake: InfoRow[];
  related: RelatedShrine[];
  instagramUrl: string;
};

// ---------- エリア（backend/areas.go） ----------
export type AreaCount = { slug: string; label: string; count: number };

export type AreaGroupCount = { name: string; areas: AreaCount[] };

// ---------- 駅（backend/stations.go） ----------
export type StationGroup = { area: Option; stations: { name: string; count: number }[] };

// ---------- 特集（backend/features.go） ----------
export type FeatureDetail = Feature & {
  lead: string;
  listQuery: string;
  items: ShrineItem[];
  others: Feature[];
};
