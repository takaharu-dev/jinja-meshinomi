import { Link, useNavigate } from "react-router";
import type { Option } from "../../types";
import { searchPath } from "../../search";

export default function Hero({ worries }: { worries: Option[] }) {
  const navigate = useNavigate();
  return (
    <section className="tb-hero">
      <div className="container">
        <h1 className="tb-catch">モヤモヤした日は、神社と一杯。</h1>
        <form
          className="tb-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            navigate(searchPath(f.get("area"), f.get("q")));
          }}
        >
          <label>
            <span>エリア・駅</span>
            <input type="text" name="area" placeholder="例：港区、神楽坂駅" />
          </label>
          <label>
            <span>悩み・キーワード</span>
            <input type="text" name="q" placeholder="例：出世、縁結び、日本酒" />
          </label>
          <button type="submit" className="btn">検索</button>
        </form>
        <nav className="tb-worries" aria-label="悩みから探す">
          {worries.map((w) => (
            <Link key={w.slug} to={`/shrines?worry=${w.slug}`}>
              <i aria-hidden="true">{w.icon}</i>
              {w.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
