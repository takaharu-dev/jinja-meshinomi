import { useLoaderData } from "react-router";
import type { TopResponse } from "../types";
import Hero from "../components/top/Hero";
import PopularShrines from "../components/top/PopularShrines";
import Features from "../components/top/Features";
import AreaList from "../components/top/AreaList";
import RecentLogs from "../components/top/RecentLogs";
import InstagramBanner from "../components/top/InstagramBanner";
import { usePageMeta } from "../pageMeta";
import "./TopPage.css";

export default function TopPage() {
  const data = useLoaderData() as TopResponse;
  usePageMeta({});

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
