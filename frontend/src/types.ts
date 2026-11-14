// backend/data.go の JSON と対応
export type Worry = { slug: string; label: string; icon: string };

export type ShrineCard = {
  id: string;
  name: string;
  worry: string;
  area: string;
  access: string;
  afterVisit: string;
};

export type Feature = { id: string; title: string; summary: string };

export type AreaGroup = { name: string; areas: string[] };

export type VisitLog = { id: string; date: string; title: string; worry: string };

export type TopResponse = {
  worries: Worry[];
  popular: ShrineCard[];
  mainFeature: Feature;
  subFeatures: Feature[];
  areaGroups: AreaGroup[];
  recentLogs: VisitLog[];
  instagramUser: string;
};
