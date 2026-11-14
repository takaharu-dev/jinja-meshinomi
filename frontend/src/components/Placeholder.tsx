/** 写真が入るまでの仮置き枠 */
export default function Placeholder({ label = "写真", className = "" }: { label?: string; className?: string }) {
  return <div className={`ph ${className}`}>{label}</div>;
}
