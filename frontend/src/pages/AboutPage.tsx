import { Link } from "react-router";
import { INSTAGRAM_URL, INSTAGRAM_USER } from "../constants";
import { useDocumentTitle } from "../useDocumentTitle";
import "./DocPage.css";

// 文章は仮置き。あとで差し替える想定
const GUIDES = [
  { to: "/shrines", title: "悩みから探す", text: "仕事・恋愛・金運など、今の悩みに合う神社を探せます。" },
  { to: "/areas", title: "エリアから探す", text: "行きたいエリアの神社と、近くのお店を探せます。" },
  { to: "/stations", title: "駅から探す", text: "最寄り駅から行ける神社を探せます。" },
  { to: "/features", title: "特集", text: "気分やテーマに合わせて、神社と一杯を選んでいます。" },
  { to: "/logs", title: "参拝記録", text: "実際にお参りした神社と、帰りに寄ったお店の記録です。" },
  { to: "/saved", title: "保存リスト", text: "「♡」を押した神社をまとめて見られます。" },
];

export default function AboutPage() {
  useDocumentTitle("このサイトについて");
  return (
    <article className="container doc">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ このサイトについて
        </nav>
        <h1>このサイトについて</h1>
        <p className="doc__lead">
          神社めし呑みは、悩んだ日に行きたい神社と、参拝のあとに寄りたいごはん・地酒のお店を紹介するサイトです。
        </p>
      </div>

      <section>
        <h2>モヤモヤした日は、神社と一杯。</h2>
        <p>
          仕事のこと、恋愛のこと、なんとなく流れが悪いと感じるとき。神社にお参りして気持ちを切り替えたら、帰りにおいしいごはんとお酒でひと息つく。そんな一日の過ごし方を、悩みごとに提案しています。
        </p>
        <p>
          参拝の雰囲気や帰りの一杯は、Instagram のリールでも紹介しています。
        </p>
      </section>

      <section>
        <h2>使い方</h2>
        <ul className="doc-links">
          {GUIDES.map((g) => (
            <li key={g.to}>
              <Link to={g.to}>
                <b>{g.title} ›</b>
                <span>{g.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>掲載している情報について</h2>
        <div className="doc__note">
          <ul>
            <li>参拝時間や御朱印の受付時間、お店の営業時間などは変わることがあります。お出かけ前に、各神社・お店の公式情報をご確認ください。</li>
            <li>参拝の際は、神社のきまりやマナーを守ってお参りしましょう。</li>
            <li>お酒は二十歳になってから。飲酒運転は絶対にやめましょう。</li>
          </ul>
        </div>
      </section>

      <section>
        <h2>運営</h2>
        <p>
          神社めし呑み（Instagram：
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            @{INSTAGRAM_USER}
          </a>
          ）
        </p>
        <p>
          ご意見・掲載内容の誤りなどは、<Link to="/contact">お問い合わせ</Link>からお知らせください。
        </p>
      </section>
    </article>
  );
}
