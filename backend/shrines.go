package main

import (
	"net/http"
	"net/url"
	"slices"
	"strings"
)

// GET /api/shrines
//
//	worry=<slug>  悩み（1つ）
//	area=<slug>   エリア（1つ）
//	k=<slug>      こだわり（複数可・すべて満たすもの）
//	q=<text>      キーワード（空白区切り・すべて含むもの）
//	sort=new|popular|near
//	id=<id>       神社ID（複数可・保存リスト用。指定するとその神社だけに絞る）

type ShrineItem struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Worry      Option `json:"worry"`
	Area       Option `json:"area"`
	Stations   string `json:"stations"`
	Access     string `json:"access"`
	Benefit    string `json:"benefit"`
	Catch      string `json:"catch"`
	AfterVisit string `json:"afterVisit"`
	Goshuin    bool   `json:"goshuin"`
}

// FilterOption の Count は「このチップを押したら何件になるか」
type FilterOption struct {
	Slug     string `json:"slug"`
	Label    string `json:"label"`
	Count    int    `json:"count"`
	Selected bool   `json:"selected"`
}

type Filters struct {
	Worry    []FilterOption `json:"worry"`
	Area     []FilterOption `json:"area"`
	Kodawari []FilterOption `json:"kodawari"`
}

type ShrineListResponse struct {
	Total   int          `json:"total"`
	Items   []ShrineItem `json:"items"`
	Filters Filters      `json:"filters"`
	Q       string       `json:"q"`
	Sort    string       `json:"sort"`
}

const (
	sortNew     = "new"
	sortPopular = "popular"
	sortNear    = "near"
)

type listQuery struct {
	worry    string
	area     string
	kodawari []string
	terms    []string
	sort     string
	byID     bool     // id が指定されたか（存在しない ID だけでも 0 件にするため）
	ids      []string // 存在する神社の ID だけ
}

// 保存リストで一度に指定できる ID の上限
const maxIDs = 100

// parseListQuery は不明な値を無視して検索条件を組み立てる
func parseListQuery(v url.Values) listQuery {
	var q listQuery
	if _, ok := findOption(worries, v.Get("worry")); ok {
		q.worry = v.Get("worry")
	}
	if _, ok := findOption(areas, v.Get("area")); ok {
		q.area = v.Get("area")
	}
	for _, k := range v["k"] {
		if _, ok := findOption(kodawaris, k); ok && !slices.Contains(q.kodawari, k) {
			q.kodawari = append(q.kodawari, k)
		}
	}
	q.terms = strings.Fields(strings.ToLower(v.Get("q")))
	if ids := v["id"]; len(ids) > 0 {
		q.byID = true
		for _, id := range ids[:min(len(ids), maxIDs)] {
			if _, ok := findShrine(id); ok && !slices.Contains(q.ids, id) {
				q.ids = append(q.ids, id)
			}
		}
	}
	switch s := v.Get("sort"); s {
	case sortPopular, sortNear:
		q.sort = s
	default:
		q.sort = sortNew
	}
	return q
}

func (q listQuery) match(s Shrine) bool {
	if q.byID && !slices.Contains(q.ids, s.ID) {
		return false
	}
	if q.worry != "" && s.Worry != q.worry {
		return false
	}
	if q.area != "" && s.Area != q.area {
		return false
	}
	for _, k := range q.kodawari {
		if !s.Has(k) {
			return false
		}
	}
	if len(q.terms) > 0 {
		text := strings.ToLower(strings.Join([]string{
			s.Name, label(worries, s.Worry), label(areas, s.Area), s.Stations,
			s.Catch, s.Benefit, s.AfterVisit,
		}, " "))
		for _, t := range q.terms {
			if !strings.Contains(text, t) {
				return false
			}
		}
	}
	return true
}

func (q listQuery) count() int {
	n := 0
	for _, s := range shrines {
		if q.match(s) {
			n++
		}
	}
	return n
}

// singleOptions は悩み・エリアのような「1つだけ選ぶ」チップを作る。
// 神社が1件もない選択肢は、選択中でない限り出さない。
func singleOptions(opts []Option, selected string, hasAny func(slug string) bool, with func(slug string) listQuery) []FilterOption {
	out := []FilterOption{}
	for _, o := range opts {
		on := o.Slug == selected
		if !on && !hasAny(o.Slug) {
			continue
		}
		next := o.Slug
		if on {
			next = ""
		}
		out = append(out, FilterOption{Slug: o.Slug, Label: o.Label, Count: with(next).count(), Selected: on})
	}
	return out
}

func buildShrineList(q listQuery) ShrineListResponse {
	matched := []Shrine{}
	for _, s := range shrines {
		if q.match(s) {
			matched = append(matched, s)
		}
	}
	switch q.sort {
	case sortPopular:
		slices.SortStableFunc(matched, func(a, b Shrine) int { return b.Popularity - a.Popularity })
	case sortNear:
		slices.SortStableFunc(matched, func(a, b Shrine) int { return a.WalkMin - b.WalkMin })
	}

	items := make([]ShrineItem, 0, len(matched))
	for _, s := range matched {
		w, _ := findOption(worries, s.Worry)
		a, _ := findOption(areas, s.Area)
		items = append(items, ShrineItem{
			ID: s.ID, Name: s.Name, Worry: Option{Slug: w.Slug, Label: w.Label}, Area: a,
			Stations: s.Stations, Access: s.Access(), Benefit: s.Benefit, Catch: s.Catch,
			AfterVisit: s.AfterVisit, Goshuin: s.Has("goshuin"),
		})
	}

	var f Filters
	f.Worry = singleOptions(worries, q.worry,
		func(slug string) bool {
			return slices.ContainsFunc(shrines, func(s Shrine) bool { return s.Worry == slug })
		},
		func(slug string) listQuery { n := q; n.worry = slug; return n })
	f.Area = singleOptions(areas, q.area,
		func(slug string) bool {
			return slices.ContainsFunc(shrines, func(s Shrine) bool { return s.Area == slug })
		},
		func(slug string) listQuery { n := q; n.area = slug; return n })
	for _, o := range kodawaris {
		on := slices.Contains(q.kodawari, o.Slug)
		n := q
		if on {
			n.kodawari = slices.DeleteFunc(slices.Clone(q.kodawari), func(k string) bool { return k == o.Slug })
		} else {
			n.kodawari = append(slices.Clone(q.kodawari), o.Slug)
		}
		f.Kodawari = append(f.Kodawari, FilterOption{Slug: o.Slug, Label: o.Label, Count: n.count(), Selected: on})
	}

	return ShrineListResponse{
		Total:   len(items),
		Items:   items,
		Filters: f,
		Q:       strings.Join(q.terms, " "),
		Sort:    q.sort,
	}
}

func handleShrines(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, buildShrineList(parseListQuery(r.URL.Query())))
}
