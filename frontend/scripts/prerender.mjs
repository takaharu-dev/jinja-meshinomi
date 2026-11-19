// ビルド後に、各ページを HTML に書き出す（初期 HTML に本文を入れて、検索エンジンが読めるようにする）。
//   1. dist/index.html（vite build の出力）を SPA 用の空の HTML として dist/spa.html にコピー
//   2. API の sitemap.xml にある URL ＋ EXTRA_PATHS を描画して dist/<パス>/index.html に保存
// 書き出していないページ（保存リスト・クエリ付きの一覧・ビルド後に増えたページ）は spa.html で今までどおり動く。
//
// 環境変数
//   PRERENDER_API_URL  データを取る API（既定：本番の backend）
//   SKIP_PRERENDER=1   書き出さない（Docker など、本番の API を使いたくないとき）
//
// backend のデプロイは待たない（今出ている backend のデータで書き出す）。
// backend のデータを変えたときは、backend の本番デプロイ後に GitHub Actions が frontend を作り直す
// （.github/workflows/rebuild-frontend.yml）。ビルドの中で待つと、同時に走るビルドが1つのとき詰まる（#39）
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { injectPage, outputFile, pathsFromSitemap } from "./prerender-lib.mjs";

const API_URL = (process.env.PRERENDER_API_URL ?? "https://backend-five-navy-16.vercel.app").replace(/\/$/, "");
// sitemap には載せていないが、HTML は書き出しておくページ
const EXTRA_PATHS = ["/contact", "/privacy"];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

await copyFile(join(dist, "index.html"), join(dist, "spa.html"));

if (process.env.SKIP_PRERENDER) {
  console.log("prerender: SKIP_PRERENDER が指定されているので書き出さない");
  process.exit(0);
}

const { render, setApiBase, SITE_URL } = await import(join(root, "dist-server", "entry-server.js"));
setApiBase(API_URL);

const template = await readFile(join(dist, "spa.html"), "utf8");
const sitemap = await fetchText(`${API_URL}/api/sitemap.xml`);
const paths = [...new Set([...pathsFromSitemap(sitemap), ...EXTRA_PATHS])];

for (const path of paths) {
  const page = await render(path, SITE_URL);
  if (page.status !== 200) throw new Error(`prerender: ${path} が ${page.status} になった`);
  if (!page.html.includes("<h1")) throw new Error(`prerender: ${path} に h1 がない`);
  const file = join(dist, outputFile(path));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, injectPage(template, { url: path, ...page }));
}
console.log(`prerender: ${paths.length} ページを書き出した（API: ${API_URL}、コミット ${await apiCommit()}）`);

/** 書き出しに使う API がどのコミットか（ログ用。backend の /api/health） */
async function apiCommit() {
  const commit = await fetch(`${API_URL}/api/health`)
    .then((r) => (r.ok ? r.json() : {}))
    .then((j) => j.commit)
    .catch(() => undefined);
  return commit ? commit.slice(0, 7) : "不明";
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.text();
}
