import { useState } from "react";
import type { ShrineCard } from "../../types";
import Placeholder from "../Placeholder";
import SectionHead from "./SectionHead";

export default function PopularShrines({ shrines }: { shrines: ShrineCard[] }) {
  // 保存リストは未実装のため、いまは画面内の状態だけ持つ
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section aria-labelledby="popular-h">
      <SectionHead id="popular-h" title="今週よく見られている神社と一杯" more="もっと見る" />
      <div className="tb-cards">
        {shrines.map((s) => (
          <article key={s.id} className="tb-card">
            <Placeholder label="神社の写真" />
            <div className="tb-in">
              <span className="tag">{s.worry}</span>
              <b>
                <a href={`#shrine-${s.id}`}>{s.name}</a>
              </b>
              <small>
                {s.area}｜{s.access}
              </small>
              <p>
                参拝のあとは <em>{s.afterVisit}</em>
              </p>
              <button
                type="button"
                className="tb-save"
                aria-pressed={saved.has(s.id)}
                aria-label={`${s.name}を保存`}
                onClick={() => toggle(s.id)}
              >
                {saved.has(s.id) ? "♥ 保存済み" : "♡ 保存"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
