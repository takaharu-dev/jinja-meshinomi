import { Link, useLoaderData } from "react-router";
import type { StationGroup } from "../types";
import { useDocumentTitle } from "../useDocumentTitle";
import "./AreasPage.css";

export default function StationsPage() {
  const groups = useLoaderData() as StationGroup[];
  useDocumentTitle("駅から探す");

  return (
    <div className="container apage">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ 駅から探す
        </nav>
        <h1>駅から探す</h1>
        <p className="apage__lead">最寄り駅を選ぶと、その駅から行ける神社と参拝後のお店が見られます。</p>
      </div>

      {groups.map((g) => (
        <section key={g.area.slug} className="agroup" aria-labelledby={`sg-${g.area.slug}`}>
          <h2 id={`sg-${g.area.slug}`}>{g.area.label}</h2>
          <ul className="agrid">
            {g.stations.map((s) => (
              <li key={s.name}>
                <Link to={`/shrines?${new URLSearchParams({ station: s.name })}`} className="acard">
                  <b>{s.name}</b>
                  <span>{s.count}件 ›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
