package main

import (
	"encoding/json"
	"net/http"
	"slices"
	"testing"
)

func TestShrineDetail(t *testing.T) {
	rec := serve(newMux(""), http.MethodGet, "/api/shrines/atago")
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	var d ShrineDetail
	if err := json.NewDecoder(rec.Body).Decode(&d); err != nil {
		t.Fatal(err)
	}
	if d.Name != "愛宕神社" || d.Worry.Slug != "career" || d.Area.Label != "港区" {
		t.Errorf("basic fields: %+v", d)
	}
	if want := []string{"仕事・出世", "御朱印あり", "駅から徒歩5分以内"}; !slices.Equal(d.Tags, want) {
		t.Errorf("tags = %v, want %v", d.Tags, want)
	}
	if len(d.Days) == 0 || len(d.Shops) != 2 || len(d.Thumbs) != 5 {
		t.Errorf("days=%d shops=%d thumbs=%d", len(d.Days), len(d.Shops), len(d.Thumbs))
	}
	// 同じ悩み（仕事・出世）の神社が人気順で並ぶ
	var rel []string
	for _, r := range d.Related {
		rel = append(rel, r.ID)
	}
	if want := []string{"hie", "akagi", "kotohiragu"}; !slices.Equal(rel, want) {
		t.Errorf("related = %v, want %v", rel, want)
	}
}

func TestShrineDetailDefaults(t *testing.T) {
	// 見どころ・お店が未入力の神社でも、仮置きで埋まる
	d := buildShrineDetail(shrineByID("koami"))
	if len(d.Shops) == 0 {
		t.Error("shops should fall back to placeholders")
	}
	for _, row := range d.Info {
		if row.Label == "見どころ" {
			t.Errorf("見どころ should be omitted: %+v", row)
		}
	}
	if slices.Contains(d.Tags, "駅から徒歩5分以内") {
		t.Errorf("koami is 7 min walk: %v", d.Tags)
	}
	if len(d.Related) != 3 {
		t.Errorf("related should be filled up by popularity: %v", d.Related)
	}
	for _, r := range d.Related {
		if r.ID == "koami" {
			t.Error("related should not include itself")
		}
	}
}

func TestShrineDetailNotFound(t *testing.T) {
	if rec := serve(newMux(""), http.MethodGet, "/api/shrines/nope"); rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", rec.Code)
	}
}
