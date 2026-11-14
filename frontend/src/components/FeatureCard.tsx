import { Link } from "react-router";
import type { Feature } from "../types";
import Placeholder from "./Placeholder";

export default function FeatureCard({ feature: f }: { feature: Feature }) {
  return (
    <Link to={`/features/${f.id}`} className="fcard">
      <Placeholder label="特集の写真" />
      <span className="fcard__in">
        <small>FEATURE</small>
        <b>{f.title}</b>
        <span>{f.summary}</span>
      </span>
    </Link>
  );
}
