export default function InstagramBanner({ user }: { user: string }) {
  return (
    <section className="tb-ig">
      <div className="tb-igl">
        <b>リールで見ると、もっと行きたくなる。</b>
        <span>参拝の雰囲気と帰りの一杯は、Instagramで動画にしています</span>
      </div>
      <a className="btn" href={`https://www.instagram.com/${user}/`} target="_blank" rel="noopener noreferrer">
        @{user} を見る
      </a>
    </section>
  );
}
