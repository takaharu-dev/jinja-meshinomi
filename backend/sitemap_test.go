package main

import (
	"encoding/xml"
	"net/http"
	"slices"
	"strings"
	"testing"
)

func decodeSitemap(t *testing.T, mux *http.ServeMux, target string) []string {
	t.Helper()
	rec := serve(mux, http.MethodGet, target)
	if rec.Code != http.StatusOK {
		t.Fatalf("%s: status = %d", target, rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); !strings.HasPrefix(ct, "application/xml") {
		t.Errorf("%s: content-type = %q", target, ct)
	}
	var set sitemapURLSet
	if err := xml.NewDecoder(rec.Body).Decode(&set); err != nil {
		t.Fatalf("%s: decode: %v", target, err)
	}
	if set.Xmlns != "http://www.sitemaps.org/schemas/sitemap/0.9" {
		t.Errorf("xmlns = %q", set.Xmlns)
	}
	locs := make([]string, len(set.URLs))
	for i, u := range set.URLs {
		locs[i] = u.Loc
	}
	return locs
}

func TestSitemap(t *testing.T) {
	locs := decodeSitemap(t, newMux(""), "/api/sitemap.xml")

	want := []string{
		"https://jinja-meshinomi.vercel.app/",
		"https://jinja-meshinomi.vercel.app/shrines",
		"https://jinja-meshinomi.vercel.app/areas",
		"https://jinja-meshinomi.vercel.app/stations",
		"https://jinja-meshinomi.vercel.app/features",
		"https://jinja-meshinomi.vercel.app/logs",
		"https://jinja-meshinomi.vercel.app/about",
		"https://jinja-meshinomi.vercel.app/shrines/atago",
		"https://jinja-meshinomi.vercel.app/features/career",
		"https://jinja-meshinomi.vercel.app/logs/2026-10-24-hie",
	}
	for _, w := range want {
		if !slices.Contains(locs, w) {
			t.Errorf("missing %s", w)
		}
	}
	// 今は全件載せる
	if n := len(sitemapStaticPaths) + len(shrines) + len(featureDefs) + len(logDefs); len(locs) != n {
		t.Errorf("urls = %d, want %d", len(locs), n)
	}
	// 個人の保存リストは載せない
	if slices.Contains(locs, "https://jinja-meshinomi.vercel.app/saved") {
		t.Error("/saved が入っている")
	}
}

func TestSitemapUnlisted(t *testing.T) {
	origShrines, origFeatures, origLogs := shrines, featureDefs, logDefs
	t.Cleanup(func() { shrines, featureDefs, logDefs = origShrines, origFeatures, origLogs })

	shrines = slices.Clone(shrines)
	shrines[0].Unlisted = true
	featureDefs = slices.Clone(featureDefs)
	featureDefs[0].Unlisted = true
	logDefs = slices.Clone(logDefs)
	logDefs[0].Unlisted = true

	paths := sitemapPaths()
	for _, p := range []string{"/shrines/" + shrines[0].ID, "/features/" + featureDefs[0].ID, "/logs/" + logDefs[0].ID} {
		if slices.Contains(paths, p) {
			t.Errorf("Unlisted の %s が入っている", p)
		}
	}
	if !slices.Contains(paths, "/shrines/"+shrines[1].ID) {
		t.Errorf("Unlisted でない %s が入っていない", shrines[1].ID)
	}
}

func TestSitemapSiteURL(t *testing.T) {
	t.Setenv("SITE_URL", "https://example.com/")
	locs := decodeSitemap(t, newMux(""), "/api/sitemap.xml")
	if locs[0] != "https://example.com/" {
		t.Errorf("loc = %q", locs[0])
	}
}

// Go がフロントも配信するときは /sitemap.xml も index.html ではなく sitemap を返す
func TestSitemapWithStatic(t *testing.T) {
	dir := t.TempDir()
	mustWrite(t, dir+"/index.html", "<p>index</p>")
	if locs := decodeSitemap(t, newMux(dir), "/sitemap.xml"); len(locs) == 0 {
		t.Error("urls が空")
	}
}
