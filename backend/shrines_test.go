package main

import (
	"encoding/json"
	"net/http"
	"net/url"
	"slices"
	"testing"
)

func list(t *testing.T, query string) ShrineListResponse {
	t.Helper()
	v, err := url.ParseQuery(query)
	if err != nil {
		t.Fatalf("parse %q: %v", query, err)
	}
	rec := serve(newMux(""), http.MethodGet, "/api/shrines?"+v.Encode())
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	var got ShrineListResponse
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	return got
}

func ids(r ShrineListResponse) []string {
	out := []string{}
	for _, it := range r.Items {
		out = append(out, it.ID)
	}
	return out
}

func option(t *testing.T, opts []FilterOption, slug string) FilterOption {
	t.Helper()
	for _, o := range opts {
		if o.Slug == slug {
			return o
		}
	}
	t.Fatalf("option %q not found", slug)
	return FilterOption{}
}

func TestShrinesFilter(t *testing.T) {
	cases := []struct {
		query string
		want  int
	}{
		{"", len(shrines)},
		{"worry=career", 4},
		{"worry=career&area=minato", 2},
		{"worry=career&k=goshuin&k=sake", 2},
		{"k=near-station", 7},        // 小網神社（徒歩7分）以外
		{"k=solo&k=near-station", 3}, // 東京大神宮・金刀比羅宮・出雲大社東京分祠
		{"q=神楽坂", 2},
		{"q=神楽坂 日本酒", 2},
		{"q=存在しない", 0},
		{"worry=unknown&area=nowhere&k=bad", len(shrines)}, // 不明な値は無視
	}
	for _, c := range cases {
		got := list(t, c.query)
		if got.Total != c.want || len(got.Items) != c.want {
			t.Errorf("%q: total=%d items=%v, want %d", c.query, got.Total, ids(got), c.want)
		}
	}
}

func TestShrinesCounts(t *testing.T) {
	got := list(t, "worry=career")

	career := option(t, got.Filters.Worry, "career")
	if !career.Selected || career.Count != len(shrines) {
		t.Errorf("career: %+v（押すと解除されて全件になるはず）", career)
	}
	if love := option(t, got.Filters.Worry, "love"); love.Selected || love.Count != 2 {
		t.Errorf("love: %+v", love)
	}
	if minato := option(t, got.Filters.Area, "minato"); minato.Count != 2 {
		t.Errorf("minato: %+v", minato)
	}
	if suginami := option(t, got.Filters.Area, "suginami"); suginami.Count != 0 {
		t.Errorf("suginami: %+v（仕事・出世の杉並区はないので0）", suginami)
	}
	// 神社が1件もない選択肢は出さない
	for _, o := range got.Filters.Worry {
		if o.Slug == "health" {
			t.Errorf("health should be hidden: %+v", o)
		}
	}
	if len(got.Filters.Kodawari) != len(kodawaris) {
		t.Errorf("kodawari = %d", len(got.Filters.Kodawari))
	}
}

func TestShrinesSelectedEmptyOptionIsShown(t *testing.T) {
	got := list(t, "worry=health")
	if got.Total != 0 {
		t.Fatalf("total = %d", got.Total)
	}
	if h := option(t, got.Filters.Worry, "health"); !h.Selected {
		t.Errorf("health: %+v", h)
	}
}

func TestShrinesSort(t *testing.T) {
	if got := list(t, "sort=popular"); got.Items[0].ID != "atago" || got.Sort != sortPopular {
		t.Errorf("popular: %v", ids(got))
	}
	near := list(t, "sort=near")
	for i := 1; i < len(near.Items); i++ {
		prev := shrineByID(near.Items[i-1].ID).WalkMin
		cur := shrineByID(near.Items[i].ID).WalkMin
		if prev > cur {
			t.Fatalf("near not sorted: %v", ids(near))
		}
	}
	if got := list(t, "sort=bogus"); got.Sort != sortNew || got.Items[0].ID != shrines[0].ID {
		t.Errorf("default sort: %s %v", got.Sort, ids(got))
	}
}

func TestShrinesEcho(t *testing.T) {
	got := list(t, "q=  神楽坂   日本酒 ")
	if got.Q != "神楽坂 日本酒" {
		t.Errorf("q = %q", got.Q)
	}
}

func shrineByID(id string) Shrine {
	for _, s := range shrines {
		if s.ID == id {
			return s
		}
	}
	return Shrine{}
}

func TestShrinesByID(t *testing.T) {
	got := list(t, "id=hie&id=atago&id=nope&id=hie")
	if want := []string{"atago", "hie"}; !slices.Equal(ids(got), want) {
		t.Errorf("ids = %v, want %v（重複・存在しない ID は無視、並びは新着順）", ids(got), want)
	}
	if got := list(t, "id=nope"); got.Total != 0 {
		t.Errorf("unknown id only: total = %d, want 0", got.Total)
	}
}
