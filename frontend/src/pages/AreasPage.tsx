import { Link, useLoaderData } from "react-router";
import type { AreaGroupCount } from "../types";
import { useDocumentTitle } from "../useDocumentTitle";
import "./AreasPage.css";

export default function AreasPage() {
  const groups = useLoaderData() as AreaGroupCount[];
  useDocumentTitle("エリアから探す");

  return (
    <div className="container apage">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ エリアから探す
        </nav>
        <h1>エリアから探す</h1>
        <p className="apage__lead">行きたいエリアを選ぶと、そのエリアの神社と参拝後のお店が見られます。</p>
      </div>

      {groups.map((g) => (
        <section key={g.name} className="agroup" aria-labelledby={`ag-${g.name}`}>
          <h2 id={`ag-${g.name}`}>{g.name}</h2>
          <ul className="agrid">
            {g.areas.map((a) => (
              <li key={a.slug}>
                {a.count > 0 ? (
                  <Link to={`/shrines?area=${a.slug}`} className="acard">
                    <b>{a.label}</b>
                    <span>{a.count}件 ›</span>
                  </Link>
                ) : (
                  <span className="acard acard--empty">
                    <b>{a.label}</b>
                    <span>準備中</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
