package main

import "net/http"

// GET /api/areas

type AreaCount struct {
	Slug  string `json:"slug"`
	Label string `json:"label"`
	Count int    `json:"count"`
}

type AreaGroupCount struct {
	Name  string      `json:"name"`
	Areas []AreaCount `json:"areas"`
}

func buildAreas() []AreaGroupCount {
	out := make([]AreaGroupCount, 0, len(topData.AreaGroups))
	for _, g := range topData.AreaGroups {
		gc := AreaGroupCount{Name: g.Name, Areas: make([]AreaCount, 0, len(g.Areas))}
		for _, a := range g.Areas {
			gc.Areas = append(gc.Areas, AreaCount{Slug: a.Slug, Label: a.Label, Count: listQuery{area: a.Slug}.count()})
		}
		out = append(out, gc)
	}
	return out
}

func handleAreas(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, buildAreas())
}
