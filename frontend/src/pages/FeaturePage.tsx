import { Link, useLoaderData } from "react-router";
import type { FeatureDetail } from "../types";
import Placeholder from "../components/Placeholder";
import FeatureCard from "../components/FeatureCard";
import ShrineRow from "../components/list/ShrineRow";
import { useDocumentTitle } from "../useDocumentTitle";
import "./FeaturesPage.css";
import "./ShrineListPage.css";

export default function FeaturePage() {
  const f = useLoaderData() as FeatureDetail;
  useDocumentTitle(f.title);

  return (
    <article className="container fpage">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ <Link to="/features">特集</Link> ＞ {f.title}
        </nav>
      </div>

      <header className="fhero">
        <Placeholder label="特集のメイン写真" />
        <div className="fhero__cap">
          <small>FEATURE</small>
          <h1>{f.title}</h1>
          <p>{f.summary}</p>
        </div>
      </header>

      <p className="flead">{f.lead}</p>

      <section aria-labelledby="f-items">
        <h2 id="f-items" className="fsec">
          紹介している神社<em>{f.items.length}件</em>
        </h2>
        <ol className="fitems">
          {f.items.map((s) => (
            <li key={s.id}>
              <ShrineRow shrine={s} />
            </li>
          ))}
        </ol>
        <div className="fcta">
          <Link to={`/shrines?${f.listQuery}`} className="btn btn--ghost">
            この条件で神社一覧を見る ›
          </Link>
        </div>
      </section>

      {f.others.length > 0 && (
        <section aria-labelledby="f-others" className="fothers">
          <h2 id="f-others" className="fsec">
            ほかの特集
          </h2>
          <div className="fgrid">
            {f.others.map((o) => (
              <FeatureCard key={o.id} feature={o} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
