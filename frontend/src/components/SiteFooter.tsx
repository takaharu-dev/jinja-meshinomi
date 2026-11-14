const COLUMNS = [
  { title: "悩みから探す", links: ["仕事・出世", "恋愛・縁結び", "縁切り", "金運", "厄除け"] },
  { title: "エリアから探す", links: ["港区", "千代田区", "中央区", "新宿区", "渋谷区"] },
  { title: "神社めし呑みについて", links: ["このサイトについて", "Instagram", "お問い合わせ", "プライバシーポリシー"] },
];

const SP_LINKS = ["悩みから探す", "エリアから探す", "このサイトについて", "Instagram"];

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
                  <a key={l} href="#">{l}</a>
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
          <a key={l} href="#">
            {l}
            <span aria-hidden="true">›</span>
          </a>
        ))}
        <small>© {year} 神社めし呑み</small>
      </footer>
    </>
  );
}
