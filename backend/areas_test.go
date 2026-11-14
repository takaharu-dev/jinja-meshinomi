package main

import (
	"encoding/json"
	"net/http"
	"testing"
)

func TestAreas(t *testing.T) {
	rec := serve(newMux(""), http.MethodGet, "/api/areas")
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	var got []AreaGroupCount
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	counts := map[string]int{}
	total := 0
	for _, g := range got {
		for _, a := range g.Areas {
			counts[a.Slug] = a.Count
			total += a.Count
		}
	}
	if len(got) != 4 || counts["minato"] != 3 || counts["chiyoda"] != 2 || counts["shibuya"] != 0 {
		t.Errorf("groups=%d counts=%v", len(got), counts)
	}
	if total != len(shrines) {
		t.Errorf("total = %d, want %d（全神社がどこかのエリアに入る）", total, len(shrines))
	}
}
