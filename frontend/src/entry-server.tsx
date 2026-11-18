// ビルド時の描画（scripts/prerender.mjs から使う）。ブラウザ側は main.tsx。
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createStaticHandler, createStaticRouter, StaticRouterProvider, type HydrationState } from "react-router";
import { routes } from "./router";
import { SavedProvider } from "./saved";
import { staleCheckScript } from "./hydration";
import { HeadCollectorContext, headTagsToHtml, pageHeadTags, type HeadCollector } from "./pageMeta";

export { setApiBase } from "./api";
export { SITE_URL } from "./constants";

export type RenderResult = {
  status: number;
  /**
   * <head> に入れる title・description・canonical・OGP（index.html の <!-- page-meta --> と置き換える）と、
   * 今の URL が書き出した URL と違うかを調べるスクリプト（src/hydration.ts の staleCheckScript）
   */
  head: string;
  /** <div id="root"> の中身 */
  html: string;
  /** ブラウザ側が API を呼び直さずに表示を引き継ぐためのデータ */
  hydrationData: HydrationState;
};

/** path（例：/shrines/atago）を描画する。origin はリクエストの URL を組み立てるのに使う */
export async function render(path: string, origin: string): Promise<RenderResult> {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(new URL(path, origin)));
  if (context instanceof Response) {
    throw new Error(`${path}: リダイレクトされた（${context.status}）`);
  }
  const router = createStaticRouter(handler.dataRoutes, context);
  const collector: HeadCollector = {};
  // hydrate={false}：データの <script> は #root の外に置く（#root の中にあるとハイドレーションで余計な要素になる）
  const html = renderToString(
    <StrictMode>
      <HeadCollectorContext.Provider value={collector}>
        <SavedProvider>
          <StaticRouterProvider router={router} context={context} hydrate={false} />
        </SavedProvider>
      </HeadCollectorContext.Provider>
    </StrictMode>,
  );
  // 書き出すページ（200）は必ず usePageMeta を呼ぶ。エラー画面は既定値＋noindex
  if (!collector.tags && context.statusCode === 200) throw new Error(`${path}: usePageMeta が呼ばれていない`);
  const tags = collector.tags ?? pageHeadTags({ noindex: true }, path);
  return {
    status: context.statusCode,
    head: `${headTagsToHtml(tags)}\n    <script>${staleCheckScript(path)}</script>`,
    html,
    hydrationData: { loaderData: context.loaderData, actionData: context.actionData, errors: context.errors },
  };
}
