package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"
)

func TestLogs(t *testing.T) {
	rec := serve(newMux(""), http.MethodGet, "/api/logs")
	var got []VisitLog
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	if len(got) != len(logDefs) {
		t.Fatalf("logs = %d", len(got))
	}
	for i := 1; i < len(got); i++ {
		if got[i-1].Date < got[i].Date {
			t.Errorf("not newest first: %s < %s", got[i-1].Date, got[i].Date)
		}
	}
	for _, l := range got {
		if l.Shrine.ID == "" || l.Shrine.Name == "" || l.Worry == "" {
			t.Errorf("参拝した神社・悩みが空: %+v", l)
		}
		if !strings.HasPrefix(l.Title, l.Shrine.Name) {
			t.Errorf("タイトルと神社が一致しない: %q / %q", l.Title, l.Shrine.Name)
		}
	}
	if len(topData.RecentLogs) != 3 || topData.RecentLogs[0] != got[0] {
		t.Errorf("TOP の参拝記録が一致しない: %+v", topData.RecentLogs)
	}
}

func TestLogDetail(t *testing.T) {
	id := logDefs[0].ID
	rec := serve(newMux(""), http.MethodGet, "/api/logs/"+id)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	var got VisitLogDetail
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	if len(got.Body) == 0 || got.Shop.Genre == "" || len(got.Others) != len(logDefs)-1 {
		t.Errorf("detail: %+v", got)
	}
	for _, o := range got.Others {
		if o.ID == id {
			t.Error("others に自分が入っている")
		}
	}
	if rec := serve(newMux(""), http.MethodGet, "/api/logs/nope"); rec.Code != http.StatusNotFound {
		t.Errorf("unknown: status = %d", rec.Code)
	}
}
