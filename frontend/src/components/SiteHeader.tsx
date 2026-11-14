import { Link, useLocation, useNavigate } from "react-router";
import Logo from "./Logo";
import { searchPath } from "../search";

const NAV = [
  { label: "悩みから探す", to: "/shrines" },
  { label: "エリアから探す", to: "/areas" },
  { label: "駅から探す", to: "/stations" },
  { label: "特集", to: "#" },
  { label: "このサイトについて", to: "#" },
];

export default function SiteHeader() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  // 今いるページに合わせてメニューを選択中に（TOP・一覧・詳細は「悩みから探す」）
  const current =
    pathname === "/shrines" && new URLSearchParams(search).has("station")
      ? "/stations"
      : pathname === "/" || pathname.startsWith("/shrines")
        ? "/shrines"
        : (NAV.find((n) => n.to !== "#" && pathname.startsWith(n.to))?.to ?? null);

  return (
    <header>
      {/* PC */}
      <div className="util">
        <div className="container">
          <span className="util__lead">悩んだ日に行きたい神社と、参拝後のごはん・地酒が探せるサイト</span>
          <span>
            <Link to="/saved">♡ 保存リスト</Link>　<a href="#">Instagram</a>
          </span>
        </div>
      </div>
      <div className="hd">
        <div className="container">
          <Link to="/" className="logo">
            <Logo color="var(--shu)" accent="var(--ink)" />
            神社めし呑み
          </Link>
          <form
            className="msearch"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(searchPath(new FormData(e.currentTarget).get("q")));
            }}
          >
            <input
              type="search"
              name="q"
              aria-label="サイト内検索"
              placeholder="神社名・駅名・キーワード（例：出世、神楽坂）"
            />
            <button type="submit" className="btn btn--sm">
              検索
            </button>
          </form>
        </div>
      </div>
      <nav className="gnav" aria-label="メインメニュー">
        <div className="container">
          {NAV.map((n) =>
            n.to === "#" ? (
              <a key={n.label} href="#">{n.label}</a>
            ) : (
              <Link key={n.label} to={n.to} aria-current={current === n.to ? "page" : undefined}>
                {n.label}
              </Link>
            ),
          )}
        </div>
      </nav>

      {/* スマホ */}
      <div className="sph">
        <Link to="/" className="logo">
          <Logo size={22} color="#fff" />
          神社めし呑み
        </Link>
        <div className="sph__icons">
          <Link to="/saved" aria-label="保存リスト">♡</Link>
          <button type="button" aria-label="メニュー">☰</button>
        </div>
      </div>
    </header>
  );
}
