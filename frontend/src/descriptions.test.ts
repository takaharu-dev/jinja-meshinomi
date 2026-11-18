import { describe, expect, it } from "vitest";
import {
  areasDescription,
  featureDescription,
  featuresDescription,
  logDescription,
  logsDescription,
  shrineDescription,
  shrineListDescription,
  stationsDescription,
} from "./descriptions";
import type { FeatureDetail, ShrineDetail, ShrineListResponse, VisitLogDetail } from "./types";

const atago = {
  name: "愛宕神社",
  catch: "86段の「出世の石段」を登って、仕事のモヤモヤを切り替える",
  area: { slug: "minato", label: "港区" },
  stations: "神谷町駅・虎ノ門ヒルズ駅",
  info: [
    { label: "ご利益", value: "出世・仕事運" },
    { label: "御朱印", value: "あり" },
  ],
} as ShrineDetail;

describe("shrineDescription", () => {
  it("キャッチコピー＋ご利益・エリア・最寄り駅", () => {
    expect(shrineDescription(atago)).toBe(
      "86段の「出世の石段」を登って、仕事のモヤモヤを切り替える。愛宕神社（港区）のご利益は出世・仕事運。最寄り駅は神谷町駅・虎ノ門ヒルズ駅。",
    );
  });

  it("ご利益・キャッチコピーがなければ省く", () => {
    expect(shrineDescription({ ...atago, catch: "", info: [] })).toBe("愛宕神社（港区）。最寄り駅は神谷町駅・虎ノ門ヒルズ駅。");
  });
});

describe("shrineListDescription", () => {
  const data = { total: 2, items: [{ name: "愛宕神社" }, { name: "日枝神社" }] } as ShrineListResponse;
  it("見出し＋件数＋神社名", () => {
    expect(shrineListDescription("仕事・出世で行きたい神社と参拝後のお店", data)).toBe(
      "仕事・出世で行きたい神社と参拝後のお店の一覧（2件）：愛宕神社、日枝神社",
    );
  });
  it("0件", () => {
    expect(shrineListDescription("神社と参拝後のお店", { total: 0, items: [] } as unknown as ShrineListResponse)).toBe(
      "神社と参拝後のお店の一覧（0件）。",
    );
  });
});

describe("一覧ページ", () => {
  it("エリア：件数のあるエリアだけ", () => {
    const groups = [
      { name: "都心", areas: [{ slug: "minato", label: "港区", count: 3 }, { slug: "x", label: "台東区", count: 0 }] },
      { name: "西", areas: [{ slug: "suginami", label: "杉並区", count: 1 }] },
    ];
    expect(areasDescription(groups)).toBe("行きたいエリアを選ぶと、そのエリアの神社と参拝後のお店が見られます。港区（3件）、杉並区（1件）");
  });

  it("駅：件数のある駅だけ", () => {
    const groups = [{ area: { slug: "minato", label: "港区" }, stations: [{ name: "神谷町駅", count: 1 }, { name: "x駅", count: 0 }] }];
    expect(stationsDescription(groups)).toBe("最寄り駅を選ぶと、その駅から行ける神社と参拝後のお店が見られます。神谷町駅");
  });

  it("特集：タイトルは「」で囲む", () => {
    expect(featuresDescription([{ id: "a", title: "厄を祓って、酒場で乾杯", summary: "" }])).toBe(
      "悩みや気分に合わせて、神社と参拝後の一杯を選びました。「厄を祓って、酒場で乾杯」",
    );
  });

  it("参拝記録", () => {
    const logs = [{ id: "a", date: "2026-10-24", title: "日枝神社 → 赤坂で軽く一杯", worry: "", shrine: { id: "hie", name: "日枝神社", area: "千代田区" } }];
    expect(logsDescription(logs)).toBe("実際にお参りした神社と、帰りに寄ったお店の記録です。「日枝神社 → 赤坂で軽く一杯」（10月24日）");
  });
});

describe("詳細ページ", () => {
  it("特集：リード文、なければタイトル＋概要", () => {
    const f = { title: "一人で行ける神社と一杯", summary: "カウンターで気軽に飲めるお店", lead: "リード文" } as FeatureDetail;
    expect(featureDescription(f)).toBe("リード文");
    expect(featureDescription({ ...f, lead: "" })).toBe("一人で行ける神社と一杯。カウンターで気軽に飲めるお店");
  });

  it("参拝記録：日付・神社・タイトル（本文は使わない）", () => {
    const l = {
      date: "2026-10-24",
      title: "日枝神社 → 赤坂で軽く一杯",
      shrine: { id: "hie", name: "日枝神社", area: "千代田区" },
      body: ["（ここに本文が入ります）"],
    } as VisitLogDetail;
    expect(logDescription(l)).toBe("2026年10月24日に日枝神社（千代田区）をお参りした記録です。「日枝神社 → 赤坂で軽く一杯」");
  });
});
