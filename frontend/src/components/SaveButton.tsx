import { useSaved } from "../saved";

type Props = {
  id: string;
  name: string;
  /** text: 「♡ 保存」、round: 丸いボタン */
  variant?: "text" | "round";
  className?: string;
};

export default function SaveButton({ id, name, variant = "text", className = "" }: Props) {
  const { has, toggle } = useSaved();
  const on = has(id);
  const icon = on ? "♥" : "♡";
  return (
    <button
      type="button"
      className={className}
      aria-pressed={on}
      aria-label={`${name}を保存`}
      onClick={() => toggle(id)}
    >
      {variant === "round" ? icon : `${icon} ${on ? "保存済み" : "保存"}`}
    </button>
  );
}
