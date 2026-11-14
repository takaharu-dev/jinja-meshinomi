package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func serve(mux *http.ServeMux, method, target string) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest(method, target, nil))
	return rec
}

func TestTop(t *testing.T) {
	rec := serve(newMux(""), http.MethodGet, "/api/top")
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	var got TopResponse
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(got.Worries) != 8 || len(got.Popular) != 4 || len(got.SubFeatures) != 3 {
		t.Errorf("unexpected counts: worries=%d popular=%d subFeatures=%d",
			len(got.Worries), len(got.Popular), len(got.SubFeatures))
	}
}

func TestTopRejectsPost(t *testing.T) {
	if rec := serve(newMux(""), http.MethodPost, "/api/top"); rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want 405", rec.Code)
	}
}

func TestStatic(t *testing.T) {
	dir := t.TempDir()
	mustWrite(t, filepath.Join(dir, "index.html"), "<p>index</p>")
	mustWrite(t, filepath.Join(dir, "assets", "app.js"), "console.log(1)")
	mux := newMux(dir)

	cases := []struct {
		target, wantBody string
		wantCode         int
	}{
		{"/", "index", http.StatusOK},
		{"/assets/app.js", "console.log", http.StatusOK},
		{"/shrines/atago", "index", http.StatusOK}, // React 側のパスは index.html
		{"/api/unknown", "", http.StatusNotFound},
	}
	for _, c := range cases {
		rec := serve(mux, http.MethodGet, c.target)
		if rec.Code != c.wantCode || !strings.Contains(rec.Body.String(), c.wantBody) {
			t.Errorf("%s: code=%d body=%q", c.target, rec.Code, rec.Body.String())
		}
	}
}

func mustWrite(t *testing.T, name, body string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(name), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(name, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
}
