const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, HeadingLevel, ImageRun, PageBreak, LevelFormat
} = require("docx");

const F = "Malgun Gothic";
const MONO = "Consolas";
const TEAL = "17564F";
const GOLD = "8A5E0C";
const INK = "1A1F23";
const GREY = "6B7680";
const LINE = "D6DCDB";
const TINT_T = "EDF4F2";
const TINT_G = "FBF4E6";
const TINT_R = "FBEEEC";
const RISK = "9C3428";
const W = 10080;

const NB = {
  top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},
  bottom:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},
  left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"},
  right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}
};
const TB = {
  top:{style:BorderStyle.SINGLE,size:4,color:LINE},
  bottom:{style:BorderStyle.SINGLE,size:4,color:LINE},
  left:{style:BorderStyle.SINGLE,size:4,color:LINE},
  right:{style:BorderStyle.SINGLE,size:4,color:LINE},
  insideHorizontal:{style:BorderStyle.SINGLE,size:4,color:LINE},
  insideVertical:{style:BorderStyle.SINGLE,size:4,color:LINE}
};

const gap = (h) => new Paragraph({children:[new TextRun({text:"",size:2})],spacing:{after:h}});

function h1(text, num){
  return new Paragraph({
    spacing:{before:420,after:140,line:280},
    border:{bottom:{style:BorderStyle.SINGLE,size:8,color:TEAL,space:6}},
    children:[
      new TextRun({text:num?num+"  ":"",font:F,size:26,bold:true,color:GOLD}),
      new TextRun({text,font:F,size:28,bold:true,color:TEAL})
    ]
  });
}
function h2(text){
  return new Paragraph({
    spacing:{before:260,after:90,line:280},
    children:[new TextRun({text,font:F,size:22,bold:true,color:INK})]
  });
}
function p(text,opt={}){
  return new Paragraph({
    spacing:{after:opt.after??120,line:opt.line??300},
    alignment:AlignmentType.JUSTIFIED,
    indent:opt.indent?{left:opt.indent}:undefined,
    children:[new TextRun({text,font:F,size:opt.size??19,color:opt.color??INK,bold:!!opt.bold})]
  });
}
function rich(runs,opt={}){
  return new Paragraph({
    spacing:{after:opt.after??120,line:300},
    alignment:AlignmentType.JUSTIFIED,
    keepNext:!!opt.keepNext,
    indent:opt.indent?{left:opt.indent}:undefined,
    children:runs.map(r=>new TextRun({
      text:r.t,font:r.mono?MONO:F,size:r.size??19,
      bold:!!r.b,color:r.c??INK,italics:!!r.i
    }))
  });
}
function bullet(text,lvl=0){
  return new Paragraph({
    numbering:{reference:"dash",level:lvl},
    spacing:{after:70,line:290},
    children:[new TextRun({text,font:F,size:19,color:INK})]
  });
}
function step(n,title,body){
  return [
    new Paragraph({
      spacing:{before:180,after:50,line:280},
      children:[
        new TextRun({text:"단계 "+n+".  ",font:F,size:20,bold:true,color:GOLD}),
        new TextRun({text:title,font:F,size:20,bold:true,color:INK})
      ]
    }),
    p(body,{indent:520,size:18,after:40})
  ];
}
function box(lines,tint,barColor){
  return new Table({
    width:{size:W,type:WidthType.DXA},columnWidths:[W],borders:NB,
    rows:[new TableRow({children:[new TableCell({
      width:{size:W,type:WidthType.DXA},
      borders:{...NB,left:{style:BorderStyle.SINGLE,size:18,color:barColor}},
      shading:{fill:tint,type:ShadingType.CLEAR,color:"auto"},
      margins:{top:170,bottom:170,left:230,right:230},
      children:lines
    })]})]
  });
}
function code(lines){
  return new Table({
    width:{size:W,type:WidthType.DXA},columnWidths:[W],borders:NB,
    rows:[new TableRow({children:[new TableCell({
      width:{size:W,type:WidthType.DXA},borders:NB,
      shading:{fill:"F4F6F6",type:ShadingType.CLEAR,color:"auto"},
      margins:{top:160,bottom:160,left:220,right:220},
      children:lines.map(l=>new Paragraph({
        spacing:{after:20,line:250},
        children:[new TextRun({text:l,font:MONO,size:16,color:"3A4249"})]
      }))
    })]})]
  });
}
function table(cols,rows,opts={}){
  const head = new TableRow({
    tableHeader:true,
    children:cols.map((c,i)=>new TableCell({
      width:{size:opts.w[i],type:WidthType.DXA},
      shading:{fill:TEAL,type:ShadingType.CLEAR,color:"auto"},
      margins:{top:110,bottom:110,left:150,right:150},
      children:[new Paragraph({
        alignment:i>0&&opts.center?AlignmentType.CENTER:AlignmentType.LEFT,
        spacing:{after:0,line:250},
        children:[new TextRun({text:c,font:F,size:17,bold:true,color:"FFFFFF"})]
      })]
    }))
  });
  const body = rows.map((r,ri)=>new TableRow({
    children:r.map((c,i)=>new TableCell({
      width:{size:opts.w[i],type:WidthType.DXA},
      shading:{fill:ri%2?"F7F9F9":"FFFFFF",type:ShadingType.CLEAR,color:"auto"},
      margins:{top:110,bottom:110,left:150,right:150},
      children:[new Paragraph({
        alignment:i>0&&opts.center?AlignmentType.CENTER:AlignmentType.LEFT,
        spacing:{after:0,line:260},
        children:[new TextRun({
          text:c,font:F,size:17,
          bold:i===0&&!!opts.boldFirst,
          color:c==="스킬 필수"?RISK:(c==="○"?TEAL:INK)
        })]
      })]
    }))
  }));
  return new Table({width:{size:W,type:WidthType.DXA},columnWidths:opts.w,borders:TB,rows:[head,...body]});
}
function caption(t){
  return new Paragraph({
    spacing:{before:80,after:180,line:260},alignment:AlignmentType.CENTER,
    children:[new TextRun({text:t,font:F,size:16,color:GREY})]
  });
}

/* ==================== CONTENT ==================== */
const K = [];

// --- cover ---
K.push(gap(700));
K.push(new Paragraph({
  spacing:{after:60,line:260},
  children:[new TextRun({text:"HEBRON PLATFORM LLC  ·  운영자용 안내서",font:F,size:17,bold:true,color:GOLD})]
}));
K.push(new Paragraph({
  spacing:{after:100,line:420},
  children:[new TextRun({text:"스킬(Skill) 사용 설명서",font:F,size:52,bold:true,color:TEAL})]
}));
K.push(new Paragraph({
  spacing:{after:280,line:340},
  children:[new TextRun({text:"반복되는 일을 한 번만 가르치는 법",font:F,size:26,color:INK})]
}));
K.push(new Paragraph({
  border:{top:{style:BorderStyle.SINGLE,size:8,color:LINE,space:8}},
  spacing:{before:100,after:60,line:280},
  children:[new TextRun({text:"2026년 8월 30일  ·  작성 근거: Builders Lounge 4차 발표 영상 분석 및 hebronguide.com 현황 점검",font:F,size:17,color:GREY})]
}));
K.push(gap(400));

K.push(box([
  rich([{t:"이 문서를 읽고 나면 세 가지를 하실 수 있습니다.",b:true,size:20,c:TEAL}],{after:110}),
  rich([{t:"첫째, ",b:true},{t:"스킬이 무엇이고 왜 필요한지 다른 사람에게 설명할 수 있습니다."}],{after:60}),
  rich([{t:"둘째, ",b:true},{t:"오늘 만든 두 스킬을 직접 불러 쓸 수 있습니다."}],{after:60}),
  rich([{t:"셋째, ",b:true},{t:"필요한 스킬을 스스로 새로 만들 수 있습니다. 코드는 필요 없습니다."}],{after:0})
],TINT_T,TEAL));

K.push(gap(260));
K.push(p("바이브 코딩으로 앱을 만드셨습니다. 스킬은 그다음 단계입니다 — 앱을 만드는 일이 아니라, 그 앱을 운영하는 방식을 만드는 일입니다. 도시가 82개에서 500개로 가는 동안 목사님의 시간은 늘어나지 않습니다. 늘어나지 않는 시간으로 늘어나는 일을 감당하는 방법이 스킬입니다.",{size:19}));

K.push(new Paragraph({children:[new PageBreak()]}));

// --- 1부 ---
K.push(h1("스킬이 무엇인가","1부"));
K.push(h2("한 줄로 말하면"));
K.push(box([
  rich([{t:"스킬은 “이런 일은 이렇게 해라”를 적어둔 한 장짜리 문서입니다. 저장해 두면, 그 일이 생길 때마다 AI가 스스로 그 문서를 펼쳐 보고 그대로 따릅니다.",b:true,size:20}],{after:0})
],TINT_G,GOLD));
K.push(gap(160));

K.push(h2("목회 현장의 비유 — 주일예배 순서지"));
K.push(p("매주 주일예배를 드릴 때 순서를 매번 새로 정하지 않으십니다. 순서지가 있습니다. 누가 인도하든 같은 순서로, 같은 품질로 진행됩니다. 순서지를 고치면 다음 주부터 모두가 바뀐 순서를 따릅니다."));
K.push(rich([
  {t:"스킬이 정확히 그 순서지입니다. 다른 점은 하나뿐입니다 — "},
  {t:"순서지는 사람이 읽고, 스킬은 AI가 읽습니다.",b:true}
]));

K.push(h2("자주 하는 세 가지 오해"));
K.push(rich([{t:"오해 1  ",b:true,c:RISK},{t:"“스킬은 프로그램이다.”",b:true}],{after:40}));
K.push(p("아닙니다. 대부분 한글로 쓴 문서 한 장입니다. 오늘 만든 두 스킬에도 코드는 거의 없습니다. 있는 것은 “무엇을 확인하고, 무엇을 금지하고, 결과를 어떤 모양으로 낼 것인가”라는 규칙뿐입니다.",{indent:340,size:18}));

K.push(rich([{t:"오해 2  ",b:true,c:RISK},{t:"“만들려면 개발을 알아야 한다.”",b:true}],{after:40}));
K.push(p("아닙니다. “이렇게 해줘”를 충분히 자세히 적으면 그것이 스킬입니다. 오늘 목사님이 하신 일은 “어떤 것이 필요한가”를 고르신 것뿐이고, 문서화는 대화로 끝났습니다.",{indent:340,size:18}));

K.push(rich([{t:"오해 3  ",b:true,c:RISK},{t:"“한 번 만들면 못 고친다.”",b:true}],{after:40}));
K.push(p("아닙니다. 언제든 고칠 수 있고, 고치는 순간 이후의 모든 작업에 반영됩니다. 스킬은 완성품이 아니라 살아 있는 문서입니다.",{indent:340,size:18}));

K.push(gap(200));
K.push(new Paragraph({
  alignment:AlignmentType.CENTER,spacing:{after:0},
  children:[new ImageRun({
    type:"png",
    data:fs.readFileSync("/sessions/zealous-exciting-maxwell/mnt/outputs/hebron-skill-diagram.png"),
    transformation:{width:672,height:624}
  })]
}));
K.push(caption("[그림 1] 위: 스킬의 작동 원리 — 매번 설명 vs 한 번 적어두고 반복 호출.  아래: 두 스킬이 HebronGuide 운영 흐름에 꽂히는 자리."));

K.push(new Paragraph({children:[new PageBreak()]}));

// --- 2부 ---
K.push(h1("왜 필요한가","2부"));
K.push(h2("스킬로 만들어야 하는 일의 세 가지 조건"));
K.push(rich([{t:"① 반복된다.  ",b:true,c:GOLD},{t:"한 번 하고 끝나는 일이면 스킬이 필요 없습니다. 그때그때 부탁하시는 편이 빠릅니다."}],{after:60}));
K.push(rich([{t:"② 기준이 있다.  ",b:true,c:GOLD},{t:"“잘된 결과”가 무엇인지 말로 설명할 수 있어야 합니다. 설명할 수 없으면 아직 스킬로 만들 때가 아닙니다."}],{after:60}));
K.push(rich([{t:"③ 틀리면 비용이 크다.  ",b:true,c:GOLD},{t:"사기 파트너 한 곳이 등재되면 플랫폼 전체의 신뢰가 무너집니다. 메타태그 오류는 82개 도시에 그대로 복제됩니다."}],{after:140}));

K.push(p("세 조건이 모두 해당하면 반드시 스킬로 만드십시오. 둘이면 만들어 두면 좋고, 하나뿐이면 그냥 그때그때 부탁하시는 것이 낫습니다."));

K.push(h2("목사님 업무에 실제로 대입해 보면"));
K.push(table(
  ["업무","반복","기준","실수 비용","판정"],
  [
    ["파트너(교회·업체) 심사","○","○","○","스킬 필수"],
    ["새 도시 페이지 만들기","○","○","○","스킬 필수"],
    ["목장 나눔지 제작","○","○","△","이미 보유"],
    ["새 도시 파트너 모집 편지","○","○","△","다음 후보"],
    ["주일 설교 원고 작성","○","△","—","그때그때"],
    ["이번 주 발표 슬라이드","×","—","—","그때그때"]
  ],
  {w:[3480,1200,1200,1500,2700],center:true,boldFirst:true}
));
K.push(caption("판정 기준: ○ 세 개면 “스킬 필수”, 두 개면 “만들어 두면 좋음”, 하나면 “그때그때”."));

K.push(new Paragraph({children:[new PageBreak()]}));

// --- 3부 ---
K.push(h1("오늘 만든 두 스킬","3부"));
K.push(p("각각 왜 만들었는지, 어떻게 작동하는지, 무엇을 기대할 수 있는지 순서대로 설명합니다."));

// 3-1
K.push(h2("3-1.  hebron-partner-verify  —  파트너 환대 검증"));

K.push(rich([{t:"왜 만들었나",b:true,size:21,c:GOLD}],{after:70}));
K.push(p("발표 영상 Q&A에서 참석 개발자들이 두 가지를 짚었습니다. 첫째, 검증이 대시보드 앞의 목사님 한 사람에게 걸려 있다는 것. 둘째, 한인 사회의 사기 피해가 교회 관계망을 타고 흐른다는 것입니다. 655개까지는 눈으로 버티셨습니다. 6,500개에서는 버틸 수 없습니다."));
K.push(p("그런데 답이 “검증을 강화한다”여서는 안 됩니다. 목사님께서 이미 겪으셨습니다 — 처음에 검증 장치를 전부 걸어두셨더니 아무도 들어오지 않았습니다. 그래서 이 스킬은 문을 잠그는 방식이 아니라 등급을 붙이는 방식으로 설계했습니다."));
K.push(box([
  rich([{t:"핵심 설계 — 검증은 문지기가 아니라 표지판이다.",b:true,size:19,c:TEAL}],{after:80}),
  rich([{t:"Open  ",b:true,c:GREY},{t:"신청 즉시 등재. 뱃지 없음. 아무도 막지 않습니다."}],{after:40}),
  rich([{t:"Verified  ",b:true,c:TEAL},{t:"실체·연락 확인 완료. “실제로 운영 중임을 확인했습니다.”"}],{after:40}),
  rich([{t:"Trusted  ",b:true,c:GOLD},{t:"실제 환대 사례 1건 이상. 심사자 판단만으로는 절대 줄 수 없습니다 — 환대를 받은 사람이 증언해야 올라갑니다."}],{after:0})
],TINT_T,TEAL));
K.push(gap(160));

K.push(rich([{t:"어떻게 작동하나",b:true,size:21,c:GOLD}],{after:70}));
K.push(bullet("신청 정보가 부족하면 심사를 시작하지 않고 먼저 목사님께 묻습니다."));
K.push(bullet("웹 검색·지도·리뷰로 실체를 확인하고, 항목마다 출처 URL과 확인 날짜를 남깁니다."));
K.push(bullet("환대 4원칙(인식·수용·제공·연결)으로 각 5점씩 채점합니다. 신청서의 “환대하겠습니다”는 0점이고, “새가족부 김OO 집사, 공항 픽업 가능”은 점수가 됩니다."));
K.push(bullet("레드플래그 8개를 점검합니다. 금전 선입금 요구, 비자·취업 보장 문구, 다단계 구조, 사기 신고 이력 등 — 하나라도 걸리면 즉시 보류입니다."));
K.push(bullet("판정 결과를 내부 심사 메모, partner.json, 신청자 통보문(한·영) 초안으로 내놓습니다."));
K.push(bullet("통보 이메일은 초안까지만 만듭니다. 발송은 목사님 확인 뒤에 이뤄집니다."));
K.push(gap(140));

K.push(rich([{t:"기대 효과",b:true,size:21,c:GOLD}],{after:70,keepNext:true}));
K.push(table(
  ["","지금","스킬 적용 후"],
  [
    ["심사 시간","1건당 20~30분, 기억에 의존","1건당 3~5분, 기준이 문서에 고정"],
    ["기준 일관성","그날 컨디션과 관계에 좌우","655건이든 6,500건이든 동일"],
    ["사기 차단","직관에 의존","레드플래그 8개 기계적 점검"],
    ["기록","남지 않음","출처·확인일·재심사일이 JSON으로 남음"],
    ["위임 가능성","목사님만 가능","기준이 문서에 있으므로 다른 사람도 가능"]
  ],
  {w:[2100,3690,4290],boldFirst:true}
));

K.push(new Paragraph({children:[new PageBreak()]}));

// 3-2
K.push(h2("3-2.  hebron-city-pack  —  새 도시 확장 팩"));

K.push(rich([{t:"왜 만들었나",b:true,size:21,c:GOLD}],{after:70}));
K.push(p("발표에서 이렇게 말씀하셨습니다 — “페더럴웨이도 하나 만들어 달라고 해서 만들어 드렸어요.” 좋은 일입니다. 문제는 그 방식입니다."));
K.push(box([
  rich([{t:"오늘 확인한 것: ",b:true,c:RISK},{t:"훼더럴웨이 페이지의 keywords 메타태그가 아직 시애틀 키워드 그대로입니다. 손으로 복제하셨다는 증거이고, 나머지 81개 도시 중 몇 개가 같은 상태인지 지금은 알 수 없습니다."}],{after:0})
],TINT_R,RISK));
K.push(gap(160));
K.push(p("이 방식으로는 500개 도시에 갈 수 없습니다. 갈 수 있다 해도, 그 500개가 신뢰할 만한 정보를 담고 있다고 말할 근거가 없습니다."));

K.push(rich([{t:"어떻게 작동하나",b:true,size:21,c:GOLD}],{after:70}));
K.push(bullet("도시 이름만 주시면 slug(주소에 쓰이는 영문 이름)를 제안하고 승인을 받습니다."));
K.push(bullet("실제 사이트와 동일한 16개 섹션 구조(도착·입국 / 첫 주 / 생활·커뮤니티 / 심화·성장)로 리서치합니다."));
K.push(bullet("숫자에는 반드시 출처와 확인 날짜를 붙입니다. 확인하지 못한 숫자는 쓰지 않고 별도 목록으로 뺍니다. “대략 이 정도”라고 얼버무리지 않습니다."));
K.push(bullet("교회·업체 실명은 이 스킬에서 절대 만들지 않습니다. 검증되지 않은 실명 등재가 사고의 시작이기 때문에, 그 자리는 hebron-partner-verify가 채웁니다."));
K.push(bullet("SEO 메타태그를 도시명에 맞게 전부 교체합니다 — 훼더럴웨이 같은 복제 잔재를 원천 차단합니다."));
K.push(bullet("배포 전 9개 항목 검증 게이트를 통과해야만 초안을 내놓습니다."));
K.push(bullet("status는 항상 draft입니다. 목사님이 확인하시기 전에는 절대 LIVE가 되지 않습니다."));
K.push(gap(140));

K.push(box([
  rich([{t:"가장 중요한 규칙 — 한 도시 = 한 사람",b:true,size:19,c:TEAL}],{after:70}),
  rich([{t:"그 도시에 연락 가능한 사람이 한 명도 없으면, 스킬이 경고를 최상단에 씁니다. 사람 없는 도시 페이지는 발표에서 말씀하신 그대로 “사이버에 떠 있는 것”일 뿐이고, 도시 수는 늘어도 신뢰는 줄어들기 때문입니다."}],{after:0})
],TINT_T,TEAL));
K.push(gap(160));

K.push(rich([{t:"기대 효과",b:true,size:21,c:GOLD}],{after:70,keepNext:true}));
K.push(table(
  ["","지금","스킬 적용 후"],
  [
    ["도시 1개 제작","반나절~하루, 손으로 복제","1~2시간, 리서치는 자동"],
    ["메타태그 오류","복제 시 그대로 따라감","도시별 자동 교체 + 검증 게이트"],
    ["숫자 신뢰도","출처 기록 없음","항목마다 출처 URL·확인일"],
    ["빈 도시 방지","기준 없음","사람 없으면 경고, draft 유지"],
    ["확장 속도","목사님 시간에 비례","요청이 오는 만큼 확장 가능"]
  ],
  {w:[2100,3690,4290],boldFirst:true}
));

K.push(new Paragraph({children:[new PageBreak()]}));

// --- 4부 ---
K.push(h1("실제로 쓰는 법","4부"));
K.push(p("두 스킬은 이미 계정에 설치되어 있습니다. 따로 켜거나 불러올 필요가 없습니다. 그냥 평소처럼 말씀하시면 됩니다."));

K.push(h2("이렇게 말씀하시면 됩니다"));
K.push(code([
  "“시애틀 온누리교회 파트너 심사해줘.”",
  "   → hebron-partner-verify 가 자동으로 실행됩니다.",
  "",
  "“밴쿠버 도시 팩 만들어줘.”",
  "   → hebron-city-pack 이 자동으로 실행됩니다.",
  "",
  "“이 교회 등록해도 될까?”  (열쇠말이 달라도 걸립니다)",
  "   → hebron-partner-verify 가 자동으로 실행됩니다."
]));
K.push(gap(140));

K.push(h2("스킬이 안 걸릴 때"));
K.push(p("가끔 스킬이 자동으로 잡히지 않을 수 있습니다. 그때는 이름을 직접 부르시면 됩니다."));
K.push(code(["“hebron-partner-verify 로 심사해줘.”"]));
K.push(gap(140));

K.push(h2("결과를 받으신 뒤에 반드시 하실 일"));
K.push(p("스킬은 초안까지만 만듭니다. 아래 두 가지는 반드시 사람이 하셔야 합니다."));
K.push(bullet("“미확인”으로 남은 항목 처리 — 특히 전화 연결 확인은 스킬이 대신할 수 없습니다."));
K.push(bullet("통보 이메일 발송 승인 — 초안을 읽어보시고 승인하셔야 나갑니다."));
K.push(gap(120));
K.push(box([
  rich([{t:"이것은 제약이 아니라 설계입니다. ",b:true},{t:"목사님이 파는 것은 “믿을 수 있는 사람”입니다. 그 판단의 마지막 한 걸음을 기계에 넘기면, 파는 물건 자체가 달라집니다."}],{after:0})
],TINT_G,GOLD));

K.push(new Paragraph({children:[new PageBreak()]}));

// --- 5부 ---
K.push(h1("직접 만드는 법","5부"));
K.push(p("한 단계에 한 동작씩입니다. 코드는 한 줄도 필요 없습니다."));

K.push(...step(1,"만들 일을 고릅니다","2부의 세 조건(반복 · 기준 · 실수 비용)에 비추어 하나를 고르십시오. 처음에는 가장 자주 하시는 일 하나만 고르시는 것이 좋습니다."));
K.push(...step(2,"지난번에 그 일을 어떻게 하셨는지 적습니다","한글로, 순서대로 적으십시오. 문장이 거칠어도 됩니다. “먼저 이걸 보고, 그다음 저걸 확인하고” 정도면 충분합니다."));
K.push(...step(3,"“절대 하면 안 되는 것”을 적습니다","가장 중요한 단계인데 가장 자주 빠집니다. 예: “확인 못 한 숫자는 쓰지 않는다”, “이메일은 초안까지만 만든다”, “교회 실명을 임의로 만들지 않는다”."));
K.push(...step(4,"결과물이 어떤 모양이어야 하는지 적습니다","Word 문서인지, 표인지, JSON인지. 몇 장짜리인지. 어떤 항목이 반드시 들어가야 하는지."));
K.push(...step(5,"저에게 “이 내용으로 스킬 만들어줘”라고 하십니다","2~4단계에서 적으신 것을 그대로 붙여 주시면 됩니다. 형식은 제가 맞춥니다."));
K.push(...step(6,"한 번 시켜보고, 이상한 부분을 말씀하십니다","“이 항목은 빼줘”, “이건 더 엄격하게”처럼 말씀하시면 됩니다. 보통 두세 번 왕복하면 쓸 만해집니다."));
K.push(...step(7,"저장합니다","“이걸로 저장해줘”라고 하시면 계정에 저장되어 다음 대화에서도 계속 쓸 수 있습니다."));

K.push(new Paragraph({children:[new PageBreak()]}));
K.push(h2("가장 짧은 스킬 — 이만큼만 있어도 동작합니다"));
K.push(code([
  "---",
  "name: \"church-thank-you\"",
  "description: \"파트너 교회에 감사 편지를 쓸 때 사용한다.",
  "              '감사 편지', '교회에 편지' 요청 시 반드시 사용.\"",
  "---",
  "",
  "# 파트너 교회 감사 편지",
  "",
  "## 절대 규칙",
  "- 발신 주소는 Hebronplatform@gmail.com",
  "- 사과체·과잉 격식 금지. 먼저 도착한 사람의 어조로 쓴다.",
  "- 헌금·후원 요청을 절대 넣지 않는다.",
  "- 초안까지만 만든다. 발송은 사용자가 승인한다.",
  "",
  "## 구조 (4문단)",
  "1. 이름을 불러 감사",
  "2. 그 교회가 실제로 한 환대 한 가지를 구체적으로",
  "3. 앞으로의 부탁 한 가지",
  "4. 짧은 축복 — 성경 인용은 새번역"
]));
K.push(caption("스킬의 5요소: ① 이름  ② 언제 부를지(열쇠말)  ③ 작업 순서  ④ 절대 규칙  ⑤ 결과물 형식"));

K.push(gap(120));
K.push(h2("description을 잘 쓰는 요령"));
K.push(p("description은 “언제 이 스킬을 꺼낼지”를 정하는 열쇠말입니다. 여기에 목사님이 실제로 말씀하실 법한 문장을 그대로 넣으십시오. “교회 감사 편지 작성 지원”보다 “‘감사 편지 써줘’, ‘교회에 편지’ 요청 시 반드시 사용”이 훨씬 잘 걸립니다."));

K.push(new Paragraph({children:[new PageBreak()]}));

// --- 6부 ---
K.push(h1("고치는 법과 자주 하는 실수","6부"));
K.push(h2("고치기 — 한 줄이면 됩니다"));
K.push(code([
  "“파트너 심사 스킬의 레드플래그에 ‘교인 명부 요구’를 추가해줘.”",
  "“도시 팩 스킬에서 헤브론 스토어 섹션은 빼줘.”"
]));
K.push(gap(100));
K.push(p("고치는 순간부터 이후 모든 작업에 반영됩니다. 이미 만들어 둔 결과물이 바뀌지는 않으니, 기준을 크게 바꾸셨다면 기존 건을 다시 돌리실지 판단하셔야 합니다."));

K.push(h2("자주 하는 실수 다섯 가지"));
K.push(rich([{t:"1. 너무 크게 만든다.  ",b:true,c:RISK},{t:"“HebronGuide 운영 전체”처럼 만들면 아무 데서도 제대로 안 걸립니다. 하나의 일 = 하나의 스킬입니다."}],{after:70}));
K.push(rich([{t:"2. 열쇠말을 빼먹는다.  ",b:true,c:RISK},{t:"description에 실제 말투가 없으면 스킬이 있어도 불리지 않습니다."}],{after:70}));
K.push(rich([{t:"3. 금지사항을 안 적는다.  ",b:true,c:RISK},{t:"“무엇을 해라”보다 “무엇을 하지 마라”가 결과 품질을 더 크게 좌우합니다. 오늘 만든 두 스킬도 절반이 금지 규칙입니다."}],{after:70}));
K.push(rich([{t:"4. 결과물 형식을 안 정한다.  ",b:true,c:RISK},{t:"형식을 안 정하면 매번 다른 모양으로 나오고, 모아 놓아도 비교가 안 됩니다."}],{after:70}));
K.push(rich([{t:"5. 한 번 만들고 안 고친다.  ",b:true,c:RISK},{t:"스킬은 완성품이 아니라 살아 있는 문서입니다. 현장에서 어긋나는 지점이 보이면 그때그때 고치십시오."}],{after:70}));

K.push(new Paragraph({children:[new PageBreak()]}));

// --- 7부 ---
K.push(h1("다음에 만들면 좋을 스킬","7부"));
K.push(p("영상 분석과 사이트 점검에서 드러난 필요를 우선순위대로 정리했습니다."));
K.push(table(
  ["우선순위","스킬 이름","무엇을 하나","왜 필요한가"],
  [
    ["1","hebron-supply-outreach","교회·업체 대상 맞춤 모집 메시지와 전화 스크립트 생성","영상에서 지적된 공급 부족. 업체 20곳은 마켓플레이스가 성립하지 않는 수치"],
    ["2","hebron-story-collect","환대 스토리 인터뷰 진행과 한·영 카드 작성","Trusted 등급의 유일한 근거. 페르소나 플레이스홀더 교체"],
    ["3","hebron-meta-audit","82개 도시 메타태그·구조화 데이터 전수 점검","훼더럴웨이 같은 복제 잔재를 찾아내 SEO 유입 확보"],
    ["4","hebron-partner-brief","World Relief 등 기관 대상 영문 제안서","기관 파트너십은 영문·기관 어휘가 필요한 별개 작업"],
    ["5","turabian-footnote-check","각주와 참고문헌 대조·형식 검증","MBTS 박사논문. 본문-각주 매칭 100%가 요구되는 반복 작업"]
  ],
  {w:[1080,2400,3000,3600],boldFirst:true}
));
K.push(caption("1번과 2번은 서로 맞물립니다. 공급자를 모으고(1), 그중 실제로 환대한 곳을 증언으로 확인해(2) Trusted로 올리는 순환입니다."));

K.push(new Paragraph({children:[new PageBreak()]}));
K.push(h1("용어 사전","부록"));
const terms = [
  ["스킬 (Skill)","반복되는 일의 처리 방법을 적어둔 문서. 저장해 두면 그 일이 생길 때 AI가 자동으로 꺼내 읽는다."],
  ["SKILL.md","스킬의 본문 파일. .md는 마크다운이라는 간단한 글쓰기 형식으로, 사실상 메모장 글과 같다."],
  ["열쇠말 (트리거)","스킬을 부르는 말. “파트너 심사해줘” 같은 실제 말투를 넣어야 잘 걸린다."],
  ["JSON","컴퓨터가 읽기 좋게 정리한 표 같은 것. 사람이 읽어도 항목과 값이 보인다."],
  ["draft / live","초안 / 공개. 도시 페이지는 항상 draft로 만들어지고, 사람이 확인해야 live가 된다."],
  ["레드플래그","걸리면 즉시 중단해야 하는 위험 신호. 파트너 심사에 8개를 정해 두었다."],
  ["PWA","앱스토어를 거치지 않고 웹 주소로 설치되는 앱. HebronGuide가 이 방식이다."],
  ["커넥터 (MCP)","AI가 외부 서비스(Gmail, 드라이브 등)에 연결되는 통로. 스킬과는 별개 개념이다."],
  ["아티팩트","대화 밖에서도 열리는 웹 문서. 오늘 만든 전략 로드맵이 이 형태다."],
  ["바이브 코딩","코드를 직접 쓰지 않고 대화로 소프트웨어를 만드는 방식."]
];
K.push(table(["용어","뜻"],terms,{w:[2400,7680],boldFirst:true}));

K.push(gap(300));
K.push(new Paragraph({
  border:{top:{style:BorderStyle.SINGLE,size:8,color:LINE,space:8}},
  spacing:{before:120,after:0,line:280},alignment:AlignmentType.CENTER,
  children:[new TextRun({text:"HebronGuide  ·  Hebron Platform LLC  ·  Hebronplatform@gmail.com",font:F,size:16,color:GREY})]
}));

/* ==================== BUILD ==================== */
const doc = new Document({
  numbering:{config:[{
    reference:"dash",
    levels:[{level:0,format:LevelFormat.BULLET,text:"–",alignment:AlignmentType.LEFT,
      style:{paragraph:{indent:{left:400,hanging:200}}}}]
  }]},
  sections:[{
    properties:{page:{size:{width:12240,height:15840},margin:{top:1080,right:1080,bottom:1080,left:1080}}},
    children:K
  }]
});

Packer.toBuffer(doc).then(buf=>{
  fs.writeFileSync(process.argv[2],buf);
  console.log("written: "+process.argv[2]);
});
