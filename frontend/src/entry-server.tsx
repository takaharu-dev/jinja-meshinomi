// ビルド時の描画（scripts/prerender.mjs から使う）。ブラウザ側は main.tsx。
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createStaticHandler, createStaticRouter, StaticRouterProvider, type HydrationState } from "react-router";
import { routes } from "./router";
import { SavedProvider } from "./saved";

export { setApiBase } from "./api";

export type RenderResult = {
  status: number;
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
  // hydrate={false}：データの <script> は #root の外に置く（#root の中にあるとハイドレーションで余計な要素になる）
  const html = renderToString(
    <StrictMode>
      <SavedProvider>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </SavedProvider>
    </StrictMode>,
  );
  return {
    status: context.statusCode,
    html,
    hydrationData: { loaderData: context.loaderData, actionData: context.actionData, errors: context.errors },
  };
}
