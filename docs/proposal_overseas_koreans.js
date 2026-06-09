const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, Header, Footer, LevelFormat,
  ExternalHyperlink, PageBreak
} = require('docx');
const fs = require('fs');

// ── 공통 스타일 ──────────────────────────────────────────────────
const GOLD   = "C9A227";
const DARK   = "1B2631";
const GRAY   = "F2F3F4";
const MINT   = "1E8449";
const WHITE  = "FFFFFF";
const BLACK  = "000000";

const border = (color = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 1, color });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });
const borders = (c="CCCCCC") => ({ top: border(c), bottom: border(c), left: border(c), right: border(c) });
const noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() });

function cell(text, opts = {}) {
  const {
    bold=false, color=BLACK, bg=WHITE, size=20, align=AlignmentType.LEFT,
    colspan=1, width=4680, shade=WHITE
  } = opts;
  return new TableCell({
    columnSpan: colspan,
    width: { size: width, type: WidthType.DXA },
    borders: borders(opts.borderColor || "CCCCCC"),
    shading: { fill: shade || bg, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 160, right: 160 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, bold, color, size, font: "Malgun Gothic" })]
    })]
  });
}

function para(text, opts = {}) {
  const { bold=false, size=22, color=BLACK, align=AlignmentType.LEFT,
          spaceBefore=0, spaceAfter=0 } = opts;
  return new Paragraph({
    alignment: align,
    spacing: { before: spaceBefore, after: spaceAfter },
    children: [new TextRun({ text, bold, size, color, font: "Malgun Gothic" })]
  });
}

function heading1(text) {
  return new Paragraph({
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 32, color: DARK, font: "Malgun Gothic" })]
  });
}

function heading2(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text: "▶ " + text, bold: true, size: 26, color: MINT, font: "Malgun Gothic" })]
  });
}

function bullet(text, indent=360) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: indent, hanging: 200 },
    children: [
      new TextRun({ text: "• ", bold: true, color: GOLD, font: "Malgun Gothic", size: 20 }),
      new TextRun({ text, size: 20, color: BLACK, font: "Malgun Gothic" })
    ]
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 240, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" } },
    children: [new TextRun("")]
  });
}

// ── 문서 본문 ────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Malgun Gothic", size: 22, color: BLACK } }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
          children: [
            new TextRun({ text: "HebronGuide × 재외동포청  파트너십 제안서", size: 18, color: "888888", font: "Malgun Gothic" })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "- ", size: 18, color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" }),
            new TextRun({ text: " -  |  hebronguide.com  |  hebronplatform@gmail.com", size: 18, color: "888888" })
          ]
        })]
      })
    },
    children: [

      // ══ 표지 ══════════════════════════════════════════════════
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 200 },
        children: [new TextRun({ text: "협력 제안서", size: 36, bold: true, color: "888888", font: "Malgun Gothic" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 400 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
        children: [new TextRun({ text: "글로벌 한인 디아스포라 디지털 환대 플랫폼", size: 44, bold: true, color: DARK, font: "Malgun Gothic" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 160 },
        children: [new TextRun({ text: "HebronGuide × 재외동포청", size: 48, bold: true, color: GOLD, font: "Malgun Gothic" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 800 },
        children: [new TextRun({ text: "재외동포 정착 지원 공식 협력 플랫폼 구축 제안", size: 26, color: "555555", font: "Malgun Gothic" })]
      }),

      // 표지 정보 테이블
      new Table({
        width: { size: 6000, type: WidthType.DXA },
        columnWidths: [2000, 4000],
        rows: [
          new TableRow({ children: [
            cell("제안 기관", { bold: true, bg: DARK, color: WHITE, shade: DARK, size: 20, width: 2000 }),
            cell("Hebron Platform LLC / HebronGuide", { size: 20, width: 4000 })
          ]}),
          new TableRow({ children: [
            cell("제안 일자", { bold: true, bg: DARK, color: WHITE, shade: DARK, size: 20, width: 2000 }),
            cell("2026년 6월", { size: 20, width: 4000 })
          ]}),
          new TableRow({ children: [
            cell("담당자", { bold: true, bg: DARK, color: WHITE, shade: DARK, size: 20, width: 2000 }),
            cell("김성수 목사 | hebronplatform@gmail.com", { size: 20, width: 4000 })
          ]}),
          new TableRow({ children: [
            cell("웹사이트", { bold: true, bg: DARK, color: WHITE, shade: DARK, size: 20, width: 2000 }),
            cell("hebronguide.com", { size: 20, width: 4000 })
          ]}),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ══ 1. 제안 배경 및 목적 ══════════════════════════════════
      heading1("1. 제안 배경 및 목적"),

      heading2("재외동포의 현실"),
      para("전 세계 193개국에 거주하는 재외동포는 약 730만 명(2023, 재외동포청)에 달합니다. 이들 중 많은 수가 낯선 도시에서 언어·문화·법률·의료 시스템의 장벽을 홀로 극복해야 하는 상황에 놓여 있습니다.", { size: 22 }),
      new Paragraph({ spacing: { before: 100, after: 100 }, children: [] }),
      bullet("정착 초기 6개월, 가장 많은 어려움을 겪는 시기"),
      bullet("언어 장벽으로 인한 정보 접근성 한계"),
      bullet("한인 커뮤니티·교회 연결 경로 부재"),
      bullet("기존 재외동포 지원 서비스의 디지털 접근성 낮음"),

      divider(),

      heading2("HebronGuide의 탄생 배경"),
      para("HebronGuide는 25년간 재외 한인 목회를 해온 김성수 목사(시애틀지구촌교회)가 설계하고, Hebron Platform LLC가 운영하는 글로벌 한인 정착 가이드 플랫폼입니다.", { size: 22 }),
      new Paragraph({ spacing: { before: 100, after: 100 }, children: [] }),
      para("창세기 13:17-18의 '헤브론의 제단'에서 영감을 받아,", { size: 22 }),
      para("\"낯선 도시, 이미 누군가 기다렸습니다\"를 슬로건으로,", { bold: true, size: 22, color: GOLD }),
      para("전 세계 한인이 어느 도시에 도착하든 즉시 정착 정보와 커뮤니티를 연결받을 수 있도록 설계되었습니다.", { size: 22 }),

      new Paragraph({ children: [new PageBreak()] }),

      // ══ 2. HebronGuide 플랫폼 현황 ════════════════════════════
      heading1("2. HebronGuide 플랫폼 현황 (2026. 6 기준)"),

      // 현황 통계 테이블
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({ children: [
            cell("서비스 도시", { bold: true, shade: DARK, color: WHITE, size: 22, width: 2340, align: AlignmentType.CENTER }),
            cell("재외동포 커버리지", { bold: true, shade: DARK, color: WHITE, size: 22, width: 2340, align: AlignmentType.CENTER }),
            cell("파트너 교회", { bold: true, shade: DARK, color: WHITE, size: 22, width: 2340, align: AlignmentType.CENTER }),
            cell("지원 언어", { bold: true, shade: DARK, color: WHITE, size: 22, width: 2340, align: AlignmentType.CENTER }),
          ]}),
          new TableRow({ children: [
            cell("72개+ (2030: 500개)", { bold: true, size: 26, align: AlignmentType.CENTER, shade: GRAY, width: 2340 }),
            cell("700만+ 한인 디아스포라", { bold: true, size: 24, align: AlignmentType.CENTER, shade: GRAY, width: 2340 }),
            cell("등재·협력 교회 네트워크", { bold: true, size: 22, align: AlignmentType.CENTER, shade: GRAY, width: 2340 }),
            cell("한국어·영어", { bold: true, size: 24, align: AlignmentType.CENTER, shade: GRAY, width: 2340 }),
          ]}),
        ]
      }),

      new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

      heading2("주요 서비스 내용"),
      bullet("공항 출발 당일부터 사용 가능한 도시별 정착 가이드"),
      bullet("비자·건강보험·은행·학교·주거·세금 전반 안내"),
      bullet("도시별 한인 교회·사업체·채플린 네트워크 연결"),
      bullet("AI 기반 실시간 정착 Q&A (한국어·영어)"),
      bullet("교도소·이민국·병원·소방서·경찰서 채플린 파트너 네트워크"),
      bullet("Hebron Gig Services — 정착 도우미·통역·가이드 연결"),

      divider(),

      heading2("서비스 대상 도시 (주요)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1560, 1560, 1560, 1560, 1560, 1560],
        rows: [
          new TableRow({ children: [
            cell("북미", { bold: true, shade: DARK, color: WHITE, size: 20, width: 1560, align: AlignmentType.CENTER }),
            cell("시애틀·달라스·LA·뉴욕·SF·토론토·밴쿠버 외 40개+", { size: 18, colspan: 5, width: 7800 }),
          ]}),
          new TableRow({ children: [
            cell("유럽", { bold: true, shade: DARK, color: WHITE, size: 20, width: 1560, align: AlignmentType.CENTER }),
            cell("런던·베를린·파리", { size: 18, colspan: 5, width: 7800 }),
          ]}),
          new TableRow({ children: [
            cell("아시아", { bold: true, shade: DARK, color: WHITE, size: 20, width: 1560, align: AlignmentType.CENTER }),
            cell("도쿄·싱가포르·방콕·서울·부산", { size: 18, colspan: 5, width: 7800 }),
          ]}),
          new TableRow({ children: [
            cell("오세아니아", { bold: true, shade: DARK, color: WHITE, size: 20, width: 1560, align: AlignmentType.CENTER }),
            cell("시드니·멜버른·오클랜드", { size: 18, colspan: 5, width: 7800 }),
          ]}),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ══ 3. 재외동포청과의 미션 연계 ═══════════════════════════
      heading1("3. 재외동포청과의 미션 연계"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({ children: [
            cell("재외동포청 사명", { bold: true, shade: DARK, color: WHITE, size: 22, width: 4680, align: AlignmentType.CENTER }),
            cell("HebronGuide 역할", { bold: true, shade: DARK, color: WHITE, size: 22, width: 4680, align: AlignmentType.CENTER }),
          ]}),
          new TableRow({ children: [
            cell("재외동포의 권익 보호", { size: 20, shade: GRAY, width: 4680 }),
            cell("법률·비자·노동권 정보 즉시 제공", { size: 20, width: 4680 }),
          ]}),
          new TableRow({ children: [
            cell("대한민국과의 유대 강화", { size: 20, shade: GRAY, width: 4680 }),
            cell("한인 교회·커뮤니티 네트워크 연결", { size: 20, width: 4680 }),
          ]}),
          new TableRow({ children: [
            cell("해외 한인 사회 지원", { size: 20, shade: GRAY, width: 4680 }),
            cell("도시별 한인 사업체·서비스 디렉토리", { size: 20, width: 4680 }),
          ]}),
          new TableRow({ children: [
            cell("재외동포 네트워크 구축", { size: 20, shade: GRAY, width: 4680 }),
            cell("72개 도시 글로벌 환대 커뮤니티", { size: 20, width: 4680 }),
          ]}),
          new TableRow({ children: [
            cell("디지털 기반 서비스 확대", { size: 20, shade: GRAY, width: 4680 }),
            cell("AI 기반 실시간 정착 어드바이저", { size: 20, width: 4680 }),
          ]}),
        ]
      }),

      new Paragraph({ spacing: { before: 320, after: 160 }, children: [] }),

      para("HebronGuide는 재외동포청이 추구하는 '해외 한인 동포 지원'을 디지털 플랫폼으로 실현하는 민간 파트너입니다. 정부 인프라와 민간 플랫폼의 협력을 통해 더 많은 재외동포에게 빠르고 신뢰할 수 있는 정착 서비스를 제공할 수 있습니다.", { size: 22 }),

      new Paragraph({ children: [new PageBreak()] }),

      // ══ 4. 구체적 협력 방안 ════════════════════════════════════
      heading1("4. 구체적 협력 방안"),

      heading2("협력 방안 1 — 재외동포 공식 정착 가이드 플랫폼 지정"),
      bullet("재외동포청 공식 협력 플랫폼으로 HebronGuide 지정"),
      bullet("재외동포청 홈페이지 및 공식 채널에 HebronGuide 연결"),
      bullet("신규 이민자 출국 전 안내 자료에 HebronGuide QR코드 삽입"),
      bullet("영사관·한인회 통해 HebronGuide 안내 배포"),

      new Paragraph({ spacing: { before: 160, after: 80 }, children: [] }),

      heading2("협력 방안 2 — 도시 확장 공동 사업"),
      bullet("현재 72개 도시 → 2030년 500개 도시 확장 로드맵"),
      bullet("재외동포청 해외 거점 도시(영사관 소재 도시) 우선 확장"),
      bullet("각 도시 한인회·총영사관과 HebronGuide 파트너십 구축"),
      bullet("다국어 지원 확대 (스페인어·중국어·베트남어 등)"),

      new Paragraph({ spacing: { before: 160, after: 80 }, children: [] }),

      heading2("협력 방안 3 — AI 재외동포 정착 어드바이저 공동 개발"),
      bullet("재외동포청 정보 + HebronGuide AI = 공신력 있는 정착 안내"),
      bullet("비자·체류자격·권리 관련 Q&A 자동화"),
      bullet("한국어·영어·다국어 실시간 지원"),
      bullet("공동 개발 및 데이터 파트너십"),

      new Paragraph({ spacing: { before: 160, after: 80 }, children: [] }),

      heading2("협력 방안 4 — 채플린·사회복지 네트워크 연동"),
      bullet("교도소·이민국·병원·군·소방·경찰 채플린 파트너 네트워크"),
      bullet("위기 재외동포 지원 연결 시스템"),
      bullet("세계 한인 네트워크(세기총·KCMUSA 등)와 공동 활용"),

      new Paragraph({ children: [new PageBreak()] }),

      // ══ 5. 기대 효과 ══════════════════════════════════════════
      heading1("5. 기대 효과"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({ children: [
            cell("단기 (1년)", { bold: true, shade: DARK, color: WHITE, size: 22, width: 3120, align: AlignmentType.CENTER }),
            cell("중기 (3년)", { bold: true, shade: DARK, color: WHITE, size: 22, width: 3120, align: AlignmentType.CENTER }),
            cell("장기 (5년+)", { bold: true, shade: DARK, color: WHITE, size: 22, width: 3120, align: AlignmentType.CENTER }),
          ]}),
          new TableRow({ children: [
            cell("재외동포 정착 서비스 접근성 대폭 향상", { size: 19, shade: GRAY, width: 3120 }),
            cell("200개+ 도시 글로벌 네트워크", { size: 19, width: 3120 }),
            cell("500개 도시 재외동포 완전 커버리지", { size: 19, shade: GRAY, width: 3120 }),
          ]}),
          new TableRow({ children: [
            cell("한인 커뮤니티 연결률 30% 향상", { size: 19, shade: GRAY, width: 3120 }),
            cell("AI 정착 어드바이저 전국 서비스화", { size: 19, width: 3120 }),
            cell("재외동포 귀환·재정착 지원 플랫폼", { size: 19, shade: GRAY, width: 3120 }),
          ]}),
          new TableRow({ children: [
            cell("재외동포청 디지털 혁신 모범 사례", { size: 19, shade: GRAY, width: 3120 }),
            cell("다국어 지원 10개 언어 완성", { size: 19, width: 3120 }),
            cell("계 7:9 — 모든 민족 환대 생태계", { size: 19, shade: GRAY, width: 3120 }),
          ]}),
        ]
      }),

      new Paragraph({ spacing: { before: 320, after: 0 }, children: [] }),

      // ══ 6. 예산 및 지원 요청 ══════════════════════════════════
      heading1("6. 예산 및 지원 요청"),

      heading2("협력 형태 제안 (3가지 옵션)"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2500, 3860, 3000],
        rows: [
          new TableRow({ children: [
            cell("구분", { bold: true, shade: DARK, color: WHITE, size: 22, width: 2500, align: AlignmentType.CENTER }),
            cell("내용", { bold: true, shade: DARK, color: WHITE, size: 22, width: 3860, align: AlignmentType.CENTER }),
            cell("규모", { bold: true, shade: DARK, color: WHITE, size: 22, width: 3000, align: AlignmentType.CENTER }),
          ]}),
          new TableRow({ children: [
            cell("Option A — 공식 협력 MOU", { bold: true, size: 20, shade: GRAY, width: 2500 }),
            cell("재외동포청 공식 협력 플랫폼 지정 + 홍보 협력", { size: 19, width: 3860 }),
            cell("비용 없음 (상호 홍보)", { size: 19, width: 3000, align: AlignmentType.CENTER }),
          ]}),
          new TableRow({ children: [
            cell("Option B — 공동 사업 계약", { bold: true, size: 20, shade: GRAY, width: 2500 }),
            cell("도시 확장 공동 사업 + AI 어드바이저 개발", { size: 19, width: 3860 }),
            cell("연간 ₩50,000,000~\n₩200,000,000", { size: 19, width: 3000, align: AlignmentType.CENTER }),
          ]}),
          new TableRow({ children: [
            cell("Option C — 그랜트 지원", { bold: true, size: 20, shade: GRAY, width: 2500 }),
            cell("재외동포 지원 사업 공모 통한 그랜트 수혜", { size: 19, width: 3860 }),
            cell("사업 규모에 따라 협의", { size: 19, width: 3000, align: AlignmentType.CENTER }),
          ]}),
        ]
      }),

      new Paragraph({ spacing: { before: 240, after: 80 }, children: [] }),
      para("※ Option A (MOU)부터 시작하여 성과에 따라 단계적으로 협력 심화를 제안드립니다.", { size: 20, color: "666666" }),

      new Paragraph({ children: [new PageBreak()] }),

      // ══ 7. 연락처 및 차기 단계 ════════════════════════════════
      heading1("7. 연락처 및 차기 단계"),

      heading2("제안 기관 정보"),
      new Table({
        width: { size: 7200, type: WidthType.DXA },
        columnWidths: [2400, 4800],
        rows: [
          new TableRow({ children: [
            cell("기관명", { bold: true, shade: DARK, color: WHITE, size: 20, width: 2400 }),
            cell("Hebron Platform LLC / HebronGuide", { size: 20, width: 4800 })
          ]}),
          new TableRow({ children: [
            cell("대표자", { bold: true, shade: DARK, color: WHITE, size: 20, width: 2400 }),
            cell("김성수 목사 (시애틀지구촌교회 담임)", { size: 20, width: 4800 })
          ]}),
          new TableRow({ children: [
            cell("웹사이트", { bold: true, shade: DARK, color: WHITE, size: 20, width: 2400 }),
            cell("hebronguide.com", { size: 20, width: 4800 })
          ]}),
          new TableRow({ children: [
            cell("이메일", { bold: true, shade: DARK, color: WHITE, size: 20, width: 2400 }),
            cell("hebronplatform@gmail.com", { size: 20, width: 4800 })
          ]}),
          new TableRow({ children: [
            cell("소재지", { bold: true, shade: DARK, color: WHITE, size: 20, width: 2400 }),
            cell("Seattle, WA, USA", { size: 20, width: 4800 })
          ]}),
        ]
      }),

      new Paragraph({ spacing: { before: 320, after: 160 }, children: [] }),

      heading2("차기 단계 제안"),
      bullet("1단계: 제안서 검토 및 담당 부서 배정 요청"),
      bullet("2단계: 화상 미팅 또는 방문 발표 (서울/재외동포청)"),
      bullet("3단계: MOU 초안 협의 및 체결"),
      bullet("4단계: Option A 시작 → 3개월 후 성과 검토"),
      bullet("5단계: 공동 사업 확대 협의"),

      divider(),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({ text: "\"낯선 도시, 이미 누군가 기다렸습니다.\"", size: 28, bold: true, color: GOLD, font: "Malgun Gothic", italics: true })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160 },
        children: [
          new TextRun({ text: "HebronGuide는 재외동포 730만 명이 어느 도시에 도착하든", size: 22, color: "555555", font: "Malgun Gothic" })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 400 },
        children: [
          new TextRun({ text: "이미 준비된 환대와 정보를 만날 수 있는 세상을 만들겠습니다.", size: 22, color: "555555", font: "Malgun Gothic" })
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "재외동포청과 함께 이 꿈을 실현하고자 합니다.", size: 24, bold: true, color: DARK, font: "Malgun Gothic" })
        ]
      }),

    ]
  }]
});

// ── 파일 저장 ────────────────────────────────────────────────────
Packer.toBuffer(doc).then(buffer => {
  const outPath = "C:\\Users\\ijigu\\OneDrive\\01_Coding\\00_HebronAPP_FE\\01_HebronGuide\\docs\\HebronGuide_재외동포청_파트너십제안서_2026.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("✅ 완료:", outPath);
}).catch(e => console.error("오류:", e));
