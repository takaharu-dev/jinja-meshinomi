package main

import (
	"encoding/json"
	"net/http"
	"testing"
)

func TestStations(t *testing.T) {
	rec := serve(newMux(""), http.MethodGet, "/api/stations")
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	var got []StationGroup
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	byName := map[string]int{}
	for _, g := range got {
		if len(g.Stations) == 0 {
			t.Errorf("empty group %s", g.Area.Label)
		}
		for _, s := range g.Stations {
			if _, dup := byName[s.Name]; dup {
				t.Errorf("duplicate station %s", s.Name)
			}
			byName[s.Name] = s.Count
		}
	}
	if byName["神谷町駅"] != 1 || byName["虎ノ門ヒルズ駅"] != 1 || byName["六本木駅"] != 1 {
		t.Errorf("counts = %v", byName)
	}
	if got[0].Area.Slug != "chiyoda" {
		t.Errorf("first group = %s, want chiyoda（areas の順）", got[0].Area.Slug)
	}
}

func TestShrinesByStation(t *testing.T) {
	got := list(t, "station=溜池山王駅")
	if got.Total != 1 || got.Items[0].ID != "hie" || got.Station != "溜池山王駅" {
		t.Errorf("total=%d station=%q items=%v", got.Total, got.Station, ids(got))
	}
	// 存在しない駅は無視して全件
	if got := list(t, "station=どこか駅"); got.Total != len(shrines) || got.Station != "" {
		t.Errorf("unknown station: total=%d station=%q", got.Total, got.Station)
	}
	// 駅で絞ったときもチップの件数に反映される
	got = list(t, "station=神楽坂駅")
	if c := option(t, got.Filters.Worry, "career"); c.Count != 1 {
		t.Errorf("career count with station = %d, want 1", c.Count)
	}
}
