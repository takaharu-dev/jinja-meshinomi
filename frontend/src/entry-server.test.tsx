import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { render, setApiBase } from "./entry-server";
import SaveButton from "./components/SaveButton";
import { SavedProvider } from "./saved";

const ORIGIN = "https://jinja-meshinomi.com";

afterEach(() => {
  vi.unstubAllGlobals();
  setApiBase("");
});

describe("render", () => {
  it("本文とヘッダー・フッターのリンクが HTML に入る", async () => {
    const page = await render("/about", ORIGIN);
    expect(page.status).toBe(200);
    expect(page.html).toContain("<h1");
    expect(page.html).toContain('href="/shrines"');
  });

  it("title・description・canonical・OGP を head に入れる（#root には入れない）", async () => {
    const page = await render("/about", ORIGIN);
    expect(page.head).toContain("<title>このサイトについて｜神社めし呑み</title>");
    expect(page.head).toContain('<meta name="description" content="神社めし呑みは、');
    expect(page.head).toContain('<link rel="canonical" href="https://jinja-meshinomi.com/about" />');
    expect(page.head).toContain('<meta property="og:image" content="https://jinja-meshinomi.com/ogp.png" />');
    expect(page.head).toContain('<script>window.__prerenderedUrl="/about";');
    expect(page.html).not.toContain("<title");
    expect(page.html).not.toContain("<meta");
  });

  it("loader のデータを API から取り、hydrationData に入れる", async () => {
    const fetch = vi.fn(async (_url: string) => new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    setApiBase("https://api.example.com/");

    const page = await render("/logs", ORIGIN);
    expect(page.status).toBe(200);
    expect(fetch.mock.calls[0][0]).toBe("https://api.example.com/api/logs");
    expect(Object.values(page.hydrationData.loaderData ?? {})).toContainEqual([]);
  });

  it("API が 404 なら 404", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 404 })));
    const page = await render("/shrines/nope", ORIGIN);
    expect(page.status).toBe(404);
  });

  it("API が落ちていたら 500（ビルドを止める）", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 502 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const page = await render("/logs", ORIGIN);
    expect(page.status).toBe(500);
  });
});

describe("SavedProvider", () => {
  it("サーバー側では保存していない状態で描画する（localStorage を読まない）", () => {
    const getItem = vi.fn(() => '["atago"]');
    vi.stubGlobal("localStorage", { getItem, setItem: vi.fn() });
    const html = renderToString(
      <SavedProvider>
        <SaveButton id="atago" name="愛宕神社" />
      </SavedProvider>,
    );
    expect(html).toContain("♡ 保存");
    expect(getItem).not.toHaveBeenCalled();
  });
});
