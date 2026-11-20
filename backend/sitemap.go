package main

import (
	"encoding/xml"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
)

// sitemap.xml。神社・特集・参拝記録のデータから URL を作るので、データを増やせば自動で載る。
// 各データの Unlisted を true にすると、そのページだけ外せる。

// defaultSiteURL はフロントの公開 URL。SITE_URL で上書きできる（独自ドメインに移したときなど）。
const defaultSiteURL = "https://jinja-meshinomi.com"

// sitemap に載せる固定ページ（トップと一覧系）
var sitemapStaticPaths = []string{"/", "/shrines", "/areas", "/stations", "/features", "/logs", "/about"}

func siteURL() string {
	if v := os.Getenv("SITE_URL"); v != "" {
		return strings.TrimRight(v, "/")
	}
	return defaultSiteURL
}

func sitemapPaths() []string {
	paths := append([]string{}, sitemapStaticPaths...)
	for _, s := range shrines {
		if !s.Unlisted {
			paths = append(paths, "/shrines/"+url.PathEscape(s.ID))
		}
	}
	for _, d := range featureDefs {
		if !d.Unlisted {
			paths = append(paths, "/features/"+url.PathEscape(d.ID))
		}
	}
	for _, d := range logDefs {
		if !d.Unlisted {
			paths = append(paths, "/logs/"+url.PathEscape(d.ID))
		}
	}
	return paths
}

type sitemapURL struct {
	Loc string `xml:"loc"`
}

type sitemapURLSet struct {
	XMLName xml.Name     `xml:"urlset"`
	Xmlns   string       `xml:"xmlns,attr"`
	URLs    []sitemapURL `xml:"url"`
}

func handleSitemap(w http.ResponseWriter, r *http.Request) {
	base := siteURL()
	set := sitemapURLSet{Xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9"}
	for _, p := range sitemapPaths() {
		set.URLs = append(set.URLs, sitemapURL{Loc: base + p})
	}
	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=0, s-maxage=3600")
	w.Write([]byte(xml.Header))
	enc := xml.NewEncoder(w)
	enc.Indent("", "  ")
	if err := enc.Encode(set); err != nil {
		log.Printf("write sitemap: %v", err)
	}
}
