import { Link } from "react-router";
import { useDocumentTitle } from "../useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("ページが見つかりません");
  return (
    <div className="container notfound">
      <h1>ページが見つかりません</h1>
      <p>URLが変わったか、ページが削除された可能性があります。</p>
      <Link to="/" className="btn">TOPへ戻る</Link>
    </div>
  );
}
