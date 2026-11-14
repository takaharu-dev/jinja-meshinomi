import { Link, useLoaderData } from "react-router";
import type { Feature } from "../types";
import FeatureCard from "../components/FeatureCard";
import { useDocumentTitle } from "../useDocumentTitle";
import "./FeaturesPage.css";

export default function FeaturesPage() {
  const features = useLoaderData() as Feature[];
  useDocumentTitle("特集");

  return (
    <div className="container fpage">
      <div className="phead">
        <nav className="crumb" aria-label="パンくずリスト">
          <Link to="/">神社めし呑み</Link> ＞ 特集
        </nav>
        <h1>特集</h1>
        <p className="apage__lead">悩みや気分に合わせて、神社と参拝後の一杯を選びました。</p>
      </div>
      <div className="fgrid">
        {features.map((f) => (
          <FeatureCard key={f.id} feature={f} />
        ))}
      </div>
    </div>
  );
}
