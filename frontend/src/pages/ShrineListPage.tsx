import { Link, useLoaderData, useNavigation, useSearchParams } from "react-router";
import type { ShrineListResponse, SortKey } from "../types";
import FilterRow from "../components/list/FilterRow";
import ShrineRow from "../components/list/ShrineRow";
import { usePageMeta } from "../pageMeta";
import { shrineListDescription } from "../descriptions";
import "./ShrineListPage.css";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "新着順" },
  { key: "popular", label: "人気順" },
  { key: "near", label: "駅から近い順" },
];

export default function ShrineListPage() {
  const [params, setParams] = useSearchParams();
  const data = useLoaderData() as ShrineListResponse;
  const navigation = useNavigation();
  // 絞り込み中（同じ一覧ページ内での再取得）は結果を少し薄くする
  const loading = navigation.state === "loading" && navigation.location.pathname === "/shrines";

  const worry = data.filters.worry.find((o) => o.selected);
  const heading = worry
    ? `${worry.label}で行きたい神社と参拝後のお店`
    : data.station
      ? `${data.station}から行ける神社と参拝後のお店`
      : data.q
        ? `「${data.q}」の神社と参拝後のお店`
        : "神社と参拝後のお店";
  usePageMeta({ title: heading, description: shrineListDescription(heading, data) });

  // 条件は URL に持たせる（戻る・共有ができるように）
  const update = (fn: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    fn(next);
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const toggleSingle = (key: "worry" | "area") => (slug: string) =>
    update((p) => (p.get(key) === slug ? p.delete(key) : p.set(key, slug)));
  const toggleKodawari = (slug: string) =>
    update((p) => {
      const ks = p.getAll("k");
      p.delete("k");
      (ks.includes(slug) ? ks.filter((k) => k !== slug) : [...ks, slug]).forEach((k) => p.append("k", k));
    });
  const setSort = (key: SortKey) => update((p) => (key === "new" ? p.delete("sort") : p.set("sort", key)));
  const clearAll = () =>
    update((p) => {
      ["worry", "area", "station", "k", "q"].forEach((k) => p.delete(k));
    });

  const f = data.filters;
  const selected = [
    ...(data.q ? [`「${data.q}」`] : []),
    ...(data.station ? [data.station] : []),
    ...[...f.worry, ...f.area, ...f.kodawari].filter((o) => o.selected).map((o) => o.label),
  ];

  return (
    <div className="container lpage">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞{" "}
          {data.station ? (
            <>
              <Link to="/stations">駅から探す</Link> ＞ {data.station}
            </>
          ) : (
            "悩みから探す"
          )}
        </nav>
        <h1>
          {heading}
          <em>{data.total}件</em>
        </h1>
      </div>

      <div className="qf">
        <FilterRow label="悩み" options={f.worry} onToggle={toggleSingle("worry")} />
        <FilterRow label="エリア" options={f.area} onToggle={toggleSingle("area")} />
        <FilterRow label="こだわり" options={f.kodawari} onToggle={toggleKodawari} />
        <div className="qnow">
          <span>{selected.length ? `選択中：${selected.join("・")}` : "すべての神社を表示中"}</span>
          {selected.length > 0 && (
            <button type="button" onClick={clearAll}>
              条件をすべて解除
            </button>
          )}
        </div>
      </div>

      <div className="lbody" aria-busy={loading}>
        <div className="sort" role="group" aria-label="並び替え">
          並び替え
          {SORTS.map((s) => (
            <button key={s.key} type="button" aria-pressed={data.sort === s.key} onClick={() => setSort(s.key)}>
              {s.label}
            </button>
          ))}
        </div>

        {data.items.map((s) => (
          <ShrineRow key={s.id} shrine={s} />
        ))}
        {data.total === 0 && (
          <p className="empty">この条件に合う神社はまだありません。条件を1つ外してみてください。</p>
        )}
      </div>
    </div>
  );
}
