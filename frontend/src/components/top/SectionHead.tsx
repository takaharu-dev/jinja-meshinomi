import { Link } from "react-router";

type Props = { id: string; title: string; more?: string; to?: string };

export default function SectionHead({ id, title, more, to }: Props) {
  return (
    <div className="tb-h">
      <h2 id={id}>{title}</h2>
      {more && to && <Link to={to}>{more} ›</Link>}
    </div>
  );
}
