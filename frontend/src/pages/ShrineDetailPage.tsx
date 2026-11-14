import { useEffect, useState, type MouseEvent } from "react";
import { Link, useParams } from "react-router";
import { fetchShrine, NotFoundError } from "../api";
import type { InfoRow, ShrineDetail } from "../types";
import Placeholder from "../components/Placeholder";
import SaveButton from "../components/SaveButton";
import NotFoundPage from "./NotFoundPage";
import { useDocumentTitle } from "../useDocumentTitle";
import "./ShrineDetailPage.css";

const TABS = [
  { id: "d-info", label: "神社の情報" },
  { id: "d-shops", label: "参拝後のお店" },
  { id: "d-sake", label: "地酒・御神酒" },
  { id: "d-access", label: "アクセス" },
  { id: "d-reel", label: "リール" },
];

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "notfound" }
  | { status: "ok"; data: ShrineDetail };

export default function ShrineDetailPage() {
  const { id = "" } = useParams();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    fetchShrine(id, ctrl.signal)
      .then((data) => setState({ status: "ok", data }))
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        if (err instanceof NotFoundError) {
          setState({ status: "notfound" });
        } else {
          console.error(err);
          setState({ status: "error" });
        }
      });
    return () => ctrl.abort();
  }, [id]);

  useDocumentTitle(state.status === "ok" ? state.data.name : undefined);

  if (state.status === "notfound") return <NotFoundPage />;
  if (state.status !== "ok") {
    return (
      <p className="container page-status">
        {state.status === "loading" ? "読み込み中…" : "データを読み込めませんでした。時間をおいて再度お試しください。"}
      </p>
    );
  }
  return <Detail d={state.data} />;
}

function Table({ rows }: { rows: InfoRow[] }) {
  return (
    <table className="tbl">
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <th scope="row">{r.label}</th>
            <td>{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 見えているセクションに合わせてタブを切り替える */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return [active, setActive] as const;
}

const TAB_IDS = TABS.map((t) => t.id);

function Detail({ d }: { d: ShrineDetail }) {
  const [active, setActive] = useActiveSection(TAB_IDS);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address)}`;

  const jump = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <article className="dpage">
      <div className="container phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ <Link to={`/shrines?worry=${d.worry.slug}`}>{d.worry.label}</Link> ＞{" "}
          <Link to={`/shrines?area=${d.area.slug}`}>{d.area.label}</Link> ＞ {d.name}
        </nav>
        <div className="dtitle">
          <div>
            <div className="dtags">
              {d.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
            <h1>
              {d.name}
              <small>
                {d.kana}｜{d.address.match(/^東京都\S+?[区市]/)?.[0] ?? d.area.label}
              </small>
            </h1>
            <p className="dcatch">{d.catch}</p>
          </div>
          <SaveButton id={d.id} name={d.name} variant="full" className="btn btn--ghost dtitle__save" />
        </div>
      </div>

      <nav className="dtabs" aria-label="このページの内容">
        <div className="container">
          {TABS.map((t) => (
            <a key={t.id} href={`#${t.id}`} aria-current={active === t.id ? "true" : undefined} onClick={jump(t.id)}>
              {t.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="container dbody">
        <div className="dmain">
          <div className="gal">
            <Placeholder label={d.mainPhoto} className="gal__big" />
            <div className="gal__th">
              {d.thumbs.map((t) => (
                <Placeholder key={t} label={t} />
              ))}
            </div>
          </div>

          {d.days.length > 0 && (
            <section>
              <h2 className="st">こんな日に行きたい</h2>
              <ul className="days">
                {d.days.map((day) => (
                  <li key={day}>{day}</li>
                ))}
              </ul>
            </section>
          )}

          <section id="d-info">
            <h2 className="st">神社の情報</h2>
            <Table rows={d.info} />
          </section>

          <section id="d-shops">
            <h2 className="st">参拝のあとは、この一杯</h2>
            <div className="shops">
              {d.shops.map((s, i) => (
                <div key={i} className="shop">
                  <Placeholder label="お店の写真" />
                  <div>
                    <b>{s.name}</b>
                    <Table
                      rows={[
                        { label: "ジャンル", value: s.genre },
                        { label: "神社から", value: s.distance },
                        { label: "予算", value: s.budget },
                        { label: "おすすめ", value: s.recommend },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="d-sake">
            <h2 className="st">地酒・御神酒</h2>
            <Table rows={d.sake} />
          </section>

          <section id="d-access">
            <h2 className="st">アクセス</h2>
            <Table
              rows={[
                { label: "住所", value: d.address },
                { label: "最寄り駅", value: d.stations },
              ]}
            />
            <a className="map" href={mapUrl} target="_blank" rel="noopener noreferrer">
              <Placeholder label="地図（Googleマップで開く）" />
            </a>
          </section>

          <section id="d-reel" className="dreel">
            <h2 className="st">リール</h2>
            <p>参拝の雰囲気と帰りの一杯は、Instagramのリールで見られます。</p>
            <a className="btn" href={d.instagramUrl} target="_blank" rel="noopener noreferrer">
              リールで雰囲気を見る
            </a>
          </section>
        </div>

        <aside className="dside">
          <div className="abox">
            <b>{d.name}</b>
            <small>
              {d.stations}｜{d.area.label}
            </small>
            <a className="btn" href={d.instagramUrl} target="_blank" rel="noopener noreferrer">
              リールで雰囲気を見る
            </a>
            <SaveButton id={d.id} name={d.name} variant="full" className="btn btn--ghost" />
          </div>
          {d.related.length > 0 && (
            <div className="rel">
              <h2>この神社を見た人はこんな神社も見ています</h2>
              {d.related.map((r) => (
                <Link key={r.id} to={`/shrines/${r.id}`}>
                  <Placeholder label="" />
                  <span>
                    <b>{r.name}</b>
                    <small>{r.area}</small>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* スマホ：下に固定 */}
      <div className="dbar">
        <SaveButton id={d.id} name={d.name} className="btn btn--ghost" />
        <a className="btn" href={d.instagramUrl} target="_blank" rel="noopener noreferrer">
          リールで雰囲気を見る
        </a>
      </div>
    </article>
  );
}
