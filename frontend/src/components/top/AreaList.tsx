import type { AreaGroup } from "../../types";
import SectionHead from "./SectionHead";

export default function AreaList({ groups }: { groups: AreaGroup[] }) {
  return (
    <section aria-labelledby="area-h">
      <SectionHead id="area-h" title="エリアから探す" />
      <div className="tb-areas">
        {groups.map((g) => (
          <div key={g.name}>
            <b>{g.name}</b>
            {g.areas.map((a) => (
              <a key={a} href={`#area-${a}`}>{a}</a>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
