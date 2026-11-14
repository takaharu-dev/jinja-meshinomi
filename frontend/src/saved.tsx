import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

// 保存リスト（いまはこのブラウザ内だけに保存）
const KEY = "jinja-meshinomi:saved";

type Saved = { has: (id: string) => boolean; toggle: (id: string) => void };

const SavedContext = createContext<Saved | null>(null);

function load(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      // プライベートブラウズなどで保存できなくても画面は動かす
    }
  }, [ids]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: string) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [],
  );

  return <SavedContext.Provider value={{ has, toggle }}>{children}</SavedContext.Provider>;
}

export function useSaved(): Saved {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
