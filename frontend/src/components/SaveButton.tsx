import { useSaved } from "../saved";

type Props = {
  id: string;
  name: string;
  /** text: 「♡ 保存」、full: 「♡ 保存する」、round: 丸いボタン */
  variant?: "text" | "full" | "round";
  className?: string;
};

export default function SaveButton({ id, name, variant = "text", className = "" }: Props) {
  const { has, toggle } = useSaved();
  const on = has(id);
  const icon = on ? "♥" : "♡";
  const text = on ? "保存済み" : variant === "full" ? "保存する" : "保存";
  return (
    <button
      type="button"
      className={className}
      aria-pressed={on}
      aria-label={`${name}を保存`}
      onClick={() => toggle(id)}
    >
      {variant === "round" ? icon : `${icon} ${text}`}
    </button>
  );
}
