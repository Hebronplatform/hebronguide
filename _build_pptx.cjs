/* HebronGuide 발표 PPTX 생성 — 17 슬라이드 + 발표자 노트 */
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";          // 13.3 x 7.5
p.author = "김성수 목사 (Paul Kim)";
p.title  = "HebronGuide — 환대가 세상을 바꿀 수 있는가";

const W = 13.333, H = 7.5;
const F = "Malgun Gothic";          // 한글 안전 폰트 (Windows)
const C = {
  bg:"0A0E17", bg2:"0C1322", card:"141B2B", cardLine:"2A3650",
  gold:"C9A227", gold2:"F0C040", mint:"6EE7B7", indigo:"818CF8",
  warm:"FF9F0A", red:"F87171", white:"F2F5FF", mut:"9AA6C0", mut2:"6A748C"
};

/* ── 발표자 노트 (사람 톤, plain text) ── */
const NOTES = [
"[00:00–00:30] 안녕하세요, 시애틀에서 인사드립니다. 김성수입니다. 오늘은 여러분과 딱 한 가지 질문만 붙들고 가보려고 해요. '환대가 세상을 바꿀 수 있을까?' 좀 거창하게 들리시죠. 그런데 저는 진짜 그렇게 믿습니다. 그 믿음 하나로 만든 게 오늘 보여드릴 HebronGuide예요.  (연출: 편하게 미소로 시작. 청중을 한 번 둘러본다.)",
"[00:30–01:30] 본론 들어가기 전에, 먼저 주상락 교수님께 감사드리고 싶습니다. 이런 자리를 만들어 주셔서요. 사실 작년 봄에 교수님 「새로운 교회 계발론」 수업을 들었는데, 그때 처음으로 '환대'라는 걸 제대로 붙들고 고민해 봤어요. 솔직히 그 수업이 아니었으면 오늘 이 이야기도 없었을 겁니다.  (연출: 진심을 담아 천천히. 교수님과 눈을 맞춘다.)",
"[01:30–03:30] 2001년 6월이었어요. 교회 하나 세워 보겠다고 시애틀에 왔는데, 가진 게 정말 아무것도 없었습니다. 그런데 이 도시가 어찌나 차갑던지, 문을 안 열어 줘요. 그러다 엉뚱한 데서 문이 열렸습니다. 타이완에서 온 아파트 매니저였는데, 불교 신자였어요. 빈 아파트 열쇠를 쥐어 주면서 그러더라고요. '여기 기도하는 데 쓰세요. 대신 다른 사람한테는 말하지 마시고.' 그날 저는 한 대 맞은 것 같았습니다. '저 사람이 예수 믿는 사람이었으면 얼마나 좋았을까.' 그 생각이 25년을 끌고 왔고, HebronGuide가 거기서 시작됐어요.  (연출: 감정의 출발점. 매니저 대사는 잠시 멈춘 뒤 인용.)",
"[03:30–04:30] 마태복음 25장 35절이죠. '내가 나그네 되었을 때에 너희가 영접하였다.' 그날, 그 나그네가 바로 저였어요. 환대라는 거, 그냥 친절한 게 아닙니다. 하나님이 어떤 분이신지를 보여 주는 거예요. 거기엔 네 가지 결이 있는데 — 알아봐 주고, 받아 주고, 채워 주고, 이어 주는 것. 이건 뒤에서 다시 말씀드릴게요.  (연출: 네 단어를 손가락으로 짚듯. 뒤에 다시 나온다고 예고.)",
"[04:30–06:00] 환대를 받아 본 분들 이야기를 들어 보면요. '처음 밥 한 끼 얻어먹고 울었다.' '낯선 동네에서 누가 내 이름을 불러 주더라.' 재밌는 건, 정작 본인들은 그걸 '환대'라고 부르지도 못해요. 그런 말을 몰라서요. 근데 그 순간만큼은 평생 기억합니다. 어떤 분은 '그 일 때문에 교회를 나가게 됐다'고 하시더라고요.  (연출: 왼쪽→오른쪽 순서로. 마지막 줄에 힘.)",
"[06:00–07:30] 그런데 지금 현실은요. 우리 자녀 세대, 열에 여섯이 교회를 떠납니다. 바나 리서치를 보면 교회 안 다니는 청년 87%가 '기독교인은 판단부터 한다'고 답해요. 위선적이다, 85%. 더 아픈 건, 교회 다니는 청년조차 절반이 '우리 교회도 그렇다'고 한다는 거예요. 세상이 우리한테 문을 닫은 게 아닙니다. 우리가 먼저 닫았어요.  (연출: 숫자는 빠르게, 마지막 문장은 무겁게 멈춰서.)",
"[07:30–08:45] 사실 우리가 몰라서 안 하는 게 아니잖아요. '나그네를 대접하라', 다 압니다. 설교도 하고요. 그런데 정작 처음 온 분한테는 아무도 말을 안 걸어요. 다음 주 되면 이름도 까먹고요. 아는 것과 사는 것 사이가 이렇게 멉니다. 왜 그럴까요. 배운 적이 없어서예요. 신학교에서 설교학, 상담학은 배우는데 — 환대는 아무도 안 가르칩니다.  (연출: GAP를 가리키며. '안 가르칩니다'에서 한 박자 쉰다.)",
"[08:45–10:15] 여기서 한 가지 짚고 가야 할 게 있어요. 선교는요, 교회가 벌이는 사업이 아닙니다. 하나님이 먼저 하시는 일이에요. 미시오 데이라고 하죠. 요한복음 1장 14절, 말씀이 사람이 되어 우리 가운데 사셨다 — 하나님이 먼저 이 낯선 땅으로 내려오신 거예요. 그게 환대의 원조입니다. 그러니까 이건 '우리 교회 키우자'는 운동이 아니에요. 우리 모두가 하나님 하시는 일에 함께 끼는, 그런 운동입니다.  (연출: 핵심 신학. 흐름도를 왼→오로. 천천히.)",
"[10:15–11:30] 성경이 말하는 환대, 헬라어로 필로세니아예요. '낯선 사람을 사랑한다'는 뜻입니다. 아브라함 기억나시죠. 나그네 셋을 보자마자 달려나가요. 앉아서 기다린 게 아니라 뛰어나갑니다. 바울도 그래요. 아굴라 부부 집, 루디아 집 — 선교가 다 누군가의 집에서 일어났어요. 환대가 곧 선교였던 거죠. 하나님이 이걸 명령까지 하시는데, 이유가 뭔지 아세요? '너희도 한때 나그네였잖아.'  (연출: '달려나가'를 강조. 본문 길게 끌지 않는다.)",
"[11:30–13:00] 그럼 환대를 어떻게 살아낼 수 있을까요. 가르치려면 좀 손에 잡혀야 하잖아요. 그래서 네 가지로 정리해 봤습니다. 첫째 알아봐 주기 — 이름 불러 주고 눈 맞추는 거요. 둘째 받아 주기 — 따지지 않고요. 셋째 채워 주기 — 진짜 필요한 걸요. 넷째 이어 주기 — 혼자 두지 않고 공동체로요. 만점이 뭐냐고요? 점수표가 아니라, 아브라함처럼 달려나가는 그 모습입니다.  (연출: '계량화 아니냐' 질문 대비. '교육을 위한 것'임을 톤에.)",
"[13:00–14:00] 요즘 우리는 '제4공간'이라는 데서 삽니다. 집이 1공간, 직장이 2공간, 카페 같은 데가 3공간이라면, 온라인과 오프라인이 겹치는 자리가 4공간이에요. 리프킨이 그랬죠. '연결은 됐는데 마음은 더 외로워졌다.' 이 외로운 시대에 가장 예수님다운 대답이 뭘까요. 저는 환대라고 봅니다.  (연출: 익숙한 개념. 빠르게 통과.)",
"[14:00–15:00] HebronGuide가 바로 그 4공간이에요. 저는 이걸 '플랫폼'이라고 안 부르고 '마당'이라고 부릅니다. 예전엔 이민 와서 혼자 검색하고, 교회가 어디 있는지도 몰랐어요. 이제는 공항 나오는 순간부터 믿을 만한 교회, 성도가 하는 가게를 만나는 거예요. 흩어져 사는 성도들의 평범한 하루가 선교 현장이 되는 거죠.  (연출: Before→After 대비. '마당'에 힘.)",
"[15:00–16:30] 말로 백 번 하는 것보다 한번 보시는 게 낫겠죠. 지금 채팅창에 링크 띄워 드릴게요. hebronguide.com입니다. 한번 들어가 보세요. 지금 71개 도시가 돌아가고 있어요. (시연) 도시 하나 누르면 검증된 교회, 성도 가게, 정착 정보가 쭉 나옵니다. 홈 화면에 추가하면 앱처럼 쓰시고요.  (연출: ★실제 화면 공유. 시애틀 한 도시만 깊게. 90초 안에.)",
"[16:30–17:30] 잠깐 그림 하나 그려 볼게요. 어느 도시에 내려도, 공항 문 나서는 순간부터 누가 반겨 주는 세상. 성도가 하는 작은 가게가 누군가한테는 첫 교회가 되는 세상. 그렇게 온 민족이 주님께 돌아오는 마당. 너무 이상적인가요? 그런데 이게 71개 도시에서 벌써 시작됐습니다.  (연출: 슬라이드로 복귀. 그림 그리듯 천천히.)",
"[17:30–18:15] 환대 한 번이 세 군데를 살립니다. 한 사람의 인생이 바뀌고요, 성도의 하루가 예배가 되고, 하나님 나라가 드러나요. 다시 한번 말씀드릴게요. 이건 우리 교회 하나 키우자는 게 아니에요. 우리 모두의 선교입니다.  (연출: 세 손가락. 마지막 문장이 한 줄 요약.)",
"[18:15–19:15] 그래서 부탁을 좀 드리겠습니다. 두 가지요. 하나는, 환대하며 사세요. 거창하게 말고, 이번 주에 낯선 사람 이름 하나 기억하는 것부터요. 또 하나는, 함께 손을 좀 보태 주세요. 목사님들, 교회를 여기 무료로 올려 주세요 (hebronguide.com/church-guide). 성도님 가게 하나라도 등록해 주시고요 (hebronguide.com/ad-request). 이게 돈 드는 일이 아니라 선교예요. 누가 새로 도착했을 때, 공항에서부터 여러분 교회를 만나게 되는 거니까요.  (연출: URL 두 개를 또박또박. 받아적을 시간을 준다.)",
"[19:15–20:00] 요한계시록 7장 9절에 보면, 모든 민족, 모든 언어의 사람들이 셀 수 없이 모여서 하나님께 영광을 돌립니다. 저는 환대가 세상을 바꾼다고 믿어요. 우리가 각자 자리에서 환대하며 살 때, 공동체가 살고, 민족이 돌아오고, 결국 하나님이 영광 받으세요. 같이 해 주시겠어요? 감사합니다. 오직 하나님께 영광입니다.  (연출: 속도를 늦추고 따뜻하게. 자연스럽게 Q&A로 연결.)"
];

/* ── 헬퍼 ── */
function base(slide, bg){ slide.background = { color: bg || C.bg }; }
function shadow(){ return { type:"outer", color:"000000", blur:9, offset:3, angle:90, opacity:0.35 }; }
function badge(slide, text, x, y){
  slide.addText(text, { x:x, y:y, w:6, h:0.34, fontFace:F, fontSize:11, bold:true,
    color:C.gold, charSpacing:3, align:"left", valign:"middle", margin:0 });
}
function title(slide, runs, x, y, w, size){
  slide.addText(runs, { x:x, y:y, w:w||11.5, h:1.3, fontFace:F, fontSize:size||34, bold:true,
    color:C.white, align:"left", valign:"top", lineSpacingMultiple:1.05, margin:0 });
}
function footer(slide, runs, y){
  slide.addText(runs, { x:0.9, y:y||6.55, w:11.5, h:0.7, fontFace:F, fontSize:14.5,
    color:C.mut, align:"left", valign:"top", lineSpacingMultiple:1.2, margin:0 });
}
function card(slide, x, y, w, h, fill){
  slide.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius:0.1,
    fill:{ color: fill||C.card }, line:{ color:C.cardLine, width:1 }, shadow:shadow() });
}

/* ===== SLIDE 1 — 타이틀 ===== */
(() => {
  const s = p.addSlide(); base(s, C.bg);
  s.addText("선교적 상상력 제4공간  ·  선교적 학습공동체 2026", { x:1, y:1.7, w:11.3, h:0.4,
    fontFace:F, fontSize:13, bold:true, color:C.gold, charSpacing:3, align:"center", margin:0 });
  s.addText([
    { text:"환대", options:{ color:C.gold2 } },
    { text:"가 세상을 바꿀 수 있는가", options:{ color:C.white } }
  ], { x:0.5, y:2.3, w:12.3, h:1.6, fontFace:F, fontSize:54, bold:true, align:"center", valign:"middle", margin:0 });
  s.addText("HebronGuide — 글로벌 환대 플랫폼\n디지털 시대, 흩어진 모든 그리스도인이 세상을 그리스도께 인도하는 길",
    { x:1, y:4.15, w:11.3, h:1, fontFace:F, fontSize:17, color:C.mut, align:"center", lineSpacingMultiple:1.35, margin:0 });
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x:4.4, y:5.4, w:4.5, h:0.62, rectRadius:0.31,
    fill:{ color:"15110A" }, line:{ color:C.gold, width:1 } });
  s.addText("김성수 목사  ·  Paul Kim  ·  시애틀  ·  2026", { x:4.4, y:5.4, w:4.5, h:0.62,
    fontFace:F, fontSize:14, bold:true, color:C.gold, align:"center", valign:"middle", margin:0 });
  s.addNotes(NOTES[0]);
})();

/* ===== SLIDE 2 — 감사 ===== */
(() => {
  const s = p.addSlide(); base(s, C.bg);
  s.addText("먼저 감사드립니다", { x:1, y:1.0, w:11.3, h:0.4, fontFace:F, fontSize:13, bold:true,
    color:C.gold, charSpacing:3, align:"center", margin:0 });
  card(s, 2.4, 1.7, 8.5, 1.5, "10201B");
  s.addText("주상락 교수님,\n이 자리를 허락해 주셔서 진심으로 감사드립니다.", { x:2.6, y:1.7, w:8.1, h:1.5,
    fontFace:F, fontSize:21, bold:true, color:C.mint, align:"center", valign:"middle", lineSpacingMultiple:1.3, margin:0 });
  s.addText([
    { text:"작년 봄학기 교수님의 ", options:{ color:C.mut } },
    { text:"「새로운 교회 계발론」", options:{ color:C.white, bold:true } },
    { text:"을 들으며\n저는 처음으로 '환대'가 얼마나 깊고 본질적인 것인지 진지하게 생각하게 되었습니다.\n\n그 수업이 없었다면 오늘 이 자리도, ", options:{ color:C.mut } },
    { text:"HebronGuide", options:{ color:C.gold, bold:true } },
    { text:"의 신학적 기초도\n이렇게 세워지지 못했을 것입니다.", options:{ color:C.mut } }
  ], { x:1.5, y:3.7, w:10.3, h:2.5, fontFace:F, fontSize:17, align:"center", lineSpacingMultiple:1.5, margin:0 });
  s.addNotes(NOTES[1]);
})();

/* ===== SLIDE 3 — 한 질문 + 매니저 ===== */
(() => {
  const s = p.addSlide(); base(s, C.bg2);
  badge(s, "PART 1 · 나의 이야기", 0.9, 0.75);
  title(s, [{text:"한 질문이 ",options:{color:C.white}},{text:"25년",options:{color:C.gold2}},{text:"을 만들었습니다",options:{color:C.white}}], 0.9, 1.2, 11.5, 34);
  card(s, 0.9, 2.5, 11.5, 1.55, C.card);
  s.addText("“여기 빈 아파트 키입니다. 기도처로 쓰세요.\n단, 다른 사람에게는 말하지 마세요.”", { x:1.2, y:2.6, w:10.9, h:1.0,
    fontFace:F, fontSize:19, italic:true, color:C.white, align:"left", valign:"middle", lineSpacingMultiple:1.25, margin:0 });
  s.addText("타이완 출신 불교인 아파트 매니저 — 시애틀, 2001", { x:1.2, y:3.62, w:10.9, h:0.35,
    fontFace:F, fontSize:12, color:C.mut2, align:"left", margin:0 });
  s.addText([
    { text:"2001년, 교회를 개척하러 왔지만 이 도시는 문을 열어주지 않았습니다.\n정작 문을 열어준 사람은 — ", options:{ color:C.mut } },
    { text:"그리스도인이 아니었습니다.", options:{ color:C.white, bold:true } },
    { text:"\n\n“그 매니저가 그리스도인이었다면 얼마나 좋았을까.”\n", options:{ color:C.mut } },
    { text:"그 질문에서 HebronGuide가 시작되었습니다.", options:{ color:C.gold, bold:true } }
  ], { x:0.9, y:4.4, w:11.5, h:2.1, fontFace:F, fontSize:16.5, align:"left", lineSpacingMultiple:1.45, margin:0 });
  s.addNotes(NOTES[2]);
})();

/* ===== SLIDE 4 — 마태복음 25:35 ===== */
(() => {
  const s = p.addSlide(); base(s, C.bg2);
  s.addText("“내가 나그네 되었을 때에 너희가 영접하였다.”", { x:1, y:1.5, w:11.3, h:0.9,
    fontFace:F, fontSize:28, italic:true, bold:true, color:C.mint, align:"center", margin:0 });
  s.addText("— 마태복음 25:35 (새번역)", { x:1, y:2.45, w:11.3, h:0.4, fontFace:F, fontSize:13, color:C.mut2, align:"center", margin:0 });
  s.addText("그날 그 나그네는 바로 저였습니다.\n그 손이 이제 우리의 손이 되어야 할 때입니다.", { x:1, y:3.0, w:11.3, h:0.9,
    fontFace:F, fontSize:17, color:C.mut, align:"center", lineSpacingMultiple:1.35, margin:0 });
  const kws = [["인식","認識",C.gold],["수용","受容",C.mint],["제공","提供",C.indigo],["연결","連結",C.gold]];
  const cw=2.5, gap=0.35, totw=cw*4+gap*3, sx=(W-totw)/2;
  kws.forEach((k,i)=>{
    const x=sx+i*(cw+gap);
    s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y:4.2, w:cw, h:0.95, rectRadius:0.1, fill:{color:C.card}, line:{color:k[2],width:1.5} });
    s.addText([{text:k[0]+"  ",options:{color:k[2],bold:true,fontSize:20}},{text:k[1],options:{color:C.mut2,fontSize:13}}],
      { x, y:4.2, w:cw, h:0.95, fontFace:F, align:"center", valign:"middle", margin:0 });
  });
  footer(s, [{text:"환대는 단순한 친절이 아닙니다. ",options:{color:C.mut}},{text:"하나님의 본성입니다.",options:{color:C.white,bold:true}}], 5.55);
  s.addNotes(NOTES[3]);
})();

/* ── 두 열 카드 헬퍼 ── */
function twoCol(s, leftTitle, leftItems, leftColor, rightTitle, rightItems, rightColor, topY){
  const y = topY||2.5, h=3.3, cw=5.6, gap=0.5, sx=(W-(cw*2+gap))/2;
  [[sx,leftTitle,leftItems,leftColor],[sx+cw+gap,rightTitle,rightItems,rightColor]].forEach(col=>{
    card(s, col[0], y, cw, h, C.card);
    s.addText(col[1], { x:col[0]+0.35, y:y+0.28, w:cw-0.7, h:0.45, fontFace:F, fontSize:15, bold:true, color:col[3], align:"left", margin:0 });
    s.addText(col[2].map((t,i)=>({ text:t, options:{ bullet:{indent:14}, color:C.mut, breakLine:true, paraSpaceAfter:6 } })),
      { x:col[0]+0.35, y:y+0.85, w:cw-0.7, h:h-1.1, fontFace:F, fontSize:13.5, align:"left", lineSpacingMultiple:1.1, valign:"top", margin:0 });
  });
}

/* ===== SLIDE 5 — 환대 경험자 ===== */
(() => {
  const s = p.addSlide(); base(s, C.bg);
  badge(s, "환대 경험의 목소리", 0.9, 0.75);
  title(s, [{text:"환대를 경험한 사람들은 이렇게 말합니다",options:{color:C.white}}], 0.9, 1.2, 11.5, 30);
  twoCol(s,
    "경험한 순간", ["처음 밥을 얻어먹고 울었다","낯선 도시에서 이름을 불러준 사람","아픈 날 온 문자 한 통","공항에 픽업 나온 처음 보는 성도","비 오는 날 우산을 내밀어 준 가게 주인"], C.gold,
    "그들의 공통 고백", ["“그 사람을 평생 잊을 수 없다”","“그때 다시 사람이 된 것 같았다”","“왜 친절하냐 물으니 교회 다닌다고”","“그날 이후 교회에 가게 되었다”","“그 기억이 내 인생의 전환점”"], C.mint, 2.4);
  footer(s, [{text:"그들은 그 경험을 '환대'라 부르지도 못했습니다. 언어가 없었을 뿐 — ",options:{color:C.mut}},{text:"그 순간을 평생 기억합니다.",options:{color:C.white,bold:true}}], 6.2);
  s.addNotes(NOTES[4]);
})();

/* ── 스탯 4개 헬퍼 ── */
function stats(s, arr, y){
  const cw=2.7, gap=0.4, totw=cw*4+gap*3, sx=(W-totw)/2;
  arr.forEach((a,i)=>{
    const x=sx+i*(cw+gap);
    card(s, x, y, cw, 1.7, C.card);
    s.addText(a[0], { x, y:y+0.2, w:cw, h:0.85, fontFace:F, fontSize:40, bold:true, color:a[2]||C.red, align:"center", margin:0 });
    s.addText(a[1], { x:x+0.15, y:y+1.05, w:cw-0.3, h:0.55, fontFace:F, fontSize:12, color:C.mut, align:"center", lineSpacingMultiple:1.05, margin:0 });
  });
}

/* ===== SLIDE 6 — 통계 ===== */
(() => {
  const s = p.addSlide(); base(s, "120A0A");
  badge(s, "PART 2 · 세상은 교회를 어떻게 보는가", 0.9, 0.75);
  title(s, [{text:"우리 자녀들은 교회를 ",options:{color:C.white}},{text:"떠나고",options:{color:C.gold2}},{text:" 있습니다",options:{color:C.white}}], 0.9, 1.2, 11.5, 32);
  stats(s, [["59%","20대 청년\n교회 이탈률",C.red],["87%","“판단적이다”",C.red],["85%","“위선적이다”",C.red],["50%","교회 청년도\n“우리 교회가 판단적”",C.warm]], 2.9);
  footer(s, [{text:"Barna Research 비기독교인 청년 조사   ·   ",options:{color:C.mut2}},{text:"문을 잠근 것은 세상이 아닙니다. 우리가 먼저 잠갔습니다.",options:{color:C.white,bold:true}}], 5.3);
  s.addNotes(NOTES[5]);
})();

/* ===== SLIDE 7 — GAP ===== */
(() => {
  const s = p.addSlide(); base(s, "120A0A");
  title(s, [{text:"우리는 압니다. 그러나 — ",options:{color:C.white}},{text:"실천하고 있는가?",options:{color:C.gold2}}], 0.9, 0.9, 11.5, 30);
  const y=2.2, h=3.3, cw=5.0, gap=1.3, sx=(W-(cw*2+gap))/2;
  card(s, sx, y, cw, h, "0E1A16");
  s.addText("성경이 말하는 것", { x:sx+0.35, y:y+0.28, w:cw-0.7, h:0.4, fontFace:F, fontSize:14, bold:true, color:C.mint, margin:0 });
  s.addText(["“손님 대접하기를 잊지 말라” 히 13:2","“나그네를 영접하라” 마 25:35","“대접하기를 힘쓰라” 롬 12:13"].map(t=>({text:t,options:{bullet:{indent:14},color:C.white,breakLine:true,paraSpaceAfter:8}})),
    { x:sx+0.35, y:y+0.9, w:cw-0.7, h:1.7, fontFace:F, fontSize:14, margin:0 });
  s.addText("모든 교회가 동의합니다", { x:sx+0.35, y:y+2.75, w:cw-0.7, h:0.4, fontFace:F, fontSize:12, italic:true, color:C.mut2, margin:0 });
  // GAP 화살표
  s.addText("→", { x:sx+cw, y:y+h/2-0.5, w:gap, h:0.7, fontFace:F, fontSize:34, bold:true, color:C.gold, align:"center", valign:"middle", margin:0 });
  s.addText("GAP", { x:sx+cw, y:y+h/2+0.15, w:gap, h:0.4, fontFace:F, fontSize:12, bold:true, color:C.red, align:"center", margin:0 });
  card(s, sx+cw+gap, y, cw, h, "1A1010");
  s.addText("실제 경험", { x:sx+cw+gap+0.35, y:y+0.28, w:cw-0.7, h:0.4, fontFace:F, fontSize:14, bold:true, color:C.red, margin:0 });
  s.addText(["처음 온 방문자 — 아무도 인사 안 함","다음 주도 이름을 모름","식사 후 신자끼리만 어울림","심문처럼 들리는 “어떻게 오셨어요?”"].map(t=>({text:t,options:{bullet:{indent:14},color:C.white,breakLine:true,paraSpaceAfter:8}})),
    { x:sx+cw+gap+0.35, y:y+0.9, w:cw-0.7, h:2.0, fontFace:F, fontSize:14, margin:0 });
  s.addText("훈련이 없어서입니다", { x:sx+cw+gap+0.35, y:y+2.75, w:cw-0.7, h:0.4, fontFace:F, fontSize:12, italic:true, color:C.mut2, margin:0 });
  footer(s, [{text:"신학교에 설교학·상담학·성경 해석학은 있는데 — ",options:{color:C.mut}},{text:"환대학(Hospitality Studies)은 없습니다.",options:{color:C.white,bold:true}}], 5.9);
  s.addNotes(NOTES[6]);
})();

/* ===== SLIDE 8 — Missio Dei ===== */
(() => {
  const s = p.addSlide(); base(s, "060C16");
  badge(s, "PART 3 · 환대의 신학", 0.9, 0.75);
  title(s, [{text:"선교하시는 하나님  ",options:{color:C.white}},{text:"Missio Dei",options:{color:C.gold2}}], 0.9, 1.2, 11.5, 32);
  const steps=[["하나님이 먼저\n세상으로 오심","요 1:14 성육신 = 궁극의 환대",C.gold,true],
               ["모든 그리스도인이\n그 선교에 참여","선교는 하나님의 것",C.white,false],
               ["환대 = 참여의\n구체적 방식","마 25:35 · 롬 12:13",C.gold,true],
               ["하나님 나라\n확장","",C.gold2,false]];
  const cw=2.7, gap=0.55, totw=cw*4+gap*3, sx=(W-totw)/2, y=2.7;
  steps.forEach((st,i)=>{
    const x=sx+i*(cw+gap);
    card(s, x, y, cw, 1.7, st[3]?"1A160B":C.card);
    s.addText(st[0], { x:x+0.1, y:y+0.25, w:cw-0.2, h:0.85, fontFace:F, fontSize:15, bold:true, color:st[2], align:"center", lineSpacingMultiple:1.1, margin:0 });
    if(st[1]) s.addText(st[1], { x:x+0.1, y:y+1.12, w:cw-0.2, h:0.5, fontFace:F, fontSize:10.5, color:C.mut2, align:"center", lineSpacingMultiple:1.05, margin:0 });
    if(i<3) s.addText("→", { x:x+cw, y:y+0.55, w:gap, h:0.6, fontFace:F, fontSize:22, color:C.mut2, align:"center", valign:"middle", margin:0 });
  });
  footer(s, [{text:"선교는 교회가 하는 프로그램이 아닙니다. 하나님이 먼저 하시는 일입니다.\n그러므로 이것은 개교회 성장 운동이 아니라 — ",options:{color:C.mut}},{text:"모든 그리스도인의 선교 운동입니다.",options:{color:C.gold2,bold:true}}], 4.9);
  s.addNotes(NOTES[7]);
})();

/* ===== SLIDE 9 — φιλοξενία ===== */
(() => {
  const s = p.addSlide(); base(s, "060C16");
  s.addText([{text:"φιλοξενία",options:{color:C.gold2}},{text:"  필로세니아 — 낯선 자를 사랑함",options:{color:C.white}}],
    { x:0.9, y:0.85, w:11.5, h:0.9, fontFace:F, fontSize:30, bold:true, align:"left", margin:0 });
  twoCol(s,
    "구약 — 나그네 환대 명령", ["아브라함 — 달려나가 나그네를 맞이함 (창 18:2)","“나그네를 압제하지 말라” (출 22:21)","“이방인을 이스라엘 백성처럼” (레 19:34)"], C.gold,
    "신약 — 환대가 선교의 언어", ["바울 — 아굴라·브리스길라 집에 머묾 (행 18:3)","루디아 — “내 집에 머무르라” (행 16:15)","“손님 대접하기를 잊지 말라” (히 13:2)"], C.mint, 2.2);
  footer(s, [{text:"하나님은 환대를 ",options:{color:C.mut}},{text:"명령",options:{color:C.white,bold:true}},{text:"하셨습니다. 이유: ",options:{color:C.mut}},{text:"“너희도 한때 나그네였기 때문” (신 10:19)",options:{color:C.white,bold:true}}], 6.0);
  s.addNotes(NOTES[8]);
})();

/* ===== SLIDE 10 — 4축 ===== */
(() => {
  const s = p.addSlide(); base(s, "060C16");
  title(s, [{text:"어떻게 환대를 ",options:{color:C.white}},{text:"살 것인가",options:{color:C.gold2}},{text:"  —  4축 환대 지수",options:{color:C.white}}], 0.9, 0.85, 11.5, 28);
  const ax=[["1","인식 Recognition","“아버지가 먼저 알아봄” 눅 15:20","이름을 부르고 눈을 맞춘다."],
            ["2","수용 Acceptance","“그리스도처럼 받으라” 롬 15:7","조건 없이 받아들인다. 심문하지 않는다."],
            ["3","제공 Provision","“주리고 목마를 때” 마 25:35","실질적 필요를 채운다. 정보·식사·공간."],
            ["4","연결 Connection","“모든 것을 함께” 행 2:44","한 사람을 공동체로 이어준다."]];
  const cw=5.6, ch=1.55, gap=0.5, sx=(W-(cw*2+gap))/2, y0=1.95;
  ax.forEach((a,i)=>{
    const col=i%2, row=Math.floor(i/2);
    const x=sx+col*(cw+gap), y=y0+row*(ch+0.3);
    card(s, x, y, cw, ch, C.card);
    s.addText(a[0], { x:x+0.25, y:y+0.2, w:0.8, h:0.8, fontFace:F, fontSize:30, bold:true, color:C.mint, align:"center", margin:0 });
    s.addText(a[1], { x:x+1.1, y:y+0.22, w:cw-1.3, h:0.4, fontFace:F, fontSize:15, bold:true, color:C.white, margin:0 });
    s.addText(a[2], { x:x+1.1, y:y+0.6, w:cw-1.3, h:0.35, fontFace:F, fontSize:11.5, italic:true, color:C.gold, margin:0 });
    s.addText(a[3], { x:x+1.1, y:y+0.95, w:cw-1.3, h:0.5, fontFace:F, fontSize:12.5, color:C.mut, lineSpacingMultiple:1.05, margin:0 });
  });
  footer(s, [{text:"만점은 시스템이 아니라 — ",options:{color:C.mut}},{text:"아브라함이 달려나간 그 모습(창 18장)",options:{color:C.white,bold:true}},{text:"입니다.",options:{color:C.mut}}], 6.05);
  s.addNotes(NOTES[9]);
})();

/* ===== SLIDE 11 — 제4공간 ===== */
(() => {
  const s = p.addSlide(); base(s, "061410");
  badge(s, "PART 4 · 제4공간과 HebronGuide", 0.9, 0.7);
  title(s, [{text:"제4공간 — 온·오프라인이 만나는 ",options:{color:C.white}},{text:"환대의 마당",options:{color:C.gold2}}], 0.9, 1.15, 11.5, 28);
  const rows=[["제1공간 — 가정 (Home)",false],["제2공간 — 일터·학교 (Work)",false],["제3공간 — 카페·광장·교회 (Oldenburg, 1989)",false],["제4공간 — 온·오프라인이 함께 만나는 환대의 마당",true]];
  const x=3.0, w=7.3, h=0.72, y0=2.15;
  rows.forEach((r,i)=>{
    const y=y0+i*(h+0.18);
    s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius:0.08,
      fill:{ color:r[1]?"1A160B":C.card }, line:{ color:r[1]?C.gold:C.cardLine, width:r[1]?1.5:1 }, shadow:shadow() });
    s.addText(r[0], { x:x+0.4, y, w:w-0.8, h, fontFace:F, fontSize:r[1]?16:14.5, bold:r[1], color:r[1]?C.gold:C.white, valign:"middle", margin:0 });
  });
  footer(s, [{text:"“정보는 연결되었지만 마음은 외롭습니다.” — Rifkin, 공감시대(2009)   ·   ",options:{color:C.mut}},{text:"공감의 시대, 가장 그리스도교적인 응답은 환대입니다.",options:{color:C.white,bold:true}}], 6.35);
  s.addNotes(NOTES[10]);
})();

/* ===== SLIDE 12 — 마당 Before/After ===== */
(() => {
  const s = p.addSlide(); base(s, "061410");
  title(s, [{text:"HebronGuide는 플랫폼이 아니라 ",options:{color:C.white}},{text:"마당",options:{color:C.gold2}},{text:"입니다",options:{color:C.white}}], 0.9, 0.85, 11.5, 28);
  twoCol(s,
    "생태계 이전 (Before)", ["이민자 도착 → 혼자 검색","교회를 모름. 성도 가게 못 찾음","언어 장벽. 마음이 닫힘","복음을 듣지 못함","하나님 나라가 가려짐"], C.red,
    "생태계 이후 (After)", ["도착 → HebronGuide 오픈","공항에서부터 교회를 만남","성도 가게에서 첫 번째 환대","신뢰 → 마음 열림 → 복음","“날마다 더하여 주셨다” 행 2:47"], C.mint, 2.0);
  footer(s, [{text:"흩어진 성도의 일상이 선교 현장이 됩니다.",options:{color:C.white,bold:true}}], 6.0);
  s.addNotes(NOTES[11]);
})();

/* ===== SLIDE 13 — 라이브 ===== */
(() => {
  const s = p.addSlide(); base(s, C.bg);
  badge(s, "LIVE 체험", 0.9, 0.75);
  title(s, [{text:"지금 직접 ",options:{color:C.white}},{text:"열어보십시오",options:{color:C.gold2}}], 0.9, 1.2, 11.5, 32);
  const bw=4.6, gap=0.7, sx=(W-(bw*2+gap))/2, y=2.5, bh=2.0;
  [["hebronguide.com","메인 사이트",C.mint],["hebronguide.com/church-guide","교회 무료 등재",C.gold]].forEach((b,i)=>{
    const x=sx+i*(bw+gap);
    card(s, x, y, bw, bh, C.card);
    s.addShape(p.shapes.ROUNDED_RECTANGLE, { x:x+bw/2-0.55, y:y+0.25, w:1.1, h:1.1, rectRadius:0.08, fill:{color:"0E1320"}, line:{color:b[2],width:1.5} });
    s.addText("QR", { x:x+bw/2-0.55, y:y+0.25, w:1.1, h:1.1, fontFace:F, fontSize:13, color:C.mut2, align:"center", valign:"middle", margin:0 });
    s.addText(b[0], { x:x+0.2, y:y+1.42, w:bw-0.4, h:0.35, fontFace:F, fontSize:14, bold:true, color:b[2], align:"center", margin:0 });
    s.addText(b[1], { x:x+0.2, y:y+1.72, w:bw-0.4, h:0.28, fontFace:F, fontSize:11, color:C.mut2, align:"center", margin:0 });
  });
  const chips=["71개+ 도시 LIVE","검증된 교회","성도의 가게","정착 정보"];
  const chw=2.3, cg=0.3, ctot=chw*4+cg*3, csx=(W-ctot)/2, cy=4.9;
  chips.forEach((c,i)=>{ const x=csx+i*(chw+cg);
    s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y:cy, w:chw, h:0.5, rectRadius:0.25, fill:{color:"0E1A16"}, line:{color:"1E5C46",width:1} });
    s.addText(c, { x, y:cy, w:chw, h:0.5, fontFace:F, fontSize:12, bold:true, color:C.mint, align:"center", valign:"middle", margin:0 });
  });
  footer(s, [{text:"셀폰이든 PC든 상관없습니다. 홈 화면에 추가하면 ",options:{color:C.mut}},{text:"앱처럼",options:{color:C.white,bold:true}},{text:" 쓸 수 있습니다.",options:{color:C.mut}}], 5.75);
  s.addNotes(NOTES[12]);
})();

/* ===== SLIDE 14 — 변화될 세상 ===== */
(() => {
  const s = p.addSlide(); base(s, "061410");
  badge(s, "PART 5 · 변화될 세상", 0.9, 0.75);
  title(s, [{text:"HebronGuide가 그리는 ",options:{color:C.white}},{text:"세상",options:{color:C.gold2}}], 0.9, 1.2, 11.5, 32);
  const v=[["첫째 날","공항을 나서는 첫날부터 환대받는 세상","세계 어느 도시에 도착하든, 낯선 땅의 첫 순간부터 그리스도인의 환대를 만납니다."],
           ["식탁","성도의 가게가 누군가의 첫 교회가 되는 세상","일터와 식탁이 선교 현장이 됩니다. 성도의 일상이 곧 예배가 됩니다."],
           ["열방","모든 민족이 그리스도께 돌아오는 마당","한 도시의 환대가 열방으로 흐릅니다. 교단의 벽을 넘어 함께 만드는 마당입니다."]];
  const cw=3.85, gap=0.45, totw=cw*3+gap*2, sx=(W-totw)/2, y=2.7, h=2.6;
  v.forEach((c,i)=>{ const x=sx+i*(cw+gap);
    card(s, x, y, cw, h, "0E1A16");
    s.addText(c[0], { x:x+0.3, y:y+0.28, w:cw-0.6, h:0.5, fontFace:F, fontSize:20, bold:true, color:C.mint, margin:0 });
    s.addText(c[1], { x:x+0.3, y:y+0.85, w:cw-0.6, h:0.85, fontFace:F, fontSize:15, bold:true, color:C.white, lineSpacingMultiple:1.15, margin:0 });
    s.addText(c[2], { x:x+0.3, y:y+1.7, w:cw-0.6, h:0.8, fontFace:F, fontSize:12.5, color:C.mut, lineSpacingMultiple:1.2, margin:0 });
  });
  footer(s, [{text:"이것은 먼 꿈이 아닙니다. ",options:{color:C.mut}},{text:"71개 도시에서 이미 시작되었습니다.",options:{color:C.white,bold:true}}], 5.7);
  s.addNotes(NOTES[13]);
})();

/* ===== SLIDE 15 — 임팩트 3겹 ===== */
(() => {
  const s = p.addSlide(); base(s, "061410");
  title(s, [{text:"환대 한 번이 ",options:{color:C.white}},{text:"세 겹",options:{color:C.gold2}},{text:"으로 살립니다",options:{color:C.white}}], 0.9, 1.0, 11.5, 32);
  const v=[["1","한 사람의 인생","낯선 도시에서 처음 받은 환대가 그 사람의 인생 전환점이 됩니다.","개인이 삽니다.",C.gold],
           ["2","성도의 일상","성도의 가게와 식탁이 선교의 현장이 됩니다. 삶이 곧 예배입니다.","커뮤니티가 삽니다.",C.mint],
           ["3","하나님 나라 운동","개교회 운동이 아닙니다. 한 성도의 환대가 하나님 나라를 드러냅니다.","모든 그리스도인의 선교 운동입니다.",C.gold2]];
  const cw=3.85, gap=0.45, totw=cw*3+gap*2, sx=(W-totw)/2, y=2.5, h=3.0;
  v.forEach((c,i)=>{ const x=sx+i*(cw+gap);
    card(s, x, y, cw, h, C.card);
    s.addText(c[0], { x:x+0.3, y:y+0.25, w:1, h:0.7, fontFace:F, fontSize:32, bold:true, color:c[4], margin:0 });
    s.addText(c[1], { x:x+0.3, y:y+1.0, w:cw-0.6, h:0.45, fontFace:F, fontSize:16, bold:true, color:C.white, margin:0 });
    s.addText(c[2], { x:x+0.3, y:y+1.5, w:cw-0.6, h:0.95, fontFace:F, fontSize:12.5, color:C.mut, lineSpacingMultiple:1.25, margin:0 });
    s.addText(c[3], { x:x+0.3, y:y+2.45, w:cw-0.6, h:0.4, fontFace:F, fontSize:13, bold:true, color:c[4], margin:0 });
  });
  s.addNotes(NOTES[14]);
})();

/* ===== SLIDE 16 — 도전 & 등록 ===== */
(() => {
  const s = p.addSlide(); base(s, "0F0C06");
  badge(s, "오늘 우리가 할 일", 0.9, 0.65);
  title(s, [{text:"환대의 삶을 살고 ",options:{color:C.white}},{text:"함께 등록",options:{color:C.gold2}},{text:"해 주십시오",options:{color:C.white}}], 0.9, 1.1, 11.5, 30);
  s.addText([{text:"이번 주, 낯선 한 사람의 ",options:{color:C.mut}},{text:"이름을 기억하는 것",options:{color:C.white,bold:true}},{text:"부터 시작하십시오.   그리고 등록은 비용이 아니라 ",options:{color:C.mut}},{text:"선교 헌신",options:{color:C.white,bold:true}},{text:"입니다.",options:{color:C.mut}}],
    { x:0.9, y:2.2, w:11.5, h:0.6, fontFace:F, fontSize:15, align:"left", lineSpacingMultiple:1.2, margin:0 });
  const cw=5.5, gap=0.6, sx=(W-(cw*2+gap))/2, y=3.0, h=2.2;
  [["목사님 · 교회","교회를 무료로 등재하세요. 새로 도착한 영혼이 공항에서부터 여러분의 교회를 만납니다.","hebronguide.com/church-guide",C.gold,"15110A"],
   ["성도 · 사업체","성도의 가게를 등록하세요. 일터가 환대의 첫 현장이 됩니다.","hebronguide.com/ad-request",C.mint,"0E1A16"]].forEach((c,i)=>{
    const x=sx+i*(cw+gap);
    s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w:cw, h, rectRadius:0.1, fill:{color:c[4]}, line:{color:c[3],width:1.3}, shadow:shadow() });
    s.addText(c[0], { x:x+0.35, y:y+0.28, w:cw-0.7, h:0.45, fontFace:F, fontSize:18, bold:true, color:c[3], margin:0 });
    s.addText(c[1], { x:x+0.35, y:y+0.85, w:cw-0.7, h:0.8, fontFace:F, fontSize:13, color:C.mut, lineSpacingMultiple:1.25, margin:0 });
    s.addText(c[2], { x:x+0.35, y:y+1.62, w:cw-0.7, h:0.4, fontFace:F, fontSize:14.5, bold:true, color:C.white, margin:0 });
  });
  footer(s, [{text:"내 도시가 없으십니까?  ",options:{color:C.mut}},{text:"hebronguide.com",options:{color:C.gold,bold:true}},{text:" 에서 도시 추가를 신청해 주십시오.",options:{color:C.mut}}], 5.6);
  s.addNotes(NOTES[15]);
})();

/* ===== SLIDE 17 — 클로징 ===== */
(() => {
  const s = p.addSlide(); base(s, "100B00");
  s.addText("“각 나라와 족속과 백성과 방언에서\n아무도 셀 수 없는 큰 무리가...”", { x:1, y:1.2, w:11.3, h:1.1,
    fontFace:F, fontSize:24, italic:true, bold:true, color:C.gold2, align:"center", lineSpacingMultiple:1.2, margin:0 });
  s.addText("— 요한계시록 7:9 (새번역)", { x:1, y:2.35, w:11.3, h:0.35, fontFace:F, fontSize:12, color:"9C7E2E", align:"center", margin:0 });
  s.addText([{text:"환대가 ",options:{color:C.white}},{text:"세상을 바꿉니다",options:{color:C.gold2}}], { x:1, y:2.95, w:11.3, h:0.9,
    fontFace:F, fontSize:40, bold:true, align:"center", valign:"middle", margin:0 });
  s.addText("모든 그리스도인이 일상에서 환대를 실천할 때,\n커뮤니티가 살고, 열방이 돌아오고, 하나님께 영광이 돌아갑니다.", { x:1, y:4.0, w:11.3, h:0.9,
    fontFace:F, fontSize:16, color:C.mut, align:"center", lineSpacingMultiple:1.35, margin:0 });
  const bw=4.4, gap=0.6, sx=(W-(bw*2+gap))/2, y=5.05, bh=0.85;
  [["hebronguide.com","지금 바로 열어보세요"],["Hebronplatform@gmail.com","파트너십 문의"]].forEach((b,i)=>{
    const x=sx+i*(bw+gap);
    s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w:bw, h:bh, rectRadius:0.1, fill:{color:"15110A"}, line:{color:C.gold,width:1} });
    s.addText(b[0], { x, y:y+0.12, w:bw, h:0.4, fontFace:F, fontSize:15, bold:true, color:C.gold2, align:"center", margin:0 });
    s.addText(b[1], { x, y:y+0.5, w:bw, h:0.28, fontFace:F, fontSize:10.5, color:"9C7E2E", align:"center", margin:0 });
  });
  s.addText("SOLI DEO GLORIA", { x:1, y:6.6, w:11.3, h:0.4, fontFace:F, fontSize:14, bold:true, color:"9C7E2E", charSpacing:6, align:"center", margin:0 });
  s.addNotes(NOTES[16]);
})();

p.writeFile({ fileName: "HebronGuide_발표_김성수목사.pptx" }).then(f => console.log("DONE:", f));
