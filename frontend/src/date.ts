/** "2026-10-24" → "10月24日"（withYear なら "2026年10月24日"） */
export function formatDate(iso: string, withYear = false): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${withYear ? `${y}年` : ""}${m}月${d}日`;
}
