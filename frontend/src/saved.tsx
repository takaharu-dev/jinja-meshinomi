import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";

// 保存リスト（いまはこのブラウザ内だけに保存）
const KEY = "jinja-meshinomi:saved";

type Saved = { has: (id: string) => boolean; toggle: (id: string) => void };

const SavedContext = createContext<Saved | null>(null);

/** 保存した神社の ID（保存した順） */
export function loadSaved(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// ---------- 保存状態のストア ----------
// ビルド時に書き出したページは「何も保存していない」状態で描画される。
// useSyncExternalStore の getServerSnapshot（空）でハイドレーションしてから、
// このブラウザの保存状態に切り替えるので、サーバーとブラウザで表示がずれない。

const EMPTY: string[] = [];
let current: string[] | null = null;
const listeners = new Set<() => void>();

const getSnapshot = () => (current ??= loadSaved());
const getServerSnapshot = () => EMPTY;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function save(next: string[]) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // プライベートブラウズなどで保存できなくても画面は動かす
  }
  listeners.forEach((l) => l());
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => {
    const prev = getSnapshot();
    save(prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  return <SavedContext.Provider value={{ has, toggle }}>{children}</SavedContext.Provider>;
}

export function useSaved(): Saved {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
