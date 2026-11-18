// ビルド後に、各ページを HTML に書き出す（初期 HTML に本文を入れて、検索エンジンが読めるようにする）。
//   1. dist/index.html（vite build の出力）を SPA 用の空の HTML として dist/spa.html にコピー
//   2. API の sitemap.xml にある URL ＋ EXTRA_PATHS を描画して dist/<パス>/index.html に保存
// 書き出していないページ（保存リスト・クエリ付きの一覧・ビルド後に増えたページ）は spa.html で今までどおり動く。
//
// 環境変数
//   PRERENDER_API_URL  データを取る API（既定：本番の backend）
//   SKIP_PRERENDER=1   書き出さない（Docker など、本番の API を使いたくないとき）
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { injectPage, outputFile, pathsFromSitemap } from "./prerender-lib.mjs";

const SITE_URL = "https://jinja-meshinomi.vercel.app";
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

await waitForBackend();

const { render, setApiBase } = await import(join(root, "dist-server", "entry-server.js"));
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
console.log(`prerender: ${paths.length} ページを書き出した（API: ${API_URL}）`);

/**
 * Vercel の本番ビルドでは、backend も同じコミットでデプロイされるのを待つ。
 * frontend と backend は main への push で同時にビルドされるので、待たないと古いデータで書き出してしまう。
 */
async function waitForBackend() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (process.env.VERCEL_ENV !== "production" || !sha || process.env.PRERENDER_API_URL) return;
  const deadline = Date.now() + 10 * 60 * 1000;
  for (;;) {
    const commit = await fetch(`${API_URL}/api/health`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((j) => j.commit)
      .catch(() => undefined);
    if (commit === sha) return;
    if (Date.now() > deadline) {
      throw new Error(`prerender: backend が ${sha.slice(0, 7)} にならない（今：${commit || "不明"}）。backend のデプロイを確認してください`);
    }
    console.log(`prerender: backend のデプロイ待ち（今：${commit ? commit.slice(0, 7) : "不明"}）`);
    await new Promise((r) => setTimeout(r, 10_000));
  }
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.text();
}
