import { Link } from "react-router";
import type { Feature } from "../../types";
import Placeholder from "../Placeholder";
import SectionHead from "./SectionHead";

export default function Features({ main, subs }: { main: Feature; subs: Feature[] }) {
  return (
    <section aria-labelledby="feature-h">
      <SectionHead id="feature-h" title="特集" more="特集一覧" to="/features" />
      <div className="tb-feat">
        <Link className="tb-fbig" to={`/features/${main.id}`}>
          <Placeholder label="特集のメイン写真" />
          <div className="tb-fcap">
            <small>FEATURE</small>
            <b>{main.title}</b>
            <span>{main.summary}</span>
          </div>
        </Link>
        <div className="tb-fsmall">
          {subs.map((f) => (
            <Link key={f.id} to={`/features/${f.id}`}>
              <Placeholder />
              <span>
                <b>{f.title}</b>
                <small>{f.summary}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
