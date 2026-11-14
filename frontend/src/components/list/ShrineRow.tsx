import { Link } from "react-router";
import type { ShrineItem } from "../../types";
import Placeholder from "../Placeholder";
import SaveButton from "../SaveButton";

export default function ShrineRow({ shrine: s }: { shrine: ShrineItem }) {
  const to = `/shrines/${s.id}`;
  return (
    <article className="lrow">
      <Link to={to} tabIndex={-1} aria-hidden="true">
        <Placeholder label="神社の写真" />
      </Link>
      <div className="lr-in">
        <div className="lr-top">
          <h2 className="lr-name">
            <Link to={to}>{s.name}</Link>
          </h2>
          <SaveButton id={s.id} name={s.name} variant="round" className="lr-save" />
        </div>
        <small>
          {s.area.label}｜{s.stations}
        </small>
        <div className="lr-tags">
          <span className="tag">{s.worry.label}</span>
          {s.goshuin && <span className="tag">御朱印あり</span>}
        </div>
        <p className="lr-c">{s.catch}</p>
        <p className="lr-af">
          参拝のあとは <em>{s.afterVisit}</em>
        </p>
      </div>
    </article>
  );
}
