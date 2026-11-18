// prerender.mjs の中で使う、副作用のない処理（テストは prerender-lib.test.ts）

/** sitemap.xml の <loc> からパス（例：/shrines/atago）を取り出す */
export function pathsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1].trim()).pathname);
}

/** パスから書き出すファイル（dist からの相対パス）を決める。/ → index.html、/shrines/atago → shrines/atago/index.html */
export function outputFile(path) {
  const clean = path.replace(/^\/+|\/+$/g, "");
  if (clean.split("/").some((seg) => seg === ".." || seg === ".")) throw new Error(`不正なパス: ${path}`);
  return clean === "" ? "index.html" : `${clean}/index.html`;
}

/**
 * テンプレート（vite build の index.html）の #root に描画結果とデータを入れる。
 * url（描画した URL）も入れておき、ブラウザ側で今の URL と違えばデータを捨てる（src/hydration.ts）
 */
export function injectPage(template, { url, head, html, hydrationData }) {
  const root = '<div id="root"></div>';
  if (!template.includes(root)) throw new Error("テンプレートに <div id=\"root\"></div> がない");
  // title・description・OGP の既定値（index.html）をページごとの値に置き換える
  const meta = /<!-- page-meta -->[\s\S]*?<!-- \/page-meta -->/;
  if (!meta.test(template)) throw new Error("テンプレートに <!-- page-meta --> 〜 <!-- /page-meta --> がない");
  template = template.replace(meta, () => `<!-- page-meta -->\n    ${head}\n    <!-- /page-meta -->`);
  // </script> などで閉じられないよう < をエスケープする
  const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c");
  const script = `<script>window.__prerenderedUrl = ${json(url)};window.__staticRouterHydrationData = ${json(hydrationData)};</script>`;
  return template.replace(root, () => `<div id="root">${html}</div>${script}`);
}
