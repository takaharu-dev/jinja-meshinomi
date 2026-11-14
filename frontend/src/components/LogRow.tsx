import { Link } from "react-router";
import type { VisitLog } from "../types";
import Placeholder from "./Placeholder";
import { formatDate } from "../date";

export default function LogRow({ log: l }: { log: VisitLog }) {
  return (
    <Link to={`/logs/${l.id}`} className="logrow">
      <Placeholder label="写真" />
      <span className="logrow__in">
        <time dateTime={l.date}>{formatDate(l.date, true)}</time>
        <b>{l.title}</b>
        <span>
          <span className="tag">{l.worry}</span>
          <small>{l.shrine.area}</small>
        </span>
      </span>
    </Link>
  );
}
