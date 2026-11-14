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
| GET | `/api/shrines/{id}` | 神社の詳細（情報・参拝後のお店・地酒・アクセス・関連する神社）。存在しなければ 404 |

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
| `/saved` | 保存リスト（ブラウザに保存した神社） |

## テスト

```sh
make test
```
