import { Link, useLoaderData } from "react-router";
import type { VisitLog } from "../types";
import LogRow from "../components/LogRow";
import { usePageMeta } from "../pageMeta";
import { LEADS, logsDescription } from "../descriptions";
import "./LogsPage.css";

export default function LogsPage() {
  const logs = useLoaderData() as VisitLog[];
  usePageMeta({ title: "参拝記録", description: logsDescription(logs) });

  return (
    <div className="container logpage">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ 参拝記録
        </nav>
        <h1>参拝記録</h1>
        <p className="apage__lead">{LEADS.logs}</p>
      </div>
      <div className="loglist">
        {logs.map((l) => (
          <LogRow key={l.id} log={l} />
        ))}
      </div>
    </div>
  );
}
