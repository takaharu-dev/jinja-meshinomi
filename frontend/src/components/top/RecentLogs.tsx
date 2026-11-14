import type { VisitLog } from "../../types";
import Placeholder from "../Placeholder";
import SectionHead from "./SectionHead";

export default function RecentLogs({ logs }: { logs: VisitLog[] }) {
  return (
    <section aria-labelledby="log-h">
      <SectionHead id="log-h" title="最近の参拝記録" more="一覧" />
      <div className="tb-log">
        {logs.map((l) => (
          <a key={l.id} href={`#log-${l.id}`}>
            <Placeholder />
            <span>
              <small>{l.date}</small>
              <b>{l.title}</b>
              <em>{l.worry}</em>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
