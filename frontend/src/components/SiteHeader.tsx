import Logo from "./Logo";

const NAV = ["悩みから探す", "エリアから探す", "駅から探す", "特集", "このサイトについて"];

export default function SiteHeader() {
  return (
    <header>
      {/* PC */}
      <div className="util">
        <div className="container">
          <span className="util__lead">悩んだ日に行きたい神社と、参拝後のごはん・地酒が探せるサイト</span>
          <span>
            <a href="#">♡ 保存リスト</a>　<a href="#">Instagram</a>
          </span>
        </div>
      </div>
      <div className="hd">
        <div className="container">
          <a href="/" className="logo">
            <Logo color="var(--shu)" accent="var(--ink)" />
            神社めし呑み
          </a>
          <form className="msearch" role="search" onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
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
          {NAV.map((label, i) => (
            <a key={label} href="#" aria-current={i === 0 ? "page" : undefined}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* スマホ */}
      <div className="sph">
        <a href="/" className="logo">
          <Logo size={22} color="#fff" />
          神社めし呑み
        </a>
        <div className="sph__icons">
          <button type="button" aria-label="保存リスト">♡</button>
          <button type="button" aria-label="メニュー">☰</button>
        </div>
      </div>
    </header>
  );
}
