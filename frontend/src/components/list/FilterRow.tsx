import type { FilterOption } from "../../types";

type Props = {
  label: string;
  options: FilterOption[];
  onToggle: (slug: string) => void;
};

/** タップするとすぐ絞り込まれるチップの行 */
export default function FilterRow({ label, options, onToggle }: Props) {
  if (options.length === 0) return null;
  return (
    <div className="qrow" role="group" aria-label={label}>
      <span className="qrow__label">{label}</span>
      <div className="qchips">
        {options.map((o) => (
          <button
            key={o.slug}
            type="button"
            className="qchip"
            aria-pressed={o.selected}
            disabled={!o.selected && o.count === 0}
            onClick={() => onToggle(o.slug)}
          >
            {o.label}
            {!o.selected && <small aria-label={`${o.count}件`}>{o.count}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}
