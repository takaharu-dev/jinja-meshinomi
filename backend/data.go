package main

import (
	"fmt"
	"slices"
	"strings"
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

	// 詳細ページ用
	Kana      string
	Address   string
	Highlight string // 見どころ（未入力なら詳細ページに出さない）
	MainPhoto string // メイン写真の説明（仮置き）
	Shops     []Shop // 参拝後のお店（未入力なら仮置きのお店を出す）
}

type Shop struct {
	Name      string `json:"name"`
	Genre     string `json:"genre"`
	Distance  string `json:"distance"`
	Budget    string `json:"budget"`
	Recommend string `json:"recommend"`
}

func (s Shrine) Has(kodawari string) bool {
	if kodawari == kodawariNearStation {
		return s.WalkMin <= 5
	}
	return slices.Contains(s.Tags, kodawari)
}

// StationList は最寄り駅を1つずつに分けて返す
func (s Shrine) StationList() []string {
	return strings.Split(s.Stations, "・")
}

func (s Shrine) Access() string {
	return fmt.Sprintf("%s 徒歩%d分", s.Nearest, s.WalkMin)
}

// 新着順に並べておく
var shrines = []Shrine{
	{ID: "atago", Name: "愛宕神社", Worry: "career", Area: "minato",
		Catch: "86段の「出世の石段」を登って、仕事のモヤモヤを切り替える", Stations: "神谷町駅・虎ノ門ヒルズ駅",
		Nearest: "神谷町駅", WalkMin: 5, Benefit: "出世・仕事運", AfterVisit: "近くの蕎麦屋で一杯",
		Popularity: 98, Tags: []string{"goshuin", "sake"},
		Kana: "あたごじんじゃ", Address: "東京都港区愛宕1-5-3",
		Highlight: "86段の急な石段と、山の上の静かな境内", MainPhoto: "出世の石段",
		Shops: []Shop{
			{Name: "店名が入ります", Genre: "蕎麦・日本酒", Distance: "徒歩◯分", Budget: "◯◯円〜", Recommend: "◯◯と日本酒"},
			{Name: "店名が入ります", Genre: "居酒屋", Distance: "徒歩◯分", Budget: "◯◯円〜", Recommend: "◯◯と地酒"},
		},
	},
	{ID: "tokyo-daijingu", Name: "東京大神宮", Worry: "love", Area: "chiyoda",
		Catch: "「東京のお伊勢さま」で良縁祈願。参拝後は神楽坂までひと歩き", Stations: "飯田橋駅",
		Nearest: "飯田橋駅", WalkMin: 5, Benefit: "縁結び", AfterVisit: "神楽坂の小料理屋で日本酒",
		Popularity: 95, Tags: []string{"goshuin", "sake", "solo"},
		Kana: "とうきょうだいじんぐう", Address: "東京都千代田区富士見2-4-1",
	},
	{ID: "hie", Name: "日枝神社", Worry: "career", Area: "chiyoda",
		Catch: "「山王さん」に仕事運と成長を願って、気持ちを立て直す", Stations: "赤坂駅・溜池山王駅",
		Nearest: "溜池山王駅", WalkMin: 3, Benefit: "仕事運・成長", AfterVisit: "赤坂で軽く一杯",
		Popularity: 80, Tags: []string{"goshuin"},
		Kana: "ひえじんじゃ", Address: "東京都千代田区永田町2-10-5",
	},
	{ID: "kotohiragu", Name: "金刀比羅宮", Worry: "career", Area: "minato",
		Catch: "虎ノ門のビル街で、運と流れを変えるお参り", Stations: "虎ノ門駅",
		Nearest: "虎ノ門駅", WalkMin: 1, Benefit: "開運・招福", AfterVisit: "虎ノ門の居酒屋で乾杯",
		Popularity: 60, Tags: []string{"solo"},
		Kana: "ことひらぐう", Address: "東京都港区虎ノ門1-2-7",
	},
	{ID: "akagi", Name: "赤城神社", Worry: "career", Area: "shinjuku",
		Catch: "仕事や産業の発展を見守る、神楽坂のモダンな神社", Stations: "神楽坂駅",
		Nearest: "神楽坂駅", WalkMin: 1, Benefit: "仕事・学業", AfterVisit: "神楽坂の和食店で日本酒",
		Popularity: 70, Tags: []string{"goshuin", "sake"},
		Kana: "あかぎじんじゃ", Address: "東京都新宿区赤城元町1-10",
	},
	{ID: "koami", Name: "小網神社", Worry: "money", Area: "chuo",
		Catch: "「強運厄除け」で知られる、日本橋の小さな神社", Stations: "人形町駅",
		Nearest: "人形町駅", WalkMin: 7, Benefit: "金運・厄除け", AfterVisit: "人形町で甘味と地酒",
		Popularity: 88, Tags: []string{"goshuin", "sake", "solo"},
		Kana: "こあみじんじゃ", Address: "東京都中央区日本橋小網町16-23",
	},
	{ID: "asagaya-shinmeigu", Name: "阿佐ヶ谷神明宮", Worry: "yakuyoke", Area: "suginami",
		Catch: "全国でも珍しい「八難除」で、悪い流れを心機一転", Stations: "阿佐ケ谷駅",
		Nearest: "阿佐ケ谷駅", WalkMin: 2, Benefit: "厄除け・開運", AfterVisit: "阿佐ヶ谷の酒場で乾杯",
		Popularity: 90, Tags: []string{"goshuin", "sake"},
		Kana: "あさがやしんめいぐう", Address: "東京都杉並区阿佐谷北1-25-5",
	},
	{ID: "izumo-tokyo", Name: "出雲大社東京分祠", Worry: "love", Area: "minato",
		Catch: "六本木のビル群の中で、良いご縁を願う", Stations: "六本木駅",
		Nearest: "六本木駅", WalkMin: 1, Benefit: "縁結び", AfterVisit: "六本木の路地裏で一杯",
		Popularity: 75, Tags: []string{"solo"},
		Kana: "いずもおおやしろとうきょうぶんし", Address: "東京都港区六本木7-18-5",
	},
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

// 「こんな日に行きたい」は悩みごとの文章を使う
var worryDays = map[string][]string{
	"career": {
		"上司や評価のことで、気持ちが沈んでいる日",
		"異動や転職など、仕事の節目を迎える前",
		"「このままでいいのかな」と、もやもやが晴れない週末",
	},
	"love": {
		"なかなか良い出会いがなくて、少し疲れてしまった日",
		"大切な人との関係を、もう一歩進めたいとき",
		"新しいご縁に向けて、気持ちを整えたい週末",
	},
	"enkiri": {
		"断ち切りたい習慣や人間関係があるとき",
		"新しいことを始める前に、気持ちをリセットしたい日",
	},
	"money": {
		"お金のことで、不安がふくらんでいる日",
		"新しい仕事や副業を始める前",
		"「流れを変えたい」と思った週末",
	},
	"yakuyoke": {
		"厄年を迎えて、なんとなく落ち着かないとき",
		"悪いことが続いて、流れを変えたい日",
		"新しい年度や季節の変わり目に、気持ちを新たにしたいとき",
	},
	"health": {
		"自分や家族の体のことが気がかりな日",
		"忙しさが続いて、心と体を休めたいとき",
	},
	"victory": {
		"試験や大事なプレゼンを控えているとき",
		"ここ一番の勝負の前に、気持ちを引き締めたい日",
	},
	"relations": {
		"職場や友人との関係に、少し疲れてしまった日",
		"新しい環境で、良い人間関係を築きたいとき",
	},
}

// 写真が入るまでのサムネイルの説明
var galleryThumbs = []string{"境内", "御朱印", "お店", "地酒", "料理"}

func defaultShops() []Shop {
	return []Shop{
		{Name: "店名が入ります", Genre: "和食・日本酒", Distance: "徒歩◯分", Budget: "◯◯円〜", Recommend: "◯◯と日本酒"},
		{Name: "店名が入ります", Genre: "居酒屋", Distance: "徒歩◯分", Budget: "◯◯円〜", Recommend: "◯◯と地酒"},
	}
}
