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

## テスト

```sh
make test
```
