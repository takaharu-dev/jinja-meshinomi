package main

import (
	"net/http"
	"slices"
	"strings"
)

// 参拝記録。本文・写真・お店は仮置き。

type logDef struct {
	ID     string
	Date   string // YYYY-MM-DD
	Shrine string // shrines の ID
	Title  string
	Shop   Shop
	Body   []string

	Unlisted bool // true にすると sitemap.xml に載せない（未完成のページ用）
}

// 新しい順に並べておく
var logDefs = []logDef{
	{ID: "2026-10-24-hie", Date: "2026-10-24", Shrine: "hie", Title: "日枝神社 → 赤坂で軽く一杯",
		Shop: Shop{Name: "店名が入ります", Genre: "居酒屋", Distance: "徒歩◯分", Budget: "◯◯円〜", Recommend: "◯◯と日本酒"}},
	{ID: "2026-10-20-akagi", Date: "2026-10-20", Shrine: "akagi", Title: "赤城神社 → 神楽坂の和食店",
		Shop: Shop{Name: "店名が入ります", Genre: "和食・日本酒", Distance: "徒歩◯分", Budget: "◯◯円〜", Recommend: "◯◯と日本酒"}},
	{ID: "2026-10-17-izumo-tokyo", Date: "2026-10-17", Shrine: "izumo-tokyo", Title: "出雲大社東京分祠 → 六本木で一杯",
		Shop: Shop{Name: "店名が入ります", Genre: "バー", Distance: "徒歩◯分", Budget: "◯◯円〜", Recommend: "◯◯と地酒"}},
}

// 本文がまだない記録に出す仮の文章
var placeholderBody = []string{
	"（ここに参拝記録の本文が入ります。参拝した日の気分や、境内の様子など。）",
	"（帰りに寄ったお店のこと、飲んだお酒や食べたものなど。）",
}

type VisitLog struct {
	ID     string        `json:"id"`
	Date   string        `json:"date"`
	Title  string        `json:"title"`
	Worry  string        `json:"worry"`
	Shrine RelatedShrine `json:"shrine"`
}

type VisitLogDetail struct {
	VisitLog
	Body   []string   `json:"body"`
	Photos []string   `json:"photos"`
	Shop   Shop       `json:"shop"`
	Others []VisitLog `json:"others"`
}

func (d logDef) summary() VisitLog {
	s, _ := findShrine(d.Shrine)
	return VisitLog{
		ID: d.ID, Date: d.Date, Title: d.Title, Worry: label(worries, s.Worry),
		Shrine: RelatedShrine{ID: s.ID, Name: s.Name, Area: label(areas, s.Area)},
	}
}

func logSummaries(defs []logDef) []VisitLog {
	out := make([]VisitLog, 0, len(defs))
	for _, d := range defs {
		out = append(out, d.summary())
	}
	return out
}

// recentLogs は新しい順に n 件
func recentLogs(n int) []VisitLog {
	sorted := slices.Clone(logDefs)
	slices.SortStableFunc(sorted, func(a, b logDef) int { return strings.Compare(b.Date, a.Date) })
	return logSummaries(sorted[:min(n, len(sorted))])
}

func handleLogs(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, recentLogs(len(logDefs)))
}

func handleLog(w http.ResponseWriter, r *http.Request) {
	i := slices.IndexFunc(logDefs, func(d logDef) bool { return d.ID == r.PathValue("id") })
	if i < 0 {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	d := logDefs[i]
	body := d.Body
	if len(body) == 0 {
		body = placeholderBody
	}
	others := []VisitLog{}
	for _, o := range recentLogs(len(logDefs)) {
		if o.ID != d.ID {
			others = append(others, o)
		}
	}
	writeJSON(w, http.StatusOK, VisitLogDetail{
		VisitLog: d.summary(),
		Body:     body,
		Photos:   []string{"境内", "お店", "料理", "お酒"},
		Shop:     d.Shop,
		Others:   others,
	})
}
