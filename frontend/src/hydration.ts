import type { HydrationState } from "react-router";

/** ビルド時に書き出した HTML が window に置く値（scripts/prerender-lib.mjs の injectPage） */
export type PrerenderedWindow = {
  __staticRouterHydrationData?: HydrationState;
  /** 書き出したときの URL（パス＋クエリ） */
  __prerenderedUrl?: string;
};

/** 書き出した HTML と URL が違うときに <html> に付ける属性。付いている間は本文を隠す（global.css） */
export const STALE_ATTR = "data-stale";

/**
 * 書き出したときの URL（rendered）と今の URL が、表示する内容として違うか。
 * 末尾のスラッシュと、広告・SNS の計測で付くだけのクエリ（utm_* / fbclid / gclid / igsh / igshid / _gl）は無視する。
 *
 * <head> のインラインスクリプト（staleCheckScript）でも関数の文字列をそのまま使うので、
 * この関数の外にある変数や関数を使わないこと。
 */
export function isStaleUrl(rendered: string, pathname: string, search: string): boolean {
  const ignored = [/^utm_/, /^fbclid$/, /^gclid$/, /^igsh(id)?$/, /^_gl$/];
  const key = (p: string, q: string) => {
    const path = p.replace(/\/+$/, "") || "/";
    const kept = new URLSearchParams();
    new URLSearchParams(q).forEach((v, k) => {
      if (!ignored.some((re) => re.test(k))) kept.append(k, v);
    });
    const query = kept.toString();
    return query ? `${path}?${query}` : path;
  };
  const url = new URL(rendered, "http://localhost");
  return key(url.pathname, url.search) !== key(pathname, search);
}

/**
 * 書き出した HTML の <head> に入れるスクリプト（中身だけ。<script> タグは付けない）。
 * 書き出した URL を window.__prerenderedUrl に入れ、今の URL と違えば <html> に STALE_ATTR を付ける。
 * JS（main.tsx）が動くまでの間、違うページのデータ（/shrines?worry=career で /shrines の 8件など）を見せないため。
 */
export function staleCheckScript(url: string): string {
  const json = JSON.stringify(url).replace(/</g, "\\u003c");
  return (
    `window.__prerenderedUrl=${json};` +
    `try{if((${isStaleUrl.toString()})(window.__prerenderedUrl,location.pathname,location.search))` +
    `document.documentElement.setAttribute(${JSON.stringify(STALE_ATTR)},"")}catch(e){}`
  );
}

/**
 * 書き出した HTML のデータを、今の URL でそのまま使ってよいか。
 * 書き出したのはクエリなしの URL なので、/shrines?worry=career を開いたときなどは
 * /shrines のデータが入っている。そのときはデータを捨てて、ブラウザで取り直させる。
 */
export function acceptPrerenderedData(win: PrerenderedWindow, location: { pathname: string; search: string }): boolean {
  const rendered = win.__prerenderedUrl;
  const ok = rendered !== undefined && !isStaleUrl(rendered, location.pathname, location.search);
  if (!ok) delete win.__staticRouterHydrationData;
  return ok;
}
