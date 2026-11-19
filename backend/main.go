package main

import (
	"encoding/json"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// STATIC_DIR を指定すると、ビルド済みのフロント（frontend/dist）も配信する
	staticDir := os.Getenv("STATIC_DIR")

	srv := &http.Server{Addr: ":" + port, Handler: newMux(staticDir)}
	log.Printf("jinja-meshinomi listening on :%s", port)
	log.Fatal(srv.ListenAndServe())
}

func newMux(staticDir string) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		// commit：GitHub Actions（rebuild-frontend.yml）が「本番の backend がこのコミットになったか」を確かめるのに使う（Vercel 以外では空）
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "commit": os.Getenv("VERCEL_GIT_COMMIT_SHA")})
	})
	mux.HandleFunc("GET /api/top", handleTop)
	mux.HandleFunc("GET /api/shrines", handleShrines)
	mux.HandleFunc("GET /api/shrines/{id}", handleShrineDetail)
	mux.HandleFunc("GET /api/areas", handleAreas)
	mux.HandleFunc("GET /api/stations", handleStations)
	mux.HandleFunc("GET /api/features", handleFeatures)
	mux.HandleFunc("GET /api/features/{id}", handleFeature)
	mux.HandleFunc("GET /api/logs", handleLogs)
	mux.HandleFunc("GET /api/logs/{id}", handleLog)
	mux.HandleFunc("GET /api/sitemap.xml", handleSitemap)
	// Go がフロントも配信するとき（Docker）用。Vercel では vercel.json のリライトで /api/sitemap.xml に転送する
	mux.HandleFunc("GET /sitemap.xml", handleSitemap)
	if staticDir != "" {
		mux.Handle("GET /", spaHandler(os.DirFS(staticDir)))
	}
	return mux
}

// spaHandler は静的ファイルを返す。
// ビルド時に書き出したページ（例：shrines/atago/index.html）があればそれを返し、
// なければ SPA 用の空の HTML（spa.html、なければ index.html）を返して React 側で描画する。
func spaHandler(root fs.FS) http.Handler {
	files := http.FileServerFS(root)
	fallback := "index.html"
	if _, err := fs.Stat(root, "spa.html"); err == nil {
		fallback = "spa.html"
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}
		name := strings.TrimPrefix(path.Clean(r.URL.Path), "/")
		if name == "" {
			name = "index.html"
		}
		info, err := fs.Stat(root, name)
		if err == nil && info.IsDir() {
			name = path.Join(name, "index.html")
			info, err = fs.Stat(root, name)
		}
		if err == nil && !info.IsDir() {
			if strings.HasSuffix(name, ".html") {
				// FileServer は /index.html などをリダイレクトするので、HTML は直接返す
				http.ServeFileFS(w, r, root, name)
				return
			}
			files.ServeHTTP(w, r)
			return
		}
		http.ServeFileFS(w, r, root, fallback)
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("write json: %v", err)
	}
}
