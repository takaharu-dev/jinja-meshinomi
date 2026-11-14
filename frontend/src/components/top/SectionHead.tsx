export default function SectionHead({ id, title, more }: { id: string; title: string; more?: string }) {
  return (
    <div className="tb-h">
      <h2 id={id}>{title}</h2>
      {more && <a href="#">{more} ›</a>}
    </div>
  );
}
