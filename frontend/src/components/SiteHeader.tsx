import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import Logo from "./Logo";
import SpMenu from "./SpMenu";
import { INSTAGRAM_URL } from "../constants";
import { searchPath } from "../search";

const NAV = [
  { label: "悩みから探す", to: "/shrines" },
  { label: "エリアから探す", to: "/areas" },
  { label: "駅から探す", to: "/stations" },
  { label: "特集", to: "/features" },
  { label: "このサイトについて", to: "/about" },
];

export default function SiteHeader() {
  const { pathname, search, key } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButton.current?.focus();
  }, []);
  // ページを移動したらメニューを閉じる
  useEffect(() => setMenuOpen(false), [key]);
  // 今いるページに合わせてメニューを選択中に（TOP・一覧・詳細は「悩みから探す」）
  const current =
    pathname === "/shrines" && new URLSearchParams(search).has("station")
      ? "/stations"
      : pathname === "/" || pathname.startsWith("/shrines")
        ? "/shrines"
        : (NAV.find((n) => pathname.startsWith(n.to))?.to ?? null);

  return (
    <header>
      {/* PC */}
      <div className="util">
        <div className="container">
          <span className="util__lead">悩んだ日に行きたい神社と、参拝後のごはん・地酒が探せるサイト</span>
          <span>
            <Link to="/saved">♡ 保存リスト</Link>　<a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
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
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} aria-current={current === n.to ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
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
          <button
            ref={menuButton}
            type="button"
            aria-label="メニューを開く"
            aria-expanded={menuOpen}
            aria-controls="sp-menu"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>
        </div>
      </div>
      {menuOpen && <SpMenu id="sp-menu" onClose={closeMenu} />}
    </header>
  );
}
