import { Link, useLoaderData } from "react-router";
import type { Feature } from "../types";
import FeatureCard from "../components/FeatureCard";
import { usePageMeta } from "../pageMeta";
import { LEADS, featuresDescription } from "../descriptions";
import "./FeaturesPage.css";

export default function FeaturesPage() {
  const features = useLoaderData() as Feature[];
  usePageMeta({ title: "特集", description: featuresDescription(features) });

  return (
    <div className="container fpage">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ 特集
        </nav>
        <h1>特集</h1>
        <p className="apage__lead">{LEADS.features}</p>
      </div>
      <div className="fgrid">
        {features.map((f) => (
          <FeatureCard key={f.id} feature={f} />
        ))}
      </div>
    </div>
  );
}
