/** 検索フォームの入力から一覧ページの URL を作る */
export function searchPath(...words: (FormDataEntryValue | null)[]): string {
  const q = words
    .map((w) => (typeof w === "string" ? w.trim() : ""))
    .filter(Boolean)
    .join(" ");
  return q ? `/shrines?${new URLSearchParams({ q })}` : "/shrines";
}
