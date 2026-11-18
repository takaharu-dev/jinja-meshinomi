import { describe, expect, it } from "vitest";
import { injectPage, outputFile, pathsFromSitemap } from "./prerender-lib.mjs";

describe("pathsFromSitemap", () => {
  it("<loc> のパスを取り出す", () => {
    const xml = `<?xml version="1.0"?><urlset>
      <url><loc>https://jinja-meshinomi.vercel.app/</loc></url>
      <url><loc>https://jinja-meshinomi.vercel.app/shrines/atago</loc></url>
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
  const template = '<html><body><div id="root"></div><script type="module" src="/a.js"></script></body></html>';

  it("#root に本文、その直後にデータを入れる", () => {
    const out = injectPage(template, { url: "/shrines/atago", html: "<h1>愛宕神社</h1>", hydrationData: { loaderData: { a: 1 } } });
    expect(out).toContain(
      '<div id="root"><h1>愛宕神社</h1></div><script>window.__prerenderedUrl = "/shrines/atago";window.__staticRouterHydrationData = {"loaderData":{"a":1}};</script>',
    );
  });

  it("データ内の </script> で閉じられない", () => {
    const out = injectPage(template, { url: "/</script>", html: "", hydrationData: { s: "</script><script>alert(1)" } });
    expect(out).not.toContain("</script><script>alert(1)");
    expect(out).not.toContain('"/</script>"');
  });

  it("$& などの置換パターンをそのまま入れる", () => {
    expect(injectPage(template, { url: "/", html: "<p>$&</p>", hydrationData: {} })).toContain("<p>$&</p>");
  });
});
