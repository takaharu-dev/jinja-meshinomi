import type { HydrationState } from "react-router";

/** ビルド時に書き出した HTML が window に置く値（scripts/prerender-lib.mjs の injectPage） */
export type PrerenderedWindow = {
  __staticRouterHydrationData?: HydrationState;
  /** 書き出したときの URL（パス＋クエリ） */
  __prerenderedUrl?: string;
};

// 広告・SNS の計測で付くだけで、表示する内容は変わらないクエリ
const IGNORED_PARAMS = [/^utm_/, /^fbclid$/, /^gclid$/, /^igsh(id)?$/, /^_gl$/];

/** URL を比べられる形にそろえる（末尾のスラッシュを外し、計測用のクエリを除く） */
export function pageKey(pathname: string, search: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  const params = [...new URLSearchParams(search)].filter(([key]) => !IGNORED_PARAMS.some((re) => re.test(key)));
  const query = new URLSearchParams(params).toString();
  return query ? `${path}?${query}` : path;
}

/**
 * 書き出した HTML のデータを、今の URL でそのまま使ってよいか。
 * 書き出したのはクエリなしの URL なので、/shrines?worry=career を開いたときなどは
 * /shrines のデータが入っている。そのときはデータを捨てて、ブラウザで取り直させる。
 */
export function acceptPrerenderedData(win: PrerenderedWindow, location: { pathname: string; search: string }): boolean {
  const rendered = win.__prerenderedUrl;
  const ok =
    rendered !== undefined &&
    (() => {
      const url = new URL(rendered, "http://localhost");
      return pageKey(url.pathname, url.search) === pageKey(location.pathname, location.search);
    })();
  if (!ok) delete win.__staticRouterHydrationData;
  return ok;
}
