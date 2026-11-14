package main

import (
	"net/http"
	"slices"
)

// GET /api/shrines/{id}

type InfoRow struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

type RelatedShrine struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Area string `json:"area"`
}

type ShrineDetail struct {
	ID           string          `json:"id"`
	Name         string          `json:"name"`
	Kana         string          `json:"kana"`
	Worry        Option          `json:"worry"`
	Area         Option          `json:"area"`
	Tags         []string        `json:"tags"`
	Catch        string          `json:"catch"`
	Stations     string          `json:"stations"`
	Address      string          `json:"address"`
	MainPhoto    string          `json:"mainPhoto"`
	Thumbs       []string        `json:"thumbs"`
	Days         []string        `json:"days"`
	Info         []InfoRow       `json:"info"`
	Shops        []Shop          `json:"shops"`
	Sake         []InfoRow       `json:"sake"`
	Related      []RelatedShrine `json:"related"`
	InstagramURL string          `json:"instagramUrl"`
}

func findShrine(id string) (Shrine, bool) {
	i := slices.IndexFunc(shrines, func(s Shrine) bool { return s.ID == id })
	if i < 0 {
		return Shrine{}, false
	}
	return shrines[i], true
}

// relatedShrines は同じ悩み → 同じエリア → それ以外の順に、人気の高いものから n 件選ぶ
func relatedShrines(s Shrine, n int) []RelatedShrine {
	score := func(o Shrine) int {
		switch {
		case o.Worry == s.Worry:
			return 2
		case o.Area == s.Area:
			return 1
		}
		return 0
	}
	cands := slices.DeleteFunc(slices.Clone(shrines), func(o Shrine) bool { return o.ID == s.ID })
	slices.SortStableFunc(cands, func(a, b Shrine) int {
		if d := score(b) - score(a); d != 0 {
			return d
		}
		return b.Popularity - a.Popularity
	})
	out := []RelatedShrine{}
	for _, o := range cands[:min(n, len(cands))] {
		out = append(out, RelatedShrine{ID: o.ID, Name: o.Name, Area: label(areas, o.Area)})
	}
	return out
}

func buildShrineDetail(s Shrine) ShrineDetail {
	w, _ := findOption(worries, s.Worry)
	a, _ := findOption(areas, s.Area)

	tags := []string{w.Label}
	for _, k := range []string{"goshuin", kodawariNearStation} {
		if s.Has(k) {
			tags = append(tags, label(kodawaris, k))
		}
	}

	info := []InfoRow{{Label: "ご利益", Value: s.Benefit}}
	if s.Highlight != "" {
		info = append(info, InfoRow{Label: "見どころ", Value: s.Highlight})
	}
	goshuin := "公式サイトで確認"
	if s.Has("goshuin") {
		goshuin = "あり（受付時間は公式サイトで確認）"
	}
	info = append(info,
		InfoRow{Label: "御朱印", Value: goshuin},
		InfoRow{Label: "参拝時間", Value: "公式サイトで確認"},
	)

	shops := s.Shops
	if len(shops) == 0 {
		shops = defaultShops()
	}

	mainPhoto := "メイン写真"
	if s.MainPhoto != "" {
		mainPhoto = "メイン写真（" + s.MainPhoto + "）"
	}

	days := worryDays[s.Worry]
	if days == nil {
		days = []string{}
	}

	return ShrineDetail{
		ID: s.ID, Name: s.Name, Kana: s.Kana,
		Worry: Option{Slug: w.Slug, Label: w.Label}, Area: a,
		Tags: tags, Catch: s.Catch, Stations: s.Stations, Address: s.Address,
		MainPhoto: mainPhoto, Thumbs: galleryThumbs, Days: days, Info: info, Shops: shops,
		Sake: []InfoRow{
			{Label: "御神酒", Value: "授与の有無は公式サイトで確認"},
			{Label: "おすすめ", Value: "◯◯（銘柄が入ります）"},
			{Label: "飲めるお店", Value: s.AfterVisit},
		},
		Related:      relatedShrines(s, 3),
		InstagramURL: "https://www.instagram.com/" + topData.InstagramUser + "/",
	}
}

func handleShrineDetail(w http.ResponseWriter, r *http.Request) {
	s, ok := findShrine(r.PathValue("id"))
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, buildShrineDetail(s))
}
