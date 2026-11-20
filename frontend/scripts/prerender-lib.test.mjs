import { describe, expect, it } from "vitest";
import { injectPage, outputFile, pathsFromSitemap } from "./prerender-lib.mjs";

describe("pathsFromSitemap", () => {
  it("<loc> のパスを取り出す", () => {
    const xml = `<?xml version="1.0"?><urlset>
      <url><loc>https://jinja-meshinomi.com/</loc></url>
      <url><loc>https://jinja-meshinomi.com/shrines/atago</loc></url>
    </urlset>`;
    expect(pathsFromSitemap(xml)).toEqual(["/", "/shrines/atago"]);
  });
});

describe("outputFile", () => {
  it.each([
    ["/", "index.html"],
    ["/about", "about/index.html"],
    ["/shrines/atago", "shrines/atago/index.html"],
    ["/logs/2026-10-24-hie/", "logs/2026-10-24-hie/index.html"],
  ])("%s → %s", (path, want) => {
    expect(outputFile(path)).toBe(want);
  });

  it("dist の外には書かない", () => {
    expect(() => outputFile("/../etc")).toThrow();
  });
});

describe("injectPage", () => {
  const template =
    '<html><head><!-- page-meta --><title>神社めし呑み</title><!-- /page-meta --></head><body><div id="root"></div><script type="module" src="/a.js"></script></body></html>';

  it("#root に本文、その直後にデータを入れる", () => {
    const out = injectPage(template, { head: "<title>愛宕神社</title>", html: "<h1>愛宕神社</h1>", hydrationData: { loaderData: { a: 1 } } });
    expect(out).toContain('<div id="root"><h1>愛宕神社</h1></div><script>window.__staticRouterHydrationData = {"loaderData":{"a":1}};</script>');
  });

  it("head の既定値（page-meta の間）をページの値に置き換える", () => {
    const out = injectPage(template, { head: "<title>愛宕神社</title>", html: "", hydrationData: {} });
    expect(out).toContain("<!-- page-meta -->\n    <title>愛宕神社</title>\n    <!-- /page-meta -->");
    expect(out).not.toContain("<title>神社めし呑み</title>");
  });

  it("page-meta の印がなければ止める", () => {
    expect(() => injectPage('<div id="root"></div>', { head: "", html: "", hydrationData: {} })).toThrow();
  });

  it("データ内の </script> で閉じられない", () => {
    const out = injectPage(template, { head: "", html: "", hydrationData: { s: "</script><script>alert(1)" } });
    expect(out).not.toContain("</script><script>alert(1)");
  });

  it("$& などの置換パターンをそのまま入れる", () => {
    const out = injectPage(template, { head: "<title>$&</title>", html: "<p>$&</p>", hydrationData: {} });
    expect(out).toContain("<p>$&</p>");
    expect(out).toContain("<title>$&</title>");
  });
});
