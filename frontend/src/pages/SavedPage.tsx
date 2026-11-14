import { Link, useLoaderData } from "react-router";
import type { ShrineItem } from "../types";
import ShrineRow from "../components/list/ShrineRow";
import { useDocumentTitle } from "../useDocumentTitle";
import "./ShrineListPage.css";

export default function SavedPage() {
  // 開いた時点の保存リスト。♡ を外してもすぐには消さない（押し間違えたときに戻せるように）
  const items = useLoaderData() as ShrineItem[];
  useDocumentTitle("保存リスト");

  return (
    <div className="container lpage">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ 保存リスト
        </nav>
        <h1>
          保存リスト
          <em>{items.length}件</em>
        </h1>
      </div>

      <div className="lbody saved">
        {items.map((s) => (
          <ShrineRow key={s.id} shrine={s} />
        ))}
        {items.length === 0 && (
          <div className="empty saved__empty">
            <p>まだ保存した神社はありません。</p>
            <p>気になる神社の「♡」を押すと、ここに並びます。</p>
            <Link to="/shrines" className="btn">
              神社を探す
            </Link>
          </div>
        )}
        {items.length > 0 && (
          <p className="saved__note">保存リストはこのブラウザに保存されています。別の端末やブラウザでは表示されません。</p>
        )}
      </div>
    </div>
  );
}
