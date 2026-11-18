# 共通の OGP 画像

`public/ogp.png`（1200×630）は、このフォルダの `ogp.html` をブラウザで 1200×630 の大きさでスクリーンショットしたもの。
写真が揃うまで、全ページの og:image にこの画像を使う（`src/constants.ts` の `OGP_IMAGE`）。

作り直すとき（Playwright を使う例。プロジェクトの依存には入れていない）：

```sh
npx -y playwright@1.56 screenshot --viewport-size=1200,630 --wait-for-timeout=1500 \
  "file://$PWD/scripts/ogp/ogp.html" public/ogp.png
```
