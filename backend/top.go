package main

import (
	"net/http"
	"slices"
)

type ShrineCard struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Worry      string `json:"worry"`
	Area       string `json:"area"`
	Access     string `json:"access"`
	AfterVisit string `json:"afterVisit"`
}

type Feature struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	Summary string `json:"summary"`
}

type AreaGroup struct {
	Name  string   `json:"name"`
	Areas []Option `json:"areas"`
}

type VisitLog struct {
	ID    string `json:"id"`
	Date  string `json:"date"`
	Title string `json:"title"`
	Worry string `json:"worry"`
}

type TopResponse struct {
	Worries       []Option     `json:"worries"`
	Popular       []ShrineCard `json:"popular"`
	MainFeature   Feature      `json:"mainFeature"`
	SubFeatures   []Feature    `json:"subFeatures"`
	AreaGroups    []AreaGroup  `json:"areaGroups"`
	RecentLogs    []VisitLog   `json:"recentLogs"`
	InstagramUser string       `json:"instagramUser"`
}

func areaOptions(slugs ...string) []Option {
	out := make([]Option, 0, len(slugs))
	for _, s := range slugs {
		if o, ok := findOption(areas, s); ok {
			out = append(out, o)
		}
	}
	return out
}

// popularShrines は人気順の上位 n 件を返す
func popularShrines(n int) []ShrineCard {
	sorted := slices.Clone(shrines)
	slices.SortStableFunc(sorted, func(a, b Shrine) int { return b.Popularity - a.Popularity })
	out := make([]ShrineCard, 0, n)
	for _, s := range sorted[:min(n, len(sorted))] {
		out = append(out, ShrineCard{
			ID: s.ID, Name: s.Name, Worry: label(worries, s.Worry), Area: label(areas, s.Area),
			Access: s.Access(), AfterVisit: s.AfterVisit,
		})
	}
	return out
}

var topData = TopResponse{
	Worries:     worries,
	Popular:     popularShrines(4),
	MainFeature: featureDefs[0].summary(),
	SubFeatures: featureSummaries(featureDefs[1:]),
	AreaGroups: []AreaGroup{
		{Name: "都心", Areas: areaOptions("chiyoda", "chuo", "minato")},
		{Name: "副都心", Areas: areaOptions("shinjuku", "shibuya", "toshima")},
		{Name: "下町", Areas: areaOptions("taito", "sumida", "koto")},
		{Name: "西エリア", Areas: areaOptions("suginami", "setagaya", "musashino")},
	},
	RecentLogs: []VisitLog{
		{ID: "log-1024", Date: "10月24日", Title: "日枝神社 → 赤坂で軽く一杯", Worry: "仕事・出世"},
		{ID: "log-1020", Date: "10月20日", Title: "赤城神社 → 神楽坂の和食店", Worry: "仕事・出世"},
		{ID: "log-1017", Date: "10月17日", Title: "出雲大社東京分祠 → 六本木で一杯", Worry: "恋愛・縁結び"},
	},
	InstagramUser: "jinja_meshinomi",
}

func handleTop(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, topData)
}
