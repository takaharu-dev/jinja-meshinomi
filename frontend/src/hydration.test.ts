import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryRouter, createStaticHandler } from "react-router";
import { acceptPrerenderedData, pageKey, type PrerenderedWindow } from "./hydration";
import { routes } from "./router";

const ORIGIN = "https://jinja-meshinomi.vercel.app";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pageKey", () => {
  it.each([
    ["/shrines", "", "/shrines"],
    ["/shrines/", "", "/shrines"],
    ["/", "", "/"],
    ["/shrines", "?worry=career", "/shrines?worry=career"],
    ["/shrines/atago", "?utm_source=instagram&igsh=abc&fbclid=x", "/shrines/atago"],
    ["/shrines", "?worry=career&utm_medium=social", "/shrines?worry=career"],
  ])("%s%s → %s", (pathname, search, want) => {
    expect(pageKey(pathname, search)).toBe(want);
  });
});

describe("acceptPrerenderedData", () => {
  const data = () => ({ loaderData: { x: 1 } });

  it("書き出した URL と同じならデータを残す", () => {
    const win: PrerenderedWindow = { __prerenderedUrl: "/shrines/atago", __staticRouterHydrationData: data() };
    expect(acceptPrerenderedData(win, { pathname: "/shrines/atago/", search: "?utm_source=instagram" })).toBe(true);
    expect(win.__staticRouterHydrationData).toEqual(data());
  });

  it.each([
    ["/shrines", "?worry=career"],
    ["/shrines", "?area=minato&k=sake"],
    ["/shrines", "?q=%E6%84%9B%E5%AE%95"],
    ["/shrines", "?station=%E7%A5%9E%E8%B0%B7%E7%94%BA&sort=near"],
    ["/shrines", "?id=atago"],
  ])("クエリが違えばデータを捨てる（%s%s）", (pathname, search) => {
    const win: PrerenderedWindow = { __prerenderedUrl: "/shrines", __staticRouterHydrationData: data() };
    expect(acceptPrerenderedData(win, { pathname, search })).toBe(false);
    expect(win.__staticRouterHydrationData).toBeUndefined();
  });

  it("書き出した URL が入っていない古い HTML ならデータを捨てる", () => {
    const win: PrerenderedWindow = { __staticRouterHydrationData: data() };
    expect(acceptPrerenderedData(win, { pathname: "/shrines", search: "" })).toBe(false);
    expect(win.__staticRouterHydrationData).toBeUndefined();
  });
});

describe("書き出した /shrines を /shrines?worry=career で開いたとき", () => {
  const all = { items: Array.from({ length: 8 }, (_, i) => ({ id: `s${i}` })), total: 8 };
  const career = { items: all.items.slice(0, 4), total: 4 };

  /** ビルド時に /shrines を書き出して、ブラウザで url を開いたときの router の状態を返す */
  async function open(url: string) {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(all), { status: 200 })));
    // entry-server の render と同じ方法でデータを取る（画面の描画は省く）
    const context = await createStaticHandler(routes).query(new Request(`${ORIGIN}/shrines`));
    if (context instanceof Response) throw new Error("redirect");
    const win: PrerenderedWindow = { __prerenderedUrl: "/shrines", __staticRouterHydrationData: { loaderData: context.loaderData } };

    const fetch = vi.fn(async (req: string) =>
      new Response(JSON.stringify(req.includes("worry=career") ? career : all), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetch);
    const { pathname, search } = new URL(url, ORIGIN);
    acceptPrerenderedData(win, { pathname, search });
    const router = createMemoryRouter(routes, { initialEntries: [url], hydrationData: win.__staticRouterHydrationData });
    await vi.waitFor(() => expect(router.state.initialized).toBe(true));
    const loaderData = Object.values(router.state.loaderData);
    router.dispose();
    return { fetch, loaderData };
  }

  it("埋め込みデータ（8件）を使わず、API から取り直す（4件）", async () => {
    const { fetch, loaderData } = await open("/shrines?worry=career");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe("/api/shrines?worry=career");
    expect(loaderData).toContainEqual(career);
    expect(loaderData).not.toContainEqual(all);
  });

  it("クエリなしで開いたら、埋め込みデータをそのまま使う（API を呼ばない）", async () => {
    const { fetch, loaderData } = await open("/shrines");
    expect(fetch).not.toHaveBeenCalled();
    expect(loaderData).toContainEqual(all);
  });
});
