# jinja-meshinomi
悩んだ日に行きたい神社と、参拝後のごはん・地酒が探せるサイト

## 構成

| ディレクトリ | 内容 |
| --- | --- |
| `frontend/` | React + TypeScript（Vite） |
| `backend/` | Go（標準ライブラリのみ）の API サーバー |

## 起動

```sh
make up     # Docker で起動 → http://localhost:8080（要 Docker Desktop）
make down   # Docker を停止

make dev    # 開発用：Go と Vite を同時に起動 → http://localhost:5173（Ctrl+C で停止）
```

- `make up` はフロントをビルドして、Go サーバーが画面と API をまとめて配信します。コードを変えたら `make up` をもう一度。
- `make dev` は保存するとすぐ画面に反映されます。初回は自動で `npm install` します（要 Go / Node.js）。

その他のコマンドは `make` で一覧が出ます。

## API

| メソッド | パス | 内容 |
| --- | --- | --- |
| GET | `/api/health` | 死活確認 |
| GET | `/api/top` | TOPページ用データ（悩み・人気の神社・特集・エリア・参拝記録） |
| GET | `/api/shrines` | 神社一覧。`worry` / `area` / `k`（複数可）/ `q` / `station` / `sort=new\|popular\|near` / `id`（複数可）で絞り込み・並び替え。各チップを押したときの件数も返す |
| GET | `/api/areas` | エリアのグループと、エリアごとの神社の件数 |
| GET | `/api/stations` | 最寄り駅（エリアごと）と、駅ごとの神社の件数 |
| GET | `/api/features` | 特集の一覧 |
| GET | `/api/features/{id}` | 特集の記事（導入文・対象の神社・ほかの特集）。存在しなければ 404 |
| GET | `/api/logs` | 参拝記録の一覧（新しい順） |
| GET | `/api/logs/{id}` | 参拝記録の記事（本文・写真・参拝した神社・寄ったお店・ほかの記録）。存在しなければ 404 |
| GET | `/api/shrines/{id}` | 神社の詳細（情報・参拝後のお店・地酒・アクセス・関連する神社）。存在しなければ 404 |
| GET | `/api/sitemap.xml` | sitemap.xml（神社・特集・参拝記録のデータから自動生成。各データの `Unlisted: true` で除外。URL のドメインは環境変数 `SITE_URL`、未指定なら `https://jinja-meshinomi.vercel.app`）。公開サイトの `/sitemap.xml` はここへリライト |

## 画面

| パス | 内容 |
| --- | --- |
| `/` | TOP |
| `/shrines` | 一覧（絞り込み条件は URL のクエリで持つ。例：`/shrines?worry=career&area=minato`） |
| `/shrines/:id` | 詳細（例：`/shrines/atago`） |
| `/areas` | エリアから探す |
| `/stations` | 駅から探す |
| `/features` | 特集の一覧 |
| `/features/:id` | 特集の記事（例：`/features/career`） |
| `/logs` | 参拝記録の一覧 |
| `/logs/:id` | 参拝記録の記事（例：`/logs/2026-10-24-hie`） |
| `/about` | このサイトについて |
| `/contact` | お問い合わせ（Instagram の DM へ案内） |
| `/privacy` | プライバシーポリシー |
| `/saved` | 保存リスト（ブラウザに保存した神社） |

## テスト

```sh
make test
```

## ページの書き出し（プリレンダリング）

`npm run build` の最後に `frontend/scripts/prerender.mjs` が動き、API の `sitemap.xml` にある URL（＋ /contact・/privacy）を HTML に書き出します（`dist/shrines/atago/index.html` など）。初期 HTML に本文が入るので、JavaScript を実行しない検索エンジンでも内容が読めます。ブラウザではその HTML を引き継いで（hydrate）今までどおり動きます。

- データは本番の API（`PRERENDER_API_URL` で変更可）から取得します。backend のデプロイは待たず、その時点で本番に出ている backend のデータで書き出します
- 書き出していないページ（保存リスト・クエリ付きの一覧・ビルド後に増えたページ）は `dist/spa.html` を返し、ブラウザで描画します
- データ（`backend/`）を変えて main に push すると、backend の本番デプロイが終わったあとに GitHub Actions（`.github/workflows/rebuild-frontend.yml`）が frontend の Deploy Hook を呼び、新しいデータで書き出し直します

### Deploy Hook の設定（最初に1回）

1. Vercel の jinja-meshinomi（frontend）プロジェクトで Settings → Git → Deploy Hooks を開き、名前（例：`rebuild-after-backend`）とブランチ `main` で作成して URL をコピー
2. GitHub のリポジトリで Settings → Secrets and variables → Actions → New repository secret を開き、名前 `FRONTEND_DEPLOY_HOOK_URL`、値にコピーした URL を登録
- `SKIP_PRERENDER=1` で書き出しを省けます（Docker ではこれを指定）
