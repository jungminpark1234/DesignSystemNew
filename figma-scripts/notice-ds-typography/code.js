// 공지 게시판(PRD-374) Figma 파일의 글자 레이어에 Design system 텍스트 스타일을 붙인다.
//
// html_to_figma 로 옮긴 화면은 글자가 Pretendard 지만 스타일이 연결돼 있지 않다. 원격 Figma MCP 는
// Pretendard 를 불러오지 못해 스타일을 붙일 수 없어서, Pretendard 가 있는 Figma 데스크톱에서 이 플러그인으로 붙인다.
//
// 메뉴 두 개:
//   1. 미리 보기 — 아무것도 바꾸지 않는다. 스타일 가져오기 · 글꼴 불러오기 · 짝짓기가 되는지 세어서 알려 준다.
//   2. 적용     — 실제로 붙인다. 한 레이어가 실패해도 멈추지 않고 끝까지 간 뒤 실패 수와 이유를 알려 준다.
//      되돌리려면 Cmd+Z.
//
// 범위: 선택한 레이어가 있으면 그 안만, 없으면 지금 열린 페이지 전체(2026-11-06). 화면 프레임만 골라 돌리면
//   AC 대조표 · 노트 같은 설명 글자는 건드리지 않는다.
// 글꼴 · 굵기 · 크기로 DS 스타일을 고른다. 원격 Figma MCP 가 Pretendard 대신 넣은 글자(Noto Sans KR · Roboto · Inter)도
//   같은 규칙으로 바꾼다 — 'Bold' 는 'Pretendard SemiBold 로 교체' 관례에 따라 semibold 로 읽는다.
// 인스턴스 안 글자: 이 파일에서 만든 로컬 컴포넌트의 인스턴스(지표/카드 등)는 처리한다. DS 라이브러리 인스턴스
//   (상태 배지 · 메타 정보 표 — 이미 DS 스타일)와 DHS 인스턴스(노트 · 메모 · 머리띠 — 주석용)는 건드리지 않는다.
// 한 줄짜리 글자는 줄 높이가 바뀌어도 자리가 흔들리지 않게 세로 가운데 정렬로 둔다.

const STYLE_KEYS = {
  "Body/sm/regular": "32afeaa90de4427bf48409284bc4c6834de0ab91",
  "Body/sm/medium": "280f8206636feaf20a9a1f8d8d6b9a2965004afe",
  "Body/sm/semibold": "cca8d022c1559fb06accd400d15526190c484f71",
  "Body/md/regular": "f62af8518b1b01969c314383ecbb1a1040d5be73",
  "Body/md/medium": "27f1e7b1baabeedbd3acbeae9ec42134b814d74c",
  "Body/md/semibold": "49236859e85cbc9410178587a9eb25bb3164f115",
  "Body/md/mono": "e326c8f3ea6fc4de06432b5548d3cc72f92322ba",
  "Body/lg/regular": "f9bf14e5dad5ea4e5bfdf5f4323af06c1b4555fb",
  "Body/lg/medium": "7ef76498b2947324092af142f54f3945b5e2699d",
  "Body/lg/semibold": "3d43e975db1405f5e4b5e33e898fbdbbb86c5874",
  "Heading/xs": "aa151999545190e33c42961ee05cbc9b83b7927e",
  "Heading/sm": "0fac39a15a016021c64dacf62779a6c9944db58c",
  "Heading/md": "360fc7563852731254e647c25844fd943844f35a",
};

// "크기|굵기" → DS 스타일. DS 의 Body 는 lg 14 · md 12 · sm 10 이다(코드의 Text md 14 · sm 12 · xs 10 과 같은 값).
const MAP = {
  "10|regular": "Body/sm/regular", "10|medium": "Body/sm/medium", "10|semibold": "Body/sm/semibold",
  "12|regular": "Body/md/regular", "12|medium": "Body/md/medium", "12|semibold": "Body/md/semibold",
  "14|regular": "Body/lg/regular", "14|medium": "Body/lg/medium", "14|semibold": "Body/lg/semibold",
  // 데모의 프로필 메뉴 이름이 15px 이다 — DS 에 없는 크기라 가장 가까운 14 로 맞춘다.
  "15|semibold": "Body/lg/semibold",
  "16|semibold": "Heading/xs",
  "20|semibold": "Heading/sm",
  "24|semibold": "Heading/md",
  "mono|12": "Body/md/mono",
};

// 굵기 이름을 DS 쪽으로 — 'Semi Bold' · 'SemiBold' · 'Demi Bold' 는 semibold, 'Bold' 도 semibold 로 본다
// (원격 MCP 가 Pretendard SemiBold 자리에 Noto Sans KR Bold 를 넣는다). 'Book' 은 regular.
const WEIGHT_ALIAS = { bold: "semibold", demibold: "semibold", book: "regular", normal: "regular" };
const norm = (style) => {
  const k = style.replace(/\s+/g, "").toLowerCase();
  return WEIGHT_ALIAS[k] || k;
};
const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
// Figma 오류 문구는 여러 줄(비슷한 글꼴 목록 등)이라 첫 줄만 쓴다 — 알림이 읽히게.
const firstLine = (e) => String(e && e.message ? e.message : e).split("\n")[0];

// 건너뛸 글자인가 — DHS 주석(이름이 'DHS' 로 시작하는 조상)과 DS 라이브러리 인스턴스 안.
// 로컬 컴포넌트 인스턴스 안 글자는 처리한다(지표 카드처럼 화면 대부분이 인스턴스다).
const remoteInstance = new Map(); // 인스턴스 id → 라이브러리(원격) 인스턴스인가 — 글자마다 다시 묻지 않게
async function skipReason(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (/^DHS/.test(p.name)) return "DHS 주석";
    if (p.type === "INSTANCE") {
      if (!remoteInstance.has(p.id)) {
        const main = await p.getMainComponentAsync();
        remoteInstance.set(p.id, !main || main.remote);
      }
      if (remoteInstance.get(p.id)) return "라이브러리 인스턴스";
    }
  }
  return null;
}

// 선택이 있으면 그 안의 글자만, 없으면 페이지 전체.
function targetTexts() {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) return { scope: "페이지 전체", texts: figma.currentPage.findAllWithCriteria({ types: ["TEXT"] }) };
  const out = [];
  for (const n of sel) {
    if (n.type === "TEXT") out.push(n);
    if ("findAllWithCriteria" in n) out.push(...n.findAllWithCriteria({ types: ["TEXT"] }));
  }
  return { scope: `선택 ${sel.length}개`, texts: out };
}

function lineHeightPx(t) {
  const lh = t.lineHeight;
  if (lh === figma.mixed) return t.fontSize * 1.2;
  if (lh.unit === "PIXELS") return lh.value;
  if (lh.unit === "PERCENT") return (lh.value / 100) * t.fontSize;
  return t.fontSize * 1.2;
}

function targetStyle(t) {
  if (t.fontName === figma.mixed || t.fontSize === figma.mixed) return null;
  const key = t.fontName.family === "Source Code Pro" ? `mono|${t.fontSize}` : `${t.fontSize}|${norm(t.fontName.style)}`;
  return MAP[key] || null;
}

async function loadStyles(problems) {
  const styles = {};
  for (const [name, key] of Object.entries(STYLE_KEYS)) {
    try {
      styles[name] = await figma.importStyleByKeyAsync(key);
      await figma.loadFontAsync(styles[name].fontName);
    } catch (e) {
      bump(problems, `스타일 ${name}: ${firstLine(e)}`);
    }
  }
  return styles;
}

async function run(apply) {
  const problems = {};
  const styles = await loadStyles(problems);
  const { scope, texts: all } = targetTexts();
  const skipped = {};
  const texts = [];
  for (const t of all) {
    const why = await skipReason(t);
    if (why) bump(skipped, why); else texts.push(t);
  }
  const planned = {};
  const unmatched = {};
  const failed = {};
  const loadedFonts = new Set();
  let done = 0;

  for (const t of texts) {
    const name = targetStyle(t);
    if (!name) {
      const k = t.fontName === figma.mixed ? "섞인 글꼴" : `${t.fontName.family} ${t.fontName.style} ${t.fontSize}`;
      bump(unmatched, k);
      continue;
    }
    if (!styles[name]) { bump(failed, `${name} 스타일을 못 가져옴`); continue; }
    bump(planned, name);

    // 지금 글꼴을 불러올 수 있는지 — 미리 보기에서도 확인한다. 데스크톱에 없는 글꼴이면 여기서 걸린다.
    const fontKey = `${t.fontName.family} ${t.fontName.style}`;
    if (!loadedFonts.has(fontKey)) {
      try { await figma.loadFontAsync(t.fontName); loadedFonts.add(fontKey); }
      catch (e) { if (!t.hasMissingFont) { bump(failed, `글꼴 ${fontKey} 불러오기 실패`); continue; } }
    }
    if (!apply) continue;

    try {
      const singleLine = t.height <= lineHeightPx(t) * 1.5;
      await t.setTextStyleIdAsync(styles[name].id);
      if (singleLine && t.textAutoResize === "NONE") t.textAlignVertical = "CENTER";
      done++;
    } catch (e) {
      bump(failed, `${name}: ${firstLine(e)}`);
    }
  }

  const list = (o) => Object.entries(o).map(([k, n]) => `${k} ×${n}`).join(" · ");
  const plannedTotal = Object.values(planned).reduce((a, b) => a + b, 0);
  const failedTotal = Object.values(failed).reduce((a, b) => a + b, 0);
  const head = apply
    ? `[${scope}] 적용 ${done}개 / 대상 ${plannedTotal}개`
    : `[${scope}] 미리 보기 — 대상 ${plannedTotal}개 (바꾸지 않았습니다)`;
  const parts = [head];
  if (Object.keys(skipped).length) parts.push(`건너뜀: ${list(skipped)}`);
  if (failedTotal) parts.push(`실패 ${failedTotal}개: ${list(failed)}`);
  if (Object.keys(unmatched).length) parts.push(`짝 없음: ${list(unmatched)}`);
  if (Object.keys(problems).length) parts.push(`문제: ${list(problems)}`);
  if (!apply && !failedTotal && !Object.keys(problems).length) parts.push("글꼴 · 스타일 모두 준비됨 — '2. 적용'을 실행해도 됩니다");
  console.log("[DS 텍스트 스타일]", { scope, planned, failed, unmatched, skipped, problems, done });
  return parts.join("  |  ");
}

// 결과 문구는 플러그인을 닫으며 알림으로 띄운다.
run(figma.command === "apply")
  .then((summary) => figma.closePlugin(summary))
  .catch((e) => figma.closePlugin(`실패: ${firstLine(e)}`));
