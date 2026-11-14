package main

// TOPページ用のデータ。写真・店名は仮置き。
// 今後DBやファイルから読み込む形に置き換える想定。

type Worry struct {
	Slug  string `json:"slug"`
	Label string `json:"label"`
	Icon  string `json:"icon"`
}

type ShrineCard struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Worry      string `json:"worry"`
	Area       string `json:"area"`
	Access     string `json:"access"`
	AfterVisit string `json:"afterVisit"`
}

type Feature struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	Summary string `json:"summary"`
}

type AreaGroup struct {
	Name  string   `json:"name"`
	Areas []string `json:"areas"`
}

type VisitLog struct {
	ID    string `json:"id"`
	Date  string `json:"date"`
	Title string `json:"title"`
	Worry string `json:"worry"`
}

type TopResponse struct {
	Worries       []Worry      `json:"worries"`
	Popular       []ShrineCard `json:"popular"`
	MainFeature   Feature      `json:"mainFeature"`
	SubFeatures   []Feature    `json:"subFeatures"`
	AreaGroups    []AreaGroup  `json:"areaGroups"`
	RecentLogs    []VisitLog   `json:"recentLogs"`
	InstagramUser string       `json:"instagramUser"`
}

var topData = TopResponse{
	Worries: []Worry{
		{Slug: "career", Label: "仕事・出世", Icon: "出"},
		{Slug: "love", Label: "恋愛・縁結び", Icon: "縁"},
		{Slug: "enkiri", Label: "縁切り", Icon: "切"},
		{Slug: "money", Label: "金運", Icon: "金"},
		{Slug: "yakuyoke", Label: "厄除け", Icon: "厄"},
		{Slug: "health", Label: "健康", Icon: "健"},
		{Slug: "victory", Label: "勝負運", Icon: "勝"},
		{Slug: "relations", Label: "人間関係", Icon: "和"},
	},
	Popular: []ShrineCard{
		{ID: "atago", Name: "愛宕神社", Worry: "仕事・出世", Area: "港区", Access: "神谷町駅 徒歩5分", AfterVisit: "近くの蕎麦屋で一杯"},
		{ID: "tokyo-daijingu", Name: "東京大神宮", Worry: "恋愛・縁結び", Area: "千代田区", Access: "飯田橋駅 徒歩5分", AfterVisit: "神楽坂の小料理屋"},
		{ID: "asagaya-shinmeigu", Name: "阿佐ヶ谷神明宮", Worry: "厄除け", Area: "杉並区", Access: "阿佐ケ谷駅 徒歩2分", AfterVisit: "阿佐ヶ谷の酒場"},
		{ID: "koami", Name: "小網神社", Worry: "金運", Area: "中央区", Access: "人形町駅 徒歩5分", AfterVisit: "人形町で甘味と地酒"},
	},
	MainFeature: Feature{ID: "career-5", Title: "仕事でモヤモヤした日に行きたい神社5選", Summary: "参拝のあとに寄りたい蕎麦屋と酒場も"},
	SubFeatures: []Feature{
		{ID: "kagurazaka-night", Title: "縁結び神社と、神楽坂の夜", Summary: "良縁祈願のあとは小料理屋で日本酒"},
		{ID: "yakuyoke-kanpai", Title: "厄を祓って、酒場で乾杯", Summary: "厄除け神社と、帰りに寄れる居酒屋"},
		{ID: "solo", Title: "一人で行ける神社と一杯", Summary: "カウンターで気軽に飲めるお店"},
	},
	AreaGroups: []AreaGroup{
		{Name: "都心", Areas: []string{"千代田区", "中央区", "港区"}},
		{Name: "副都心", Areas: []string{"新宿区", "渋谷区", "豊島区"}},
		{Name: "下町", Areas: []string{"台東区", "墨田区", "江東区"}},
		{Name: "西エリア", Areas: []string{"杉並区", "世田谷区", "武蔵野市"}},
	},
	RecentLogs: []VisitLog{
		{ID: "log-1024", Date: "10月24日", Title: "日枝神社 → 赤坂で軽く一杯", Worry: "仕事・出世"},
		{ID: "log-1020", Date: "10月20日", Title: "赤城神社 → 神楽坂の和食店", Worry: "仕事・出世"},
		{ID: "log-1017", Date: "10月17日", Title: "出雲大社東京分祠 → 六本木で一杯", Worry: "恋愛・縁結び"},
	},
	InstagramUser: "jinja_meshinomi",
}
