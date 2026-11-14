import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { INSTAGRAM_URL } from "../constants";
import { searchPath } from "../search";

const LINKS = [
  { label: "悩みから探す", to: "/shrines" },
  { label: "エリアから探す", to: "/areas" },
  { label: "駅から探す", to: "/stations" },
  { label: "特集", to: "/features" },
  { label: "参拝記録", to: "/logs" },
  { label: "♡ 保存リスト", to: "/saved" },
  { label: "このサイトについて", to: "/about" },
  { label: "お問い合わせ", to: "/contact" },
];

type Props = { id: string; onClose: () => void };

/** スマホのメニュー（右から出るパネル） */
export default function SpMenu({ id, onClose }: Props) {
  const navigate = useNavigate();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // 開いている間は後ろのページをスクロールさせない
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="spmenu">
      <div className="spmenu__backdrop" onClick={onClose} aria-hidden="true" />
      <div id={id} className="spmenu__panel" role="dialog" aria-modal="true" aria-label="メニュー">
        <div className="spmenu__head">
          <b>メニュー</b>
          <button ref={closeRef} type="button" className="spmenu__close" aria-label="メニューを閉じる" onClick={onClose}>
            ×
          </button>
        </div>
        <form
          className="msearch spmenu__search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(searchPath(new FormData(e.currentTarget).get("q")));
          }}
        >
          <input type="search" name="q" aria-label="サイト内検索" placeholder="神社名・駅名・キーワード" />
          <button type="submit" className="btn btn--sm">
            検索
          </button>
        </form>
        <nav aria-label="メニュー">
          <ul className="spmenu__links">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={onClose}>
                  {l.label}
                  <span aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                Instagram
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
