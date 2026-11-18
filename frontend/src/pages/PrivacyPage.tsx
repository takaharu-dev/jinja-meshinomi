import { Link } from "react-router";
import { usePageMeta } from "../pageMeta";
import { LEADS } from "../descriptions";
import "./DocPage.css";

// ひな形。公開前に内容を確認する
export default function PrivacyPage() {
  usePageMeta({ title: "プライバシーポリシー", description: LEADS.privacy });
  return (
    <article className="container doc">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ プライバシーポリシー
        </nav>
        <h1>プライバシーポリシー</h1>
        <p className="doc__lead">
          {LEADS.privacy}
        </p>
      </div>

      <section>
        <h2>1. アクセス解析について</h2>
        <p>
          当サイトでは、サイトの利用状況を把握し、より使いやすいサイトにするために、Google が提供するアクセス解析ツール「Google
          アナリティクス」を利用しています。
        </p>
        <p>
          Google アナリティクスは Cookie を使って、閲覧したページ、滞在時間、おおまかな地域、使っている端末やブラウザなどの情報を収集します。これらの情報に、氏名など個人を特定する情報は含まれません。
        </p>
        <p>
          収集された情報は Google のプライバシーポリシーに基づいて管理されます。詳しくは「
          <a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noopener noreferrer">
            Google のサービスを使用するサイトやアプリから収集した情報の Google による使用
          </a>
          」をご覧ください。
        </p>
        <p>
          Cookie はブラウザの設定で無効にできます。また、「
          <a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener noreferrer">
            Google アナリティクス オプトアウト アドオン
          </a>
          」を使うと、Google アナリティクスによる収集を止められます。
        </p>
      </section>

      <section>
        <h2>2. お問い合わせでいただく情報について</h2>
        <p>
          お問い合わせは Instagram の DM で受け付けています。その際にいただく Instagram のアカウント名やメッセージの内容は、お問い合わせへの回答と、掲載内容の確認・修正のためにだけ使います。
        </p>
      </section>

      <section>
        <h2>3. 保存リストについて</h2>
        <p>
          「♡ 保存」した神社の一覧は、お使いのブラウザ内（ローカルストレージ）に保存され、当サイトのサーバーには保存されません。保存リストを表示する際は、神社の情報を取得するための通信を行います。
        </p>
        <p>ブラウザのサイトデータを削除すると、保存リストも消えます。</p>
      </section>

      <section>
        <h2>4. 第三者への提供</h2>
        <p>法令に基づく場合を除き、いただいた情報を本人の同意なく第三者に提供することはありません。</p>
      </section>

      <section>
        <h2>5. 外部サイトへのリンク</h2>
        <p>
          当サイトには Instagram や Google マップなど、外部のサイトへのリンクがあります。リンク先での情報の取り扱いは、それぞれのサイトのプライバシーポリシーをご確認ください。
        </p>
      </section>

      <section>
        <h2>6. このポリシーの変更</h2>
        <p>このポリシーは、必要に応じて内容を変更することがあります。変更後の内容は、このページに掲載した時点から有効になります。</p>
      </section>

      <section>
        <h2>7. お問い合わせ先</h2>
        <p>
          このポリシーについてのお問い合わせは、<Link to="/contact">お問い合わせ</Link>からお願いします。
        </p>
      </section>

      <p className="doc__updated">制定日：2026年11月14日</p>
    </article>
  );
}
