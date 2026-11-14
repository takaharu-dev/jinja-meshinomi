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
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
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
	if staticDir != "" {
		mux.Handle("GET /", spaHandler(os.DirFS(staticDir)))
	}
	return mux
}

// spaHandler は静的ファイルを返し、存在しないパスは index.html を返す（React 側のルーティング用）。
func spaHandler(root fs.FS) http.Handler {
	files := http.FileServerFS(root)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}
		name := strings.TrimPrefix(path.Clean(r.URL.Path), "/")
		if name != "" {
			if info, err := fs.Stat(root, name); err == nil && !info.IsDir() {
				files.ServeHTTP(w, r)
				return
			}
		}
		http.ServeFileFS(w, r, root, "index.html")
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("write json: %v", err)
	}
}
