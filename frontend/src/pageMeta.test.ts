// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { applyHeadTags, canonicalUrl, clampText, headTagsToHtml, pageHeadTags } from "./pageMeta";

describe("canonicalUrl", () => {
  it.each([
    ["/", "https://jinja-meshinomi.vercel.app/"],
    ["/shrines", "https://jinja-meshinomi.vercel.app/shrines"],
    ["/shrines/", "https://jinja-meshinomi.vercel.app/shrines"],
    ["/shrines/atago//", "https://jinja-meshinomi.vercel.app/shrines/atago"],
  ])("%s → %s", (pathname, want) => {
    expect(canonicalUrl(pathname)).toBe(want);
  });
});

describe("clampText", () => {
  it("短ければそのまま", () => expect(clampText("愛宕神社。")).toBe("愛宕神社。"));
  it("長ければ … で切る（文字数で数える）", () => {
    const out = clampText("あ".repeat(130), 120);
    expect([...out]).toHaveLength(120);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("pageHeadTags", () => {
  const find = (tags: ReturnType<typeof pageHeadTags>, key: string) =>
    tags.find((t) => (t.tag === "title" ? key === "title" : t.key === key))?.value;

  it("ページ名・説明文・canonical・OGP を出す", () => {
    const tags = pageHeadTags({ title: "愛宕神社", description: "説明", type: "article" }, "/shrines/atago/");
    expect(find(tags, "title")).toBe("愛宕神社｜神社めし呑み");
    expect(find(tags, "description")).toBe("説明");
    expect(find(tags, "canonical")).toBe("https://jinja-meshinomi.vercel.app/shrines/atago");
    expect(find(tags, "og:title")).toBe("愛宕神社｜神社めし呑み");
    expect(find(tags, "og:description")).toBe("説明");
    expect(find(tags, "og:type")).toBe("article");
    expect(find(tags, "og:url")).toBe("https://jinja-meshinomi.vercel.app/shrines/atago");
    expect(find(tags, "og:image")).toBe("https://jinja-meshinomi.vercel.app/ogp.png");
    expect(find(tags, "og:site_name")).toBe("神社めし呑み");
    expect(find(tags, "twitter:card")).toBe("summary_large_image");
    expect(find(tags, "robots")).toBeUndefined();
  });

  it("省略したらサイト名・サイトの説明文・website", () => {
    const tags = pageHeadTags({}, "/");
    expect(find(tags, "title")).toBe("神社めし呑み");
    expect(find(tags, "description")).toContain("モヤモヤした日は、神社と一杯。");
    expect(find(tags, "og:type")).toBe("website");
    expect(find(tags, "canonical")).toBe("https://jinja-meshinomi.vercel.app/");
  });

  it("noindex のページは robots を出し、canonical・og:url は出さない", () => {
    const tags = pageHeadTags({ title: "保存リスト", noindex: true }, "/saved");
    expect(find(tags, "robots")).toBe("noindex");
    expect(find(tags, "canonical")).toBeUndefined();
    expect(find(tags, "og:url")).toBeUndefined();
  });
});

describe("headTagsToHtml", () => {
  it("属性値をエスケープする", () => {
    const html = headTagsToHtml(pageHeadTags({ title: '"><script>', description: "A & B" }, "/"));
    expect(html).toContain("<title>&quot;&gt;&lt;script&gt;｜神社めし呑み</title>");
    expect(html).toContain('<meta name="description" content="A &amp; B" />');
    expect(html).not.toContain("<script>");
  });
});

describe("applyHeadTags", () => {
  it("head のタグを書き換え、無いタグは作り、要らないタグは消す", () => {
    document.head.innerHTML = '<title>old</title><meta name="description" content="old" />';
    applyHeadTags(pageHeadTags({ title: "愛宕神社", description: "説明" }, "/shrines/atago"));
    expect(document.title).toBe("愛宕神社｜神社めし呑み");
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute("content")).toBe("説明");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://jinja-meshinomi.vercel.app/shrines/atago");
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe("https://jinja-meshinomi.vercel.app/shrines/atago");

    applyHeadTags(pageHeadTags({ title: "ページが見つかりません", noindex: true }, "/nope"));
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('meta[property="og:url"]')).toBeNull();
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex");

    applyHeadTags(pageHeadTags({ title: "特集" }, "/features"));
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });
});
