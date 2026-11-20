import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryRouter, createStaticHandler } from "react-router";
import { acceptPrerenderedData, isStaleUrl, staleCheckScript, type PrerenderedWindow } from "./hydration";
import { routes } from "./router";

const ORIGIN = "https://jinja-meshinomi.com";

afterEach(() => {
  vi.unstubAllGlobals();
});

// [書き出した URL, 開いた pathname, 開いた search, 違うか]
const CASES: [string, string, string, boolean][] = [
  ["/shrines", "/shrines", "", false],
  ["/shrines", "/shrines/", "", false],
  ["/", "/", "", false],
  ["/shrines/atago", "/shrines/atago", "?utm_source=instagram&igsh=abc&fbclid=x&gclid=y&_gl=z&igshid=w", false],
  ["/shrines", "/shrines", "?worry=career", true],
  ["/shrines", "/shrines", "?worry=career&utm_medium=social", true],
  ["/shrines", "/shrines", "?area=minato&k=sake", true],
  ["/shrines", "/shrines", "?station=%E8%B5%A4%E5%9D%82%E9%A7%85&sort=near", true],
  ["/shrines", "/shrines", "?q=%E6%84%9B%E5%AE%95", true],
  ["/shrines", "/shrines", "?id=atago", true],
  ["/shrines/atago", "/shrines/atago", "?foo=1", true],
  ["/shrines/atago", "/shrines/hie", "", true],
];

describe("isStaleUrl", () => {
  it.each(CASES)("書き出し %s / 開いた %s%s → %s", (rendered, pathname, search, want) => {
    expect(isStaleUrl(rendered, pathname, search)).toBe(want);
  });
});

describe("staleCheckScript", () => {
  /** head のスクリプトを、window・location・document だけがある環境で動かす */
  function run(script: string, pathname: string, search: string) {
    const win: { __prerenderedUrl?: string } = {};
    const attrs: Record<string, string> = {};
    const document = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
    new Function("window", "location", "document", script)(win, { pathname, search }, document);
    return { win, stale: "data-stale" in attrs };
  }

  it.each(CASES)("isStaleUrl と同じ結果になる（書き出し %s / 開いた %s%s → %s）", (rendered, pathname, search, want) => {
    const { win, stale } = run(staleCheckScript(rendered), pathname, search);
    expect(win.__prerenderedUrl).toBe(rendered);
    expect(stale).toBe(want);
  });

  it("URL に </script> があっても閉じられない", () => {
    expect(staleCheckScript("/</script><script>alert(1)")).not.toContain("</script>");
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
