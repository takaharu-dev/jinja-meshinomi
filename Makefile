.DEFAULT_GOAL := help
.PHONY: help up down restart logs dev test build

help: ## コマンド一覧
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-8s %s\n", $$1, $$2}'

# ---------- Docker ----------
up: ## Docker で起動（http://localhost:8080）
	docker compose up -d --build
	@echo "→ http://localhost:8080"

down: ## Docker を停止
	docker compose down

restart: down up ## Docker を作り直して起動

logs: ## Docker のログを表示
	docker compose logs -f

# ---------- 開発 ----------
frontend/node_modules: frontend/package-lock.json
	cd frontend && npm install
	@touch $@

dev: frontend/node_modules ## Go と Vite を同時に起動（http://localhost:5173、Ctrl+C で両方停止）
	@trap 'kill 0' INT TERM EXIT; \
	(cd backend && go run .) & \
	(cd frontend && npm run dev) & \
	wait

test: ## テスト
	cd backend && go vet ./... && go test ./...

build: frontend/node_modules ## フロントをビルド
	cd frontend && npm run build
