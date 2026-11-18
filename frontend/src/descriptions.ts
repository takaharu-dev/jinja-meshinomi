// 各ページの meta description。既存のデータとページ内の文言だけで組み立てる（新しい宣伝文句は作らない）
import { formatDate } from "./date";
import type { AreaGroupCount, Feature, FeatureDetail, ShrineDetail, ShrineListResponse, StationGroup, VisitLog, VisitLogDetail } from "./types";

// ページ内のリード文（各ページの .apage__lead / .doc__lead と同じ）
export const LEADS = {
  areas: "行きたいエリアを選ぶと、そのエリアの神社と参拝後のお店が見られます。",
  stations: "最寄り駅を選ぶと、その駅から行ける神社と参拝後のお店が見られます。",
  features: "悩みや気分に合わせて、神社と参拝後の一杯を選びました。",
  logs: "実際にお参りした神社と、帰りに寄ったお店の記録です。",
  about: "神社めし呑みは、悩んだ日に行きたい神社と、参拝のあとに寄りたいごはん・地酒のお店を紹介するサイトです。",
  contact: "ご意見・ご感想、掲載内容の誤りのお知らせ、掲載のご相談などは、Instagram の DM（ダイレクトメッセージ）で受け付けています。",
  privacy: "神社めし呑み（以下「当サイト」）は、利用者の情報を以下のとおり取り扱います。",
  saved: "気になる神社の「♡」を押すと、ここに並びます。保存リストはこのブラウザに保存されています。",
};

const list = (items: string[]) => items.join("、");
// タイトルには「、」が入ることがあるので、並べるときは「」で囲む
const titles = (items: string[]) => items.map((t) => `「${t}」`).join("");

/** 神社詳細：キャッチコピー。〇〇神社（エリア）のご利益は〇〇。最寄り駅は〇〇。 */
export function shrineDescription(d: ShrineDetail): string {
  const benefit = d.info.find((r) => r.label === "ご利益")?.value;
  return [
    d.catch && `${d.catch}。`,
    `${d.name}（${d.area.label}）`,
    benefit ? `のご利益は${benefit}。` : "。",
    d.stations && `最寄り駅は${d.stations}。`,
  ]
    .filter(Boolean)
    .join("");
}

/** 神社一覧：見出しの一覧（〇件）：神社名、神社名、… */
export function shrineListDescription(heading: string, data: ShrineListResponse): string {
  const names = data.items.map((s) => s.name);
  return `${heading}の一覧（${data.total}件）${names.length ? `：${list(names)}` : "。"}`;
}

/** エリア：リード文＋件数のあるエリア */
export function areasDescription(groups: AreaGroupCount[]): string {
  const areas = groups.flatMap((g) => g.areas).filter((a) => a.count > 0);
  return `${LEADS.areas}${list(areas.map((a) => `${a.label}（${a.count}件）`))}`;
}

/** 駅：リード文＋件数のある駅 */
export function stationsDescription(groups: StationGroup[]): string {
  const stations = groups.flatMap((g) => g.stations).filter((s) => s.count > 0);
  return `${LEADS.stations}${list(stations.map((s) => s.name))}`;
}

/** 特集一覧：リード文＋「特集のタイトル」 */
export function featuresDescription(features: Feature[]): string {
  return `${LEADS.features}${titles(features.map((f) => f.title))}`;
}

/** 特集：特集のリード文（なければ概要） */
export function featureDescription(f: FeatureDetail): string {
  return f.lead || `${f.title}。${f.summary}`;
}

/** 参拝記録一覧：リード文＋「記録のタイトル」（日付） */
export function logsDescription(logs: VisitLog[]): string {
  return `${LEADS.logs}${logs.map((l) => `「${l.title}」（${formatDate(l.date)}）`).join("")}`;
}

/** 参拝記録：〇年〇月〇日に〇〇神社（エリア）をお参りした記録です。「タイトル」 */
export function logDescription(l: VisitLogDetail): string {
  return `${formatDate(l.date, true)}に${l.shrine.name}（${l.shrine.area}）をお参りした記録です。「${l.title}」`;
}
