type Props = {
  size?: number;
  /** 柱・笠木の色 */
  color?: string;
  /** 一番上の反りの色 */
  accent?: string;
};

/** 鳥居のロゴマーク */
export default function Logo({ size = 28, color = "currentColor", accent = color }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 204 200" aria-hidden="true" focusable="false">
      <path d="M40 34L54 34L50 190L34 190Z M146 34L160 34L166 190L150 190Z M14 24L186 24L183 34L17 34Z" fill={color} />
      <rect x="2" y="58" width="196" height="11" fill={color} />
      <rect x="93" y="34" width="14" height="24" fill={color} />
      <path d="M0 0Q12 12 34 14L166 14Q188 12 204 0L204 8Q190 23 168 25L32 25Q10 23 0 8Z" fill={accent} />
    </svg>
  );
}
