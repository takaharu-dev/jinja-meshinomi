import { Link } from "react-router";
import { INSTAGRAM_URL, INSTAGRAM_USER } from "../constants";
import { usePageMeta } from "../pageMeta";
import { LEADS } from "../descriptions";
import "./DocPage.css";

export default function ContactPage() {
  usePageMeta({ title: "お問い合わせ", description: LEADS.contact });
  return (
    <article className="container doc">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ お問い合わせ
        </nav>
        <h1>お問い合わせ</h1>
        <p className="doc__lead">
          {LEADS.contact}
        </p>
      </div>

      <section>
        <div className="doc-cta">
          <p>
            Instagram：<b>@{INSTAGRAM_USER}</b>
          </p>
          <a className="btn" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            Instagram を開いて DM を送る
          </a>
          <small>Instagram のアカウントが必要です。プロフィール画面の「メッセージ」から送れます。</small>
        </div>
      </section>

      <section>
        <h2>DM に書いていただきたいこと</h2>
        <ul>
          <li>お問い合わせの内容</li>
          <li>神社やお店についてのお問い合わせの場合は、その名前</li>
          <li>掲載内容の誤りの場合は、そのページの URL と、誤りの内容</li>
        </ul>
      </section>

      <section>
        <h2>ご注意</h2>
        <div className="doc__note">
          <ul>
            <li>お返事までお時間をいただくことがあります。内容によってはお返事できない場合もあります。</li>
            <li>参拝時間や御朱印、お店の営業時間・予約などは、各神社・お店に直接お問い合わせください。</li>
            <li>
              いただいた情報の扱いは、<Link to="/privacy">プライバシーポリシー</Link>をご覧ください。
            </li>
          </ul>
        </div>
      </section>
    </article>
  );
}
