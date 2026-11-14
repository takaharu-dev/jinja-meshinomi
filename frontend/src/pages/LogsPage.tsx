import { Link, useLoaderData } from "react-router";
import type { VisitLog } from "../types";
import LogRow from "../components/LogRow";
import { useDocumentTitle } from "../useDocumentTitle";
import "./LogsPage.css";

export default function LogsPage() {
  const logs = useLoaderData() as VisitLog[];
  useDocumentTitle("参拝記録");

  return (
    <div className="container logpage">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ 参拝記録
        </nav>
        <h1>参拝記録</h1>
        <p className="apage__lead">実際にお参りした神社と、帰りに寄ったお店の記録です。</p>
      </div>
      <div className="loglist">
        {logs.map((l) => (
          <LogRow key={l.id} log={l} />
        ))}
      </div>
    </div>
  );
}
