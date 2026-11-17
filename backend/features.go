package main

import (
	"fmt"
	"net/http"
	"net/url"
	"slices"
)

// 特集。条件（Query）に当てはまる神社を自動で並べる。
// 導入文などの文章は仮置き。

type featureDef struct {
	ID       string
	Title    string // Numbered のときは %d に件数が入る
	Numbered bool
	Summary  string
	Lead     string
	Query    url.Values // /api/shrines と同じ条件
	Unlisted bool       // true にすると sitemap.xml に載せない（未完成のページ用）
}

var featureDefs = []featureDef{
	{
		ID: "career", Title: "仕事でモヤモヤした日に行きたい神社%d選", Numbered: true,
		Summary: "参拝のあとに寄りたい蕎麦屋と酒場も",
		Lead:    "上司のこと、評価のこと、この先のこと。仕事でモヤモヤが続く日は、気持ちを切り替えに神社へ。仕事運や出世を願う神社と、参拝のあとに寄りたいお店をまとめました。",
		Query:   url.Values{"worry": {"career"}},
	},
	{
		ID: "kagurazaka-night", Title: "縁結び神社と、神楽坂の夜",
		Summary: "良縁祈願のあとは小料理屋で日本酒",
		Lead:    "神楽坂の近くにある神社にお参りしたら、そのまま神楽坂の路地へ。小料理屋や和食店で日本酒をゆっくり楽しむ、夜の過ごし方をまとめました。",
		Query:   url.Values{"q": {"神楽坂"}},
	},
	{
		ID: "yakuyoke-kanpai", Title: "厄を祓って、酒場で乾杯",
		Summary: "厄除け神社と、帰りに寄れる居酒屋",
		Lead:    "悪いことが続いた日や、厄年で落ち着かないときは、厄除けの神社へ。お参りで気持ちを切り替えたら、帰りに酒場で乾杯しましょう。",
		Query:   url.Values{"q": {"厄除け"}},
	},
	{
		ID: "solo", Title: "一人で行ける神社と一杯",
		Summary: "カウンターで気軽に飲めるお店",
		Lead:    "一人で神社に行って、一人で一杯。一人でも入りやすいお店が近くにある神社を集めました。",
		Query:   url.Values{"k": {"solo"}},
	},
}

func (d featureDef) items() []ShrineItem {
	return buildShrineList(parseListQuery(d.Query)).Items
}

func (d featureDef) summary() Feature {
	title := d.Title
	if d.Numbered {
		title = fmt.Sprintf(d.Title, len(d.items()))
	}
	return Feature{ID: d.ID, Title: title, Summary: d.Summary}
}

func featureSummaries(defs []featureDef) []Feature {
	out := make([]Feature, 0, len(defs))
	for _, d := range defs {
		out = append(out, d.summary())
	}
	return out
}

type FeatureDetail struct {
	Feature
	Lead      string       `json:"lead"`
	ListQuery string       `json:"listQuery"` // 一覧ページで同じ条件を開くためのクエリ
	Items     []ShrineItem `json:"items"`
	Others    []Feature    `json:"others"`
}

func handleFeatures(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, featureSummaries(featureDefs))
}

func handleFeature(w http.ResponseWriter, r *http.Request) {
	i := slices.IndexFunc(featureDefs, func(d featureDef) bool { return d.ID == r.PathValue("id") })
	if i < 0 {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	d := featureDefs[i]
	others := slices.Delete(slices.Clone(featureDefs), i, i+1)
	writeJSON(w, http.StatusOK, FeatureDetail{
		Feature:   d.summary(),
		Lead:      d.Lead,
		ListQuery: d.Query.Encode(),
		Items:     d.items(),
		Others:    featureSummaries(others),
	})
}
