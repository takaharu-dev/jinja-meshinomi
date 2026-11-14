package main

import (
	"encoding/json"
	"net/http"
	"testing"
)

func TestFeatures(t *testing.T) {
	rec := serve(newMux(""), http.MethodGet, "/api/features")
	var got []Feature
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	if len(got) != len(featureDefs) {
		t.Fatalf("features = %d", len(got))
	}
	// 「◯選」は実際の件数から付ける
	if got[0].Title != "仕事でモヤモヤした日に行きたい神社4選" {
		t.Errorf("title = %q", got[0].Title)
	}
	if topData.MainFeature != got[0] || len(topData.SubFeatures) != len(got)-1 {
		t.Errorf("TOP の特集が特集データと一致しない: %+v", topData.MainFeature)
	}
}

func TestFeatureDetail(t *testing.T) {
	for _, d := range featureDefs {
		rec := serve(newMux(""), http.MethodGet, "/api/features/"+d.ID)
		if rec.Code != http.StatusOK {
			t.Fatalf("%s: status = %d", d.ID, rec.Code)
		}
		var got FeatureDetail
		if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
			t.Fatal(err)
		}
		if len(got.Items) == 0 {
			t.Errorf("%s: 対象の神社が0件", d.ID)
		}
		if len(got.Others) != len(featureDefs)-1 {
			t.Errorf("%s: others = %d", d.ID, len(got.Others))
		}
		for _, o := range got.Others {
			if o.ID == d.ID {
				t.Errorf("%s: others に自分が入っている", d.ID)
			}
		}
		if got.ListQuery == "" || got.Lead == "" {
			t.Errorf("%s: listQuery=%q lead=%q", d.ID, got.ListQuery, got.Lead)
		}
	}
	if rec := serve(newMux(""), http.MethodGet, "/api/features/nope"); rec.Code != http.StatusNotFound {
		t.Errorf("unknown: status = %d", rec.Code)
	}
}
