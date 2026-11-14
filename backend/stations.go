package main

import (
	"net/http"
	"slices"
)

// GET /api/stations
// 最寄り駅をエリアごとにまとめ、駅ごとの神社の件数を返す（エリアの並びは areas の順）

type StationCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type StationGroup struct {
	Area     Option         `json:"area"`
	Stations []StationCount `json:"stations"`
}

func buildStations() []StationGroup {
	out := []StationGroup{}
	for _, a := range areas {
		g := StationGroup{Area: a, Stations: []StationCount{}}
		for _, s := range shrines {
			if s.Area != a.Slug {
				continue
			}
			for _, name := range s.StationList() {
				if !slices.ContainsFunc(g.Stations, func(c StationCount) bool { return c.Name == name }) {
					g.Stations = append(g.Stations, StationCount{Name: name, Count: listQuery{station: name}.count()})
				}
			}
		}
		if len(g.Stations) > 0 {
			out = append(out, g)
		}
	}
	return out
}

func handleStations(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, buildStations())
}
