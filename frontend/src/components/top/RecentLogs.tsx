import { Link } from "react-router";
import type { VisitLog } from "../../types";
import Placeholder from "../Placeholder";
import SectionHead from "./SectionHead";
import { formatDate } from "../../date";

export default function RecentLogs({ logs }: { logs: VisitLog[] }) {
  return (
    <section aria-labelledby="log-h">
      <SectionHead id="log-h" title="最近の参拝記録" more="一覧" to="/logs" />
      <div className="tb-log">
        {logs.map((l) => (
          <Link key={l.id} to={`/logs/${l.id}`}>
            <Placeholder />
            <span>
              <small>
                <time dateTime={l.date}>{formatDate(l.date)}</time>
              </small>
              <b>{l.title}</b>
              <em>{l.worry}</em>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
