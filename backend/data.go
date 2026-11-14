package main

import (
	"fmt"
	"slices"
)

// 神社・マスタデータ。写真・店名・数値は仮置き。
// 今後DBやファイルから読み込む形に置き換える想定。

type Option struct {
	Slug  string `json:"slug"`
	Label string `json:"label"`
	Icon  string `json:"icon,omitempty"`
}

var worries = []Option{
	{Slug: "career", Label: "仕事・出世", Icon: "出"},
	{Slug: "love", Label: "恋愛・縁結び", Icon: "縁"},
	{Slug: "enkiri", Label: "縁切り", Icon: "切"},
	{Slug: "money", Label: "金運", Icon: "金"},
	{Slug: "yakuyoke", Label: "厄除け", Icon: "厄"},
	{Slug: "health", Label: "健康", Icon: "健"},
	{Slug: "victory", Label: "勝負運", Icon: "勝"},
	{Slug: "relations", Label: "人間関係", Icon: "和"},
}

var areas = []Option{
	{Slug: "chiyoda", Label: "千代田区"},
	{Slug: "chuo", Label: "中央区"},
	{Slug: "minato", Label: "港区"},
	{Slug: "shinjuku", Label: "新宿区"},
	{Slug: "shibuya", Label: "渋谷区"},
	{Slug: "toshima", Label: "豊島区"},
	{Slug: "taito", Label: "台東区"},
	{Slug: "sumida", Label: "墨田区"},
	{Slug: "koto", Label: "江東区"},
	{Slug: "suginami", Label: "杉並区"},
	{Slug: "setagaya", Label: "世田谷区"},
	{Slug: "musashino", Label: "武蔵野市"},
}

const kodawariNearStation = "near-station"

var kodawaris = []Option{
	{Slug: "goshuin", Label: "御朱印あり"},
	{Slug: kodawariNearStation, Label: "駅から徒歩5分以内"},
	{Slug: "sake", Label: "日本酒が飲めるお店あり"},
	{Slug: "solo", Label: "一人でも入りやすいお店"},
}

type Shrine struct {
	ID         string
	Name       string
	Worry      string // worries の slug
	Area       string // areas の slug
	Catch      string
	Stations   string // 最寄り駅（表示用）
	Nearest    string // 一番近い駅
	WalkMin    int    // Nearest からの徒歩分数
	Benefit    string
	AfterVisit string
	Popularity int
	Tags       []string // kodawaris の slug（駅から徒歩5分以内は WalkMin から判定）
}

func (s Shrine) Has(kodawari string) bool {
	if kodawari == kodawariNearStation {
		return s.WalkMin <= 5
	}
	return slices.Contains(s.Tags, kodawari)
}

func (s Shrine) Access() string {
	return fmt.Sprintf("%s 徒歩%d分", s.Nearest, s.WalkMin)
}

// 新着順に並べておく
var shrines = []Shrine{
	{ID: "atago", Name: "愛宕神社", Worry: "career", Area: "minato",
		Catch: "86段の「出世の石段」を登って、仕事のモヤモヤを切り替える", Stations: "神谷町駅・虎ノ門ヒルズ駅",
		Nearest: "神谷町駅", WalkMin: 5, Benefit: "出世・仕事運", AfterVisit: "近くの蕎麦屋で一杯",
		Popularity: 98, Tags: []string{"goshuin", "sake"}},
	{ID: "tokyo-daijingu", Name: "東京大神宮", Worry: "love", Area: "chiyoda",
		Catch: "「東京のお伊勢さま」で良縁祈願。参拝後は神楽坂までひと歩き", Stations: "飯田橋駅",
		Nearest: "飯田橋駅", WalkMin: 5, Benefit: "縁結び", AfterVisit: "神楽坂の小料理屋で日本酒",
		Popularity: 95, Tags: []string{"goshuin", "sake", "solo"}},
	{ID: "hie", Name: "日枝神社", Worry: "career", Area: "chiyoda",
		Catch: "「山王さん」に仕事運と成長を願って、気持ちを立て直す", Stations: "赤坂駅・溜池山王駅",
		Nearest: "溜池山王駅", WalkMin: 3, Benefit: "仕事運・成長", AfterVisit: "赤坂で軽く一杯",
		Popularity: 80, Tags: []string{"goshuin"}},
	{ID: "kotohiragu", Name: "金刀比羅宮", Worry: "career", Area: "minato",
		Catch: "虎ノ門のビル街で、運と流れを変えるお参り", Stations: "虎ノ門駅",
		Nearest: "虎ノ門駅", WalkMin: 1, Benefit: "開運・招福", AfterVisit: "虎ノ門の居酒屋で乾杯",
		Popularity: 60, Tags: []string{"solo"}},
	{ID: "akagi", Name: "赤城神社", Worry: "career", Area: "shinjuku",
		Catch: "仕事や産業の発展を見守る、神楽坂のモダンな神社", Stations: "神楽坂駅",
		Nearest: "神楽坂駅", WalkMin: 1, Benefit: "仕事・学業", AfterVisit: "神楽坂の和食店で日本酒",
		Popularity: 70, Tags: []string{"goshuin", "sake"}},
	{ID: "koami", Name: "小網神社", Worry: "money", Area: "chuo",
		Catch: "「強運厄除け」で知られる、日本橋の小さな神社", Stations: "人形町駅",
		Nearest: "人形町駅", WalkMin: 7, Benefit: "金運・厄除け", AfterVisit: "人形町で甘味と地酒",
		Popularity: 88, Tags: []string{"goshuin", "sake", "solo"}},
	{ID: "asagaya-shinmeigu", Name: "阿佐ヶ谷神明宮", Worry: "yakuyoke", Area: "suginami",
		Catch: "全国でも珍しい「八難除」で、悪い流れを心機一転", Stations: "阿佐ケ谷駅",
		Nearest: "阿佐ケ谷駅", WalkMin: 2, Benefit: "厄除け・開運", AfterVisit: "阿佐ヶ谷の酒場で乾杯",
		Popularity: 90, Tags: []string{"goshuin", "sake"}},
	{ID: "izumo-tokyo", Name: "出雲大社東京分祠", Worry: "love", Area: "minato",
		Catch: "六本木のビル群の中で、良いご縁を願う", Stations: "六本木駅",
		Nearest: "六本木駅", WalkMin: 1, Benefit: "縁結び", AfterVisit: "六本木の路地裏で一杯",
		Popularity: 75, Tags: []string{"solo"}},
}

func findOption(opts []Option, slug string) (Option, bool) {
	for _, o := range opts {
		if o.Slug == slug {
			return o, true
		}
	}
	return Option{}, false
}

func label(opts []Option, slug string) string {
	o, _ := findOption(opts, slug)
	return o.Label
}
