import type { ReactNode } from "react";
import { Link } from "react-router";

type FooterLink = { label: string; to: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "悩みから探す",
    links: [
      { label: "仕事・出世", to: "/shrines?worry=career" },
      { label: "恋愛・縁結び", to: "/shrines?worry=love" },
      { label: "縁切り", to: "/shrines?worry=enkiri" },
      { label: "金運", to: "/shrines?worry=money" },
      { label: "厄除け", to: "/shrines?worry=yakuyoke" },
    ],
  },
  {
    title: "エリアから探す",
    links: [
      { label: "港区", to: "/shrines?area=minato" },
      { label: "千代田区", to: "/shrines?area=chiyoda" },
      { label: "中央区", to: "/shrines?area=chuo" },
      { label: "新宿区", to: "/shrines?area=shinjuku" },
      { label: "渋谷区", to: "/shrines?area=shibuya" },
    ],
  },
  {
    title: "神社めし呑みについて",
    links: [
      { label: "このサイトについて", to: "/about" },
      { label: "Instagram", to: "#" },
      { label: "お問い合わせ", to: "/contact" },
      { label: "プライバシーポリシー", to: "/privacy" },
    ],
  },
];

const SP_LINKS: FooterLink[] = [
  { label: "悩みから探す", to: "/shrines" },
  { label: "エリアから探す", to: "/areas" },
  { label: "このサイトについて", to: "/about" },
  { label: "Instagram", to: "#" },
];

function FLink({ link, children }: { link: FooterLink; children: ReactNode }) {
  return link.to === "#" ? <a href="#">{children}</a> : <Link to={link.to}>{children}</Link>;
}

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <>
      <footer className="ft">
        <div className="container">
          <div className="ft__cols">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <b>{col.title}</b>
                {col.links.map((l) => (
                  <FLink key={l.label} link={l}>{l.label}</FLink>
                ))}
              </div>
            ))}
          </div>
          <div className="ft__bt">
            <div className="logo">神社めし呑み</div>
            <small>© {year} 神社めし呑み</small>
          </div>
        </div>
      </footer>

      <footer className="ftsp">
        {SP_LINKS.map((l) => (
          <FLink key={l.label} link={l}>
            {l.label}
            <span aria-hidden="true">›</span>
          </FLink>
        ))}
        <small>© {year} 神社めし呑み</small>
      </footer>
    </>
  );
}
