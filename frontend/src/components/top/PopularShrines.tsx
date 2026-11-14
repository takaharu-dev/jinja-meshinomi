import type { ShrineCard } from "../../types";
import Placeholder from "../Placeholder";
import SaveButton from "../SaveButton";
import SectionHead from "./SectionHead";

export default function PopularShrines({ shrines }: { shrines: ShrineCard[] }) {
  return (
    <section aria-labelledby="popular-h">
      <SectionHead id="popular-h" title="今週よく見られている神社と一杯" more="もっと見る" to="/shrines?sort=popular" />
      <div className="tb-cards">
        {shrines.map((s) => (
          <article key={s.id} className="tb-card">
            <Placeholder label="神社の写真" />
            <div className="tb-in">
              <span className="tag">{s.worry}</span>
              <b>{s.name}</b>
              <small>
                {s.area}｜{s.access}
              </small>
              <p>
                参拝のあとは <em>{s.afterVisit}</em>
              </p>
              <SaveButton id={s.id} name={s.name} className="tb-save" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
