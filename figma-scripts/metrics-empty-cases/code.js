// ─────────────────────────────────────────────────────────────────────────────
// 지표 · 값이 없을 때 케이스 정리 (2026-11-06) — 일회용
// LLM-Gateway 파일(tsZ8GUucs3EdK1a6bhbF0c) › 'LLM Gateway 엔드포인트 상세 페이지 - 지표 제공' 페이지에서 실행한다.
//
//   기존 '운영 지표 · PRD-368' 섹션의 케이스 프레임을 복제해 새 섹션에 모으고, 값을 아래 규칙대로 바꾼다.
//     C1  수집되고 값이 옴          → 다 보임
//     C2  수집되지만 아직 덜 옴      → 표본 부족 (호출 0건도 같다 — 단 요청 수는 '0건' 그대로)
//     C3  수집되다 끊김 · 서빙 중단  → '-' (그래프는 끊기기 전 점까지). 프리픽스 캐시를 꺼 둔 것도 '-'
//     C4  아예 수집 안 됨            → 카드 미노출 (이유는 섹션 설명 한 줄로 갈음, 11/06)
//     처리량  요청 수는 최소 단위가 없어 표본 부족이 없다. 0건이면 '0건' + 그래프 자리 문장.
//             출력 처리량은 호출 0건이면 '-' (0 tok/s 는 '느리다' 로 읽힌다)
//     C0 불러오는 중 · C5 불러오기 실패 — 기존 화면 그대로
//
//   원격 Figma MCP 에는 Pretendard 가 없어 이 파일의 글자를 바꿀 수 없다 — 그래서 데스크톱에서 돌리는 플러그인으로 둔다.
//   같은 이름의 섹션이 이미 있으면 아무것도 하지 않는다(두 번 눌러도 안전).
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_ID = "918:50299";
const OLD_SECTION_ID = "957:47694";
const GROUP_BAND_ID = "947:8982";
const EMPTY_GRAPH_ID = "923:4392";
const SECTION_NAME = "운영 지표 · 값이 없을 때 — 케이스 정리 (11/06)";
const W = 2210;
const ROW_Y = [560, 4300];

// [키, 줄, 칸, 원본 프레임, 원본 머리띠, 머리띠 글자]
const PLAN = [
  ["C0", 0, 0, "954:30502", "957:47679", "C0 · 불러오는 중"],
  ["C1", 0, 1, "918:50300", "947:8969", "C1 · 수집되고 값이 옴 — 다 보임"],
  ["C2", 0, 2, "954:23121", "947:8995", "C2 · 수집되지만 덜 옴 — 표본 부족"],
  ["C2-0", 0, 3, "954:19071", "947:8990", "C2 · 호출 0건 — 요청 수 0건 · 출력 처리량 -"],
  ["C3-a", 1, 0, "954:27359", "947:9028", "C3 · 수집이 끊김 — -"],
  ["C3-b", 1, 1, "954:26422", "947:9023", "C3 · 서빙 중단 — -"],
  ["C3-c", 1, 2, "3491:8592", "947:9033", "C3 · 프리픽스 캐시 꺼짐 — -"],
  ["C4", 1, 3, "954:24806", "947:9013", "C4 · 수집 안 됨 — 카드 미노출"],
  ["C5", 1, 4, "954:31063", "957:47680", "C5 · 불러오기 실패"],
];

const RULES = [
  "값이 없을 때 — 정리 (2026-11-06)",
  "C1  수집되고 값이 옴 → 다 보임",
  "C2  수집되지만 아직 덜 옴 → 표본 부족. 호출 0건도 같다(요청 수만 '0건').",
  "C3  수집되다 끊김 · 서빙 중단 · 프리픽스 캐시 꺼짐 → '-'. 그래프는 끊기기 전 점까지. 이유는 그래프 자리 문장으로 따로.",
  "C4  아예 수집 안 됨 → 카드 미노출. 이유는 섹션 설명 '모델 유형과 설정에 따라 표시되는 지표가 달라질 수 있습니다.' 로 갈음(11/06).",
  "처리량  요청 수는 최소 단위가 없어 표본 부족이 없다. 0건이면 '0건' + '선택한 기간에 호출이 없습니다.'",
  "        출력 처리량은 호출 0건이면 '-' (0 tok/s 는 '느리다'로 읽힌다).",
  "C0 불러오는 중 · C5 불러오기 실패는 그대로.",
  "PdM 확인 — 표본 부족 기준 20건(확정 전).",
];

async function loadFontsIn(node) {
  const texts = node.type === "TEXT" ? [node] : node.findAll((n) => n.type === "TEXT");
  const seen = new Set();
  for (const t of texts) {
    const fonts = t.characters.length ? t.getRangeAllFontNames(0, t.characters.length) : [t.fontName];
    for (const f of fonts) {
      if (typeof f === "symbol") continue;
      const k = f.family + "/" + f.style;
      if (seen.has(k)) continue;
      seen.add(k);
      await figma.loadFontAsync(f);
    }
  }
}

const propKey = (inst, name) => Object.keys(inst.componentProperties).find((k) => k.split("#")[0] === name);
const setProps = (inst, map) => {
  const o = {};
  for (const [name, v] of Object.entries(map)) { const k = propKey(inst, name); if (k) o[k] = v; }
  inst.setProperties(o);
};
const cardsIn = (frame) => frame.findAll((n) => n.type === "INSTANCE" && n.name === "지표/카드");
const cardTitled = (frame, title) => cardsIn(frame).find((c) => { const k = propKey(c, "제목"); return k && String(c.componentProperties[k].value).trim().startsWith(title); });

async function setEmptyGraph(card, text) {
  const empty = await figma.getNodeByIdAsync(EMPTY_GRAPH_ID);
  setProps(card, { "그래프": empty.id });
  const g = card.findAll((n) => n.type === "INSTANCE").find((n) => propKey(n, "안내"));
  if (g) { await loadFontsIn(g); setProps(g, { "안내": text }); }
}

async function main() {
  const page = await figma.getNodeByIdAsync(PAGE_ID);
  if (!page || page.type !== "PAGE") { figma.closePlugin("LLM Gateway 지표 페이지를 찾을 수 없습니다. LLM-Gateway 파일에서 실행하세요."); return; }
  await figma.setCurrentPageAsync(page);
  if (page.children.some((n) => n.type === "SECTION" && n.name === SECTION_NAME)) { figma.closePlugin("이미 정리 섹션이 있습니다. 다시 만들려면 그 섹션을 지우고 실행하세요."); return; }

  const old = await figma.getNodeByIdAsync(OLD_SECTION_ID);
  const sec = figma.createSection();
  sec.name = SECTION_NAME;
  page.appendChild(sec);
  sec.x = old.x;
  sec.y = old.y + old.height + 400;

  // 그룹 띠 + 규칙 메모
  const group = (await figma.getNodeByIdAsync(GROUP_BAND_ID)).clone();
  await loadFontsIn(group);
  sec.appendChild(group); group.x = 80; group.y = 80;
  const gTexts = group.findAll((n) => n.type === "TEXT").sort((a, b) => b.fontSize - a.fontSize);
  if (gTexts[0]) gTexts[0].characters = "운영 지표 · 값이 없을 때 — 케이스 정리";

  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  const memo = figma.createText();
  memo.fontName = { family: "Pretendard", style: "Regular" };
  memo.characters = RULES.join("\n");
  memo.fontSize = 28; memo.lineHeight = { unit: "PIXELS", value: 44 };
  memo.setRangeFontName(0, RULES[0].length, { family: "Pretendard", style: "SemiBold" });
  sec.appendChild(memo); memo.x = 80 + 5 * W + 80; memo.y = 560;

  const made = {};
  for (const [key, row, col, fid, bid, label] of PLAN) {
    const src = await figma.getNodeByIdAsync(fid);
    const f = src.clone();
    await loadFontsIn(f);
    sec.appendChild(f);
    f.x = 80 + col * W; f.y = ROW_Y[row] + 124; f.name = `${key} · ${label}`;
    const b = (await figma.getNodeByIdAsync(bid)).clone();
    await loadFontsIn(b);
    sec.appendChild(b);
    b.x = f.x; b.y = ROW_Y[row];
    const bt = b.findAll((n) => n.type === "TEXT").sort((a, c) => c.characters.length - a.characters.length)[0];
    if (bt) bt.characters = label;
    made[key] = f;
  }

  // C2-0 호출 0건 — 호출 기준은 표본 부족, 요청 수는 0건 그대로, 출력 처리량 · 프리픽스 캐시는 '-' / 표본 부족
  { const f = made["C2-0"];
    for (const t of ["토큰 간 간격", "오류율", "오류 종류"]) { const c = cardTitled(f, t); if (c) setProps(c, { "값 1": "표본 부족" }); }
    const tps = cardTitled(f, "출력 처리량");
    if (tps) { setProps(tps, { "값 1": "-", "단위 보임": false }); await setEmptyGraph(tps, "선택한 기간에 호출이 없습니다."); }
    const pc = cardTitled(f, "프리픽스 캐시 적중률");
    if (pc) { setProps(pc, { "값 1": "표본 부족", "단위 보임": false }); await setEmptyGraph(pc, "선택한 기간에 호출이 없습니다."); } }

  // C3 — '알 수 없음' · '표본 부족'(캐시 꺼짐)을 '-' 로
  for (const key of ["C3-a", "C3-b"]) {
    for (const c of cardsIn(made[key])) { const k = propKey(c, "값 1"); if (k && c.componentProperties[k].value === "알 수 없음") setProps(c, { "값 1": "-" }); }
  }
  { const c = cardTitled(made["C3-c"], "프리픽스 캐시 적중률"); if (c) setProps(c, { "값 1": "-" }); }

  sec.resizeWithoutConstraints(80 + 5 * W + 80 + 2400, ROW_Y[1] + 124 + 2800 + 200);
  figma.viewport.scrollAndZoomIntoView([sec]);
  figma.closePlugin("정리 섹션을 만들었습니다.");
}

main().catch((e) => figma.closePlugin("실패: " + (e && e.message ? e.message : String(e))));
