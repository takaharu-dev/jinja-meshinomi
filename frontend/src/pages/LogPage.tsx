import { Link, useLoaderData } from "react-router";
import type { VisitLogDetail } from "../types";
import Placeholder from "../components/Placeholder";
import LogRow from "../components/LogRow";
import { formatDate } from "../date";
import { usePageMeta } from "../pageMeta";
import { logDescription } from "../descriptions";
import "./LogsPage.css";
import "./ShrineDetailPage.css";

export default function LogPage() {
  const l = useLoaderData() as VisitLogDetail;
  usePageMeta({ title: l.title, description: logDescription(l), type: "article" });

  return (
    <article className="container logpage logpage--detail">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ <Link to="/logs">参拝記録</Link> ＞ {l.title}
        </nav>
        <div className="logmeta">
          <time dateTime={l.date}>{formatDate(l.date, true)}</time>
          <span className="tag">{l.worry}</span>
        </div>
        <h1>{l.title}</h1>
      </div>

      <Placeholder label="メイン写真" className="logmain" />
      <div className="logbody">
        {l.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="logphotos">
        {l.photos.map((p) => (
          <Placeholder key={p} label={p} />
        ))}
      </div>

      <section className="logsec" aria-labelledby="log-shrine">
        <h2 id="log-shrine" className="st">
          参拝した神社
        </h2>
        <Link to={`/shrines/${l.shrine.id}`} className="logshrine">
          <Placeholder label="神社の写真" />
          <span>
            <b>{l.shrine.name}</b>
            <small>{l.shrine.area}</small>
            <span className="logshrine__more">神社の詳細を見る ›</span>
          </span>
        </Link>
      </section>

      <section className="logsec" aria-labelledby="log-shop">
        <h2 id="log-shop" className="st">
          寄ったお店
        </h2>
        <div className="shop">
          <Placeholder label="お店の写真" />
          <div>
            <b>{l.shop.name}</b>
            <table className="tbl">
              <tbody>
                {[
                  ["ジャンル", l.shop.genre],
                  ["神社から", l.shop.distance],
                  ["予算", l.shop.budget],
                  ["おすすめ", l.shop.recommend],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {l.others.length > 0 && (
        <section className="logsec" aria-labelledby="log-others">
          <h2 id="log-others" className="fsec-like">
            ほかの参拝記録
          </h2>
          <div className="loglist">
            {l.others.map((o) => (
              <LogRow key={o.id} log={o} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
