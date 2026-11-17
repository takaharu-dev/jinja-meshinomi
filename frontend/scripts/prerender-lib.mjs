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

/** テンプレート（vite build の index.html）の #root に描画結果とデータを入れる */
export function injectPage(template, { html, hydrationData }) {
  const root = '<div id="root"></div>';
  if (!template.includes(root)) throw new Error("テンプレートに <div id=\"root\"></div> がない");
  // </script> などで閉じられないよう < をエスケープする
  const json = JSON.stringify(hydrationData).replace(/</g, "\\u003c");
  const script = `<script>window.__staticRouterHydrationData = ${json};</script>`;
  return template.replace(root, () => `<div id="root">${html}</div>${script}`);
}
