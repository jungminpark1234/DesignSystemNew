// ─────────────────────────────────────────────────────────────────────────────
// 텍스트 스타일 맞추기 (2026-11-06)
// 텍스트 스타일이 안 붙은 글자를 찾아, 크기 · 굵기 · 줄 높이가 가장 가까운 '정의된' 텍스트 스타일로 바꾼다.
//
//   후보 스타일
//     1. DS 기본 스타일 — Design system 라이브러리의 Pretendard 텍스트 스타일(PRESET_STYLE_KEYS).
//        라이브러리 스타일은 플러그인 API 로 목록을 받을 수 없어서 키를 넣어 둔다. 키를 더하면 후보가 는다.
//     2. 이 파일의 로컬 텍스트 스타일 (옵션, 기본 켬)
//     3. 이 범위에서 이미 쓰고 있는 다른 라이브러리 스타일 (옵션, 기본 끔)
//
//   찾는 대상: 텍스트 스타일이 없는 글자 구간. 한 레이어 안에서 일부만 스타일이 없어도 그 구간만 잡는다.
//     옵션을 켜면 후보에 없는 다른 스타일이 붙은 구간도 대상이 된다.
//   짝짓기: 크기 차이 → 굵기 차이 → 줄 높이 차이 순으로 가장 가까운 스타일. mono 글꼴은 mono 스타일끼리만.
//     정확 = 크기 · 굵기가 같음 / 근접 = 크기 차이가 허용치(기본 1px) 안 + 굵기 한 단계(100) 안 / 먼 짝 = 그 밖.
//     'Bold'(700)는 SemiBold(600)와 한 단계 차이라 근접으로 잡힌다 — 원격 Figma MCP 가 Pretendard SemiBold
//     자리에 Noto Sans KR Bold 를 넣는 관례와 맞는다.
//   적용: 묶음별로 고른 스타일을 붙인다. 되돌리려면 Cmd+Z.
// ─────────────────────────────────────────────────────────────────────────────

/** Design system 라이브러리(4eBLkDTyAKdJ9P1TTjpluW)의 텍스트 스타일 키. */
const PRESET_STYLE_KEYS = [
  "32afeaa90de4427bf48409284bc4c6834de0ab91", // Body/sm/regular
  "280f8206636feaf20a9a1f8d8d6b9a2965004afe", // Body/sm/medium
  "cca8d022c1559fb06accd400d15526190c484f71", // Body/sm/semibold
  "f62af8518b1b01969c314383ecbb1a1040d5be73", // Body/md/regular
  "27f1e7b1baabeedbd3acbeae9ec42134b814d74c", // Body/md/medium
  "49236859e85cbc9410178587a9eb25bb3164f115", // Body/md/semibold
  "e326c8f3ea6fc4de06432b5548d3cc72f92322ba", // Body/md/mono
  "f9bf14e5dad5ea4e5bfdf5f4323af06c1b4555fb", // Body/lg/regular
  "7ef76498b2947324092af142f54f3945b5e2699d", // Body/lg/medium
  "3d43e975db1405f5e4b5e33e898fbdbbb86c5874", // Body/lg/semibold
  "aa151999545190e33c42961ee05cbc9b83b7927e", // Heading/xs
  "0fac39a15a016021c64dacf62779a6c9944db58c", // Heading/sm
  "360fc7563852731254e647c25844fd943844f35a", // Heading/md
];

const DEFAULT_OPTS = {
  includeLocal: true, // 로컬 텍스트 스타일도 후보로
  includeUsedLibrary: false, // 이 범위에서 쓰는 다른 라이브러리 스타일도 후보로
  restyleForeign: false, // 후보에 없는 스타일이 붙은 글자도 바꾸기
  skipHidden: true,
  skipLibraryInstances: true, // 라이브러리 컴포넌트 인스턴스 안 글자는 건너뛴다(이미 DS 스타일)
  skipPrefixes: ["DHS"], // 이름이 이걸로 시작하는 레이어 안은 건너뛴다(주석 · 노트)
  sizeTolerance: 1,
  centerSingleLine: true, // 한 줄 고정 크기 글자는 줄 높이가 바뀌어도 자리가 흔들리지 않게 세로 가운데로
};

// ── 글꼴 정보 ─────────────────────────────────────────────────────────────────

/** 굵기 이름 → 숫자. 'Semi Bold' · 'SemiBold' · 'Demi Bold' 처럼 띄어쓰기 · 대소문자가 달라도 같게 본다. */
function weightOf(style) {
  const s = String(style).replace(/\s+/g, "").toLowerCase().replace("italic", "") || "regular";
  // 긴 이름부터 — 'extrabold' 가 'bold' 로, 'semibold' 가 'bold' 로 읽히지 않게.
  const table = [
    ["extralight", 200], ["ultralight", 200], ["extrabold", 800], ["ultrabold", 800],
    ["semibold", 600], ["demibold", 600], ["hairline", 100], ["regular", 400], ["normal", 400],
    ["medium", 500], ["light", 300], ["black", 900], ["heavy", 900], ["thin", 100],
    ["book", 400], ["roman", 400], ["bold", 700],
  ];
  for (const [k, w] of table) if (s.includes(k)) return w;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n >= 100 && n <= 900 ? n : 400;
}
const isMono = (family) => /mono|code|courier|consolas|menlo/i.test(family);
const round = (n, step = 0.5) => Math.round(n / step) * step;

/** 줄 높이를 px 로 — AUTO 는 null(비교에서 뺀다). */
function lineHeightPx(lh, fontSize) {
  if (!lh || lh === figma.mixed) return null;
  if (lh.unit === "PIXELS") return lh.value;
  if (lh.unit === "PERCENT") return (lh.value / 100) * fontSize;
  return null;
}

const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
// Figma 오류 문구는 여러 줄(비슷한 글꼴 목록 등)이라 첫 줄만 쓴다.
const firstLine = (e) => String(e && e.message ? e.message : e).split("\n")[0];
const pageOf = (n) => { let p = n; while (p && p.type !== "PAGE") p = p.parent; return p; };

// ── 후보 스타일 ───────────────────────────────────────────────────────────────

function describeStyle(s, source) {
  const lh = lineHeightPx(s.lineHeight, s.fontSize);
  return {
    id: s.id,
    name: s.name,
    source, // "DS" | "로컬" | "라이브러리"
    family: s.fontName.family,
    fontStyle: s.fontName.style,
    size: s.fontSize,
    weight: weightOf(s.fontName.style),
    lineHeight: lh == null ? null : round(lh),
    mono: isMono(s.fontName.family),
  };
}

async function collectCatalog(textNodes, opts, problems) {
  const byId = new Map();
  for (const key of PRESET_STYLE_KEYS) {
    try {
      const s = await figma.importStyleByKeyAsync(key);
      if (s.type === "TEXT") byId.set(s.id, describeStyle(s, "DS"));
    } catch (e) {
      bump(problems, "DS 기본 스타일을 가져오지 못함(라이브러리 접근 권한 확인)");
    }
  }
  if (opts.includeLocal) {
    for (const s of await figma.getLocalTextStylesAsync()) if (!byId.has(s.id)) byId.set(s.id, describeStyle(s, "로컬"));
  }
  if (opts.includeUsedLibrary) {
    const used = new Set();
    for (const t of textNodes) {
      if (typeof t.textStyleId === "string") { if (t.textStyleId) used.add(t.textStyleId); continue; }
      for (const seg of t.getStyledTextSegments(["textStyleId"])) if (seg.textStyleId) used.add(seg.textStyleId);
    }
    for (const id of used) {
      if (byId.has(id)) continue;
      const s = await figma.getStyleByIdAsync(id);
      if (s && s.type === "TEXT" && s.remote) byId.set(s.id, describeStyle(s, "라이브러리"));
    }
  }
  return [...byId.values()].sort((a, b) => a.size - b.size || a.weight - b.weight || a.name.localeCompare(b.name));
}

// ── 찾기 ──────────────────────────────────────────────────────────────────────

const remoteInstanceCache = new Map();

/** 건너뛸 이유 — 없으면 null. */
async function skipReason(node, opts) {
  const prefixOf = (n) => opts.skipPrefixes.find((pre) => pre && n.name.startsWith(pre));
  if (opts.skipHidden && !node.visible) return "숨긴 레이어";
  if (prefixOf(node)) return `이름이 '${prefixOf(node)}'로 시작`;
  for (let p = node.parent; p && p.type !== "PAGE"; p = p.parent) {
    if (opts.skipHidden && "visible" in p && !p.visible) return "숨긴 레이어";
    const pre = prefixOf(p);
    if (pre) return `이름이 '${pre}'로 시작`;
    if (opts.skipLibraryInstances && p.type === "INSTANCE") {
      if (!remoteInstanceCache.has(p.id)) {
        const main = await p.getMainComponentAsync();
        remoteInstanceCache.set(p.id, !main || main.remote);
      }
      if (remoteInstanceCache.get(p.id)) return "라이브러리 컴포넌트 안";
    }
  }
  return null;
}

async function textsInScope(scope) {
  if (scope === "selection") {
    const seen = new Set();
    const out = [];
    const add = (t) => { if (!seen.has(t.id)) { seen.add(t.id); out.push(t); } };
    for (const n of figma.currentPage.selection) {
      if (n.type === "TEXT") add(n);
      if ("findAllWithCriteria" in n) n.findAllWithCriteria({ types: ["TEXT"] }).forEach(add);
    }
    return out;
  }
  if (scope === "file") {
    await figma.loadAllPagesAsync();
    const out = [];
    for (const page of figma.root.children) out.push(...page.findAllWithCriteria({ types: ["TEXT"] }));
    return out;
  }
  return figma.currentPage.findAllWithCriteria({ types: ["TEXT"] });
}

// ── 짝짓기 ────────────────────────────────────────────────────────────────────

function match(sig, catalog, opts) {
  let best = null;
  for (const s of catalog) {
    if (s.mono !== sig.mono) continue;
    const dSize = Math.abs(s.size - sig.size);
    const dWeight = Math.abs(s.weight - sig.weight);
    const dLine = s.lineHeight != null && sig.lineHeight != null ? Math.abs(s.lineHeight - sig.lineHeight) : 0;
    const score = dSize * 10 + (dWeight / 100) * 3 + dLine * 0.2;
    if (!best || score < best.score) best = { style: s, score, dSize, dWeight };
  }
  if (!best) return { styleId: null, confidence: "none" };
  const confidence = best.dSize === 0 && best.dWeight === 0 ? "exact"
    : best.dSize <= opts.sizeTolerance && best.dWeight <= 100 ? "near" : "far";
  return { styleId: best.style.id, confidence };
}

// ── 상태 ──────────────────────────────────────────────────────────────────────

/** 묶음 id → [{ nodeId, start, end, length }] — 적용 · 보기 때 쓴다. */
let groupTargets = new Map();

async function scan(scope, rawOpts) {
  const opts = Object.assign({}, DEFAULT_OPTS, rawOpts);
  const problems = {};
  remoteInstanceCache.clear();
  const nodes = await textsInScope(scope);
  const catalog = await collectCatalog(nodes, opts, problems);
  const catalogIds = new Set(catalog.map((s) => s.id));
  const groups = new Map();
  const skipped = {};
  let styled = 0;

  for (const t of nodes) {
    const why = await skipReason(t, opts);
    if (why) { bump(skipped, why); continue; }
    if (t.characters.length === 0) continue;
    for (const seg of t.getStyledTextSegments(["fontName", "fontSize", "lineHeight", "textStyleId"])) {
      if (seg.textStyleId && (!opts.restyleForeign || catalogIds.has(seg.textStyleId))) { styled++; continue; }
      const lh = lineHeightPx(seg.lineHeight, seg.fontSize);
      const sig = {
        family: seg.fontName.family,
        fontStyle: seg.fontName.style,
        size: round(seg.fontSize),
        weight: weightOf(seg.fontName.style),
        lineHeight: lh == null ? null : round(lh),
        mono: isMono(seg.fontName.family),
        foreign: !!seg.textStyleId,
      };
      const key = [sig.family, sig.fontStyle, sig.size, sig.lineHeight == null ? "auto" : sig.lineHeight, sig.foreign ? "f" : ""].join("|");
      if (!groups.has(key)) groups.set(key, { id: key, sig, count: 0, layers: new Set(), sample: "", targets: [] });
      const g = groups.get(key);
      g.count++;
      g.layers.add(t.id);
      if (!g.sample) g.sample = t.characters.slice(seg.start, seg.end).replace(/\s+/g, " ").trim().slice(0, 40);
      g.targets.push({ nodeId: t.id, start: seg.start, end: seg.end, length: t.characters.length });
    }
  }

  groupTargets = new Map();
  const list = [...groups.values()].map((g) => {
    groupTargets.set(g.id, g.targets);
    const m = match(g.sig, catalog, opts);
    return { id: g.id, sig: g.sig, count: g.count, layers: g.layers.size, sample: g.sample, suggestion: m.styleId, confidence: m.confidence };
  }).sort((a, b) => b.count - a.count);

  console.log("[텍스트 스타일 맞추기] scan", { scope, texts: nodes.length, groups: list.length, skipped, problems });
  return { scope, texts: nodes.length, styled, unstyled: list.reduce((n, g) => n + g.count, 0), skipped, problems, catalog, groups: list };
}

async function apply(plan, rawOpts) {
  const opts = Object.assign({}, DEFAULT_OPTS, rawOpts);
  const loaded = new Set();
  const loadFont = async (f) => {
    const k = `${f.family}|${f.style}`;
    if (loaded.has(k)) return;
    await figma.loadFontAsync(f);
    loaded.add(k);
  };
  let done = 0;
  const failed = {};

  for (const { groupId, styleId } of plan) {
    const targets = groupTargets.get(groupId) || [];
    const style = await figma.getStyleByIdAsync(styleId);
    if (!style || style.type !== "TEXT") { bump(failed, "스타일을 찾지 못함"); continue; }
    try { await loadFont(style.fontName); } catch (e) {
      bump(failed, `스타일 글꼴 ${style.fontName.family} ${style.fontName.style}을(를) 불러오지 못함`);
      continue;
    }
    for (const tg of targets) {
      const t = await figma.getNodeByIdAsync(tg.nodeId);
      if (!t || t.type !== "TEXT") { bump(failed, "레이어가 없어짐"); continue; }
      if (t.characters.length !== tg.length) { bump(failed, "찾은 뒤 글자가 바뀜 — 다시 찾기"); continue; }
      try {
        // 지금 글꼴도 불러와야 바꿀 수 있다. 데스크톱에 없는 글꼴(missing font)이면 불러오기는 실패해도 바꿀 수 있다.
        for (const seg of t.getStyledTextSegments(["fontName"])) {
          if (seg.end <= tg.start || seg.start >= tg.end) continue;
          try { await loadFont(seg.fontName); } catch (e) { if (!t.hasMissingFont) throw e; }
        }
        const whole = tg.start === 0 && tg.end === t.characters.length;
        if (whole) await t.setTextStyleIdAsync(style.id);
        else await t.setRangeTextStyleIdAsync(tg.start, tg.end, style.id);
        if (opts.centerSingleLine && whole && !t.characters.includes("\n") && t.textAutoResize === "NONE") t.textAlignVertical = "CENTER";
        done++;
      } catch (e) {
        bump(failed, firstLine(e));
      }
    }
  }
  console.log("[텍스트 스타일 맞추기] apply", { done, failed });
  return { done, failed };
}

async function selectGroup(groupId) {
  const ids = [...new Set((groupTargets.get(groupId) || []).map((t) => t.nodeId))];
  const nodes = [];
  for (const id of ids) { const n = await figma.getNodeByIdAsync(id); if (n) nodes.push(n); }
  if (nodes.length === 0) return 0;
  // 지금 페이지에 있는 것만 고를 수 있다 — 없으면 첫 레이어가 있는 페이지로 옮겨 간다.
  let page = figma.currentPage;
  if (!nodes.some((n) => pageOf(n) === page)) { page = pageOf(nodes[0]); await figma.setCurrentPageAsync(page); }
  const pick = nodes.filter((n) => pageOf(n) === page);
  figma.currentPage.selection = pick;
  figma.viewport.scrollAndZoomIntoView(pick);
  return pick.length;
}

// ── UI 연결 ───────────────────────────────────────────────────────────────────

figma.showUI(__html__, { width: 480, height: 680, themeColors: true });

const postSelection = () => figma.ui.postMessage({ type: "selection", count: figma.currentPage.selection.length });

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === "scan") {
      figma.ui.postMessage({ type: "busy", text: "글자를 찾는 중…" });
      const result = await scan(msg.scope, msg.opts);
      figma.ui.postMessage({ type: "scan-result", result });
    } else if (msg.type === "apply") {
      figma.ui.postMessage({ type: "busy", text: "스타일을 붙이는 중…" });
      const r = await apply(msg.plan, msg.opts);
      const failedTotal = Object.values(r.failed).reduce((a, b) => a + b, 0);
      figma.notify(`${r.done}곳에 스타일을 붙였습니다${failedTotal ? ` · 실패 ${failedTotal}곳` : ""} — 되돌리려면 Cmd+Z`);
      figma.ui.postMessage({ type: "apply-result", result: r });
    } else if (msg.type === "select") {
      const n = await selectGroup(msg.groupId);
      figma.notify(n ? `레이어 ${n}개를 선택했습니다` : "레이어를 찾지 못했습니다 — 다시 찾기");
    }
  } catch (e) {
    figma.ui.postMessage({ type: "error", text: firstLine(e) });
  }
};

figma.on("selectionchange", postSelection);
figma.on("currentpagechange", postSelection);
postSelection();
