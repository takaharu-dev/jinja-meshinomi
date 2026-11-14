import { useEffect, useState } from "react";
import { fetchTop } from "../api";
import type { TopResponse } from "../types";
import Hero from "../components/top/Hero";
import PopularShrines from "../components/top/PopularShrines";
import Features from "../components/top/Features";
import AreaList from "../components/top/AreaList";
import RecentLogs from "../components/top/RecentLogs";
import InstagramBanner from "../components/top/InstagramBanner";
import { useDocumentTitle } from "../useDocumentTitle";
import "./TopPage.css";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; data: TopResponse };

export default function TopPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  useDocumentTitle();

  useEffect(() => {
    const ctrl = new AbortController();
    fetchTop(ctrl.signal)
      .then((data) => setState({ status: "ok", data }))
      .catch((err) => {
        if (!ctrl.signal.aborted) {
          console.error(err);
          setState({ status: "error" });
        }
      });
    return () => ctrl.abort();
  }, []);

  if (state.status !== "ok") {
    return (
      <p className="container page-status">
        {state.status === "loading" ? "読み込み中…" : "データを読み込めませんでした。時間をおいて再度お試しください。"}
      </p>
    );
  }

  const { data } = state;
  return (
    <>
      <Hero worries={data.worries} />
      <div className="container tb-body">
        <PopularShrines shrines={data.popular} />
        <Features main={data.mainFeature} subs={data.subFeatures} />
        <div className="tb-two">
          <AreaList groups={data.areaGroups} />
          <RecentLogs logs={data.recentLogs} />
        </div>
        <InstagramBanner user={data.instagramUser} />
      </div>
    </>
  );
}
