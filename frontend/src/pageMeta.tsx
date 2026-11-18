// ページごとの <title>・description・canonical・OGP。
// ブラウザでは document.head を書き換え、ビルド時の描画では HeadCollector に集めて HTML の <head> に入れる。
import { createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router";
import { OGP_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./constants";

export type PageMeta = {
  /** ページ名（サイト名は自動で付ける）。省略するとサイト名だけ */
  title?: string;
  /** 省略するとサイトの説明文 */
  description?: string;
  /** 詳細ページ（神社・特集・参拝記録）は article、それ以外は website */
  type?: "website" | "article";
  /** 検索結果に出さない（保存リスト・404） */
  noindex?: boolean;
};

/** <head> に入れるタグ。name / property の meta、rel の link、title */
export type HeadTag =
  | { tag: "title"; value: string }
  | { tag: "meta"; attr: "name" | "property"; key: string; value: string }
  | { tag: "link"; key: "canonical"; value: string };

const DESCRIPTION_MAX = 120;

/** description は長すぎると検索結果で切られるので、DESCRIPTION_MAX 文字で切る */
export function clampText(text: string, max = DESCRIPTION_MAX): string {
  const chars = [...text.replace(/\s+/g, " ").trim()];
  return chars.length <= max ? chars.join("") : `${chars.slice(0, max - 1).join("")}…`;
}

/**
 * canonical の URL。クエリは付けない（/shrines?worry=career → /shrines）、末尾のスラッシュは外す。
 * 悩み別の一覧は、静的なパス（/worries/career など）を作ったときにそのパスを canonical にする。
 */
export function canonicalUrl(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  return SITE_URL + (path === "/" ? "/" : path);
}

/** ページの情報から <head> のタグを組み立てる。notFound のページは canonical・og:url を出さない */
export function pageHeadTags(meta: PageMeta, pathname: string): HeadTag[] {
  const title = meta.title ? `${meta.title}｜${SITE_NAME}` : SITE_NAME;
  const description = clampText(meta.description || SITE_DESCRIPTION);
  const url = meta.noindex ? undefined : canonicalUrl(pathname);
  const tags: HeadTag[] = [
    { tag: "title", value: title },
    { tag: "meta", attr: "name", key: "description", value: description },
  ];
  if (meta.noindex) tags.push({ tag: "meta", attr: "name", key: "robots", value: "noindex" });
  if (url) tags.push({ tag: "link", key: "canonical", value: url });
  tags.push(
    { tag: "meta", attr: "property", key: "og:title", value: title },
    { tag: "meta", attr: "property", key: "og:description", value: description },
    { tag: "meta", attr: "property", key: "og:type", value: meta.type ?? "website" },
    ...(url ? [{ tag: "meta", attr: "property", key: "og:url", value: url } as HeadTag] : []),
    { tag: "meta", attr: "property", key: "og:image", value: OGP_IMAGE },
    { tag: "meta", attr: "property", key: "og:site_name", value: SITE_NAME },
    { tag: "meta", attr: "name", key: "twitter:card", value: "summary_large_image" },
  );
  return tags;
}

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** ビルド時の描画用：タグを HTML の文字列にする */
export function headTagsToHtml(tags: HeadTag[]): string {
  return tags
    .map((t) =>
      t.tag === "title"
        ? `<title>${escapeAttr(t.value)}</title>`
        : t.tag === "link"
          ? `<link rel="${t.key}" href="${escapeAttr(t.value)}" />`
          : `<meta ${t.attr}="${t.key}" content="${escapeAttr(t.value)}" />`,
    )
    .join("\n    ");
}

// ページによって出したり出さなかったりするタグ（無いときは消す）
const OPTIONAL: { selector: string; key: string }[] = [
  { selector: 'meta[name="robots"]', key: "robots" },
  { selector: 'link[rel="canonical"]', key: "canonical" },
  { selector: 'meta[property="og:url"]', key: "og:url" },
];

/** ブラウザ用：document.head をタグのとおりに書き換える */
export function applyHeadTags(tags: HeadTag[], doc: Document = document) {
  for (const t of tags) {
    if (t.tag === "title") {
      doc.title = t.value;
      continue;
    }
    const selector = t.tag === "link" ? `link[rel="${t.key}"]` : `meta[${t.attr}="${t.key}"]`;
    let el = doc.head.querySelector(selector);
    if (!el) {
      el = doc.createElement(t.tag);
      el.setAttribute(t.tag === "link" ? "rel" : t.attr, t.key);
      doc.head.appendChild(el);
    }
    el.setAttribute(t.tag === "link" ? "href" : "content", t.value);
  }
  for (const o of OPTIONAL) {
    if (!tags.some((t) => t.tag !== "title" && t.key === o.key)) doc.head.querySelector(o.selector)?.remove();
  }
}

/** ビルド時の描画で、ページが出したタグを受け取る入れ物 */
export type HeadCollector = { tags?: HeadTag[] };
export const HeadCollectorContext = createContext<HeadCollector | null>(null);

/** 各ページで呼ぶ。ページ名・説明文などを <head> に反映する */
export function usePageMeta(meta: PageMeta) {
  const collector = useContext(HeadCollectorContext);
  const { pathname } = useLocation();
  const tags = pageHeadTags(meta, pathname);
  // ビルド時（renderToString）は effect が動かないので、描画中に渡す
  if (collector) collector.tags = tags;
  const key = JSON.stringify(tags);
  useEffect(() => {
    applyHeadTags(JSON.parse(key) as HeadTag[]);
  }, [key]);
}
