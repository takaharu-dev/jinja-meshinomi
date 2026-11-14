import { useEffect } from "react";

const SITE = "神社めし呑み";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title}｜${SITE}` : SITE;
  }, [title]);
}
