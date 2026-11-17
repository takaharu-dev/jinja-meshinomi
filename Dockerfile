# 1. フロントをビルド
FROM node:22-alpine AS frontend
WORKDIR /src
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# ページの書き出しは本番の API のデータを使うので、Docker では書き出さずに SPA として配信する
ENV SKIP_PRERENDER=1
RUN npm run build

# 2. Go をビルド
FROM golang:1.26-alpine AS backend
WORKDIR /src
COPY backend/go.mod ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/server .

# 3. 実行用（Go のバイナリ + ビルド済みフロント）
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=backend /out/server ./server
COPY --from=frontend /src/dist ./public
ENV STATIC_DIR=/app/public PORT=8080
EXPOSE 8080
ENTRYPOINT ["/app/server"]
