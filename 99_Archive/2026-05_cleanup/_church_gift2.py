import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
tsx = r'C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide\hebronguide\src\app\components\HebronGuide.tsx'
c = open(tsx, encoding='utf-8', errors='replace').read()

start_marker = '        {/* ── TAB 5: 허브교회 네트워크 ── */}'
end_marker = "          </div>\n        )}\n"

start_idx = c.find(start_marker)
end_idx = c.find(end_marker, start_idx) + len(end_marker)
old_section = c[start_idx:end_idx]

new_section = '''        {/* ── TAB 5: 허브교회 네트워크 ── */}
        {sub === 4 && (
          <div style={{ paddingBottom: 8 }}>

            {/* 선물 카드 */}
            <div style={{ background: "linear-gradient(160deg, rgba(201,162,39,0.12) 0%, rgba(0,0,0,0) 100%)", border: "1px solid rgba(201,162,39,0.28)", borderRadius: 18, padding: "20px 18px", marginBottom: 12 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(201,162,39,0.75)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                🎁 {lang === "ko" ? "HebronGuide로부터 드리는 선물" : "A Gift from HebronGuide"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 16, color: "#ECFDF5", lineHeight: 1.5, marginBottom: 10 }}>
                {lang === "ko"
                  ? "목사님 교회를 HebronGuide에 등재해 드리고 싶습니다.\\n받아 주시면 감사하겠습니다."
                  : "We would love to list your church on HebronGuide.\\nWe offer this as a gift — we would be honored if you accepted."}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.55)", lineHeight: 1.8, fontStyle: "italic", marginBottom: 14 }}>
                {lang === "ko"
                  ? "\\"내가 나그네 되었을 때 너희가 영접하였다\\" — 마태복음 25:35"
                  : "\\"I was a stranger and you welcomed me.\\" — Matthew 25:35"}
              </div>
              {[
                { icon: "🔥", ko: "영혼구원에 갈급함과 목마름이 있는 교회", en: "A church with a hunger and thirst for souls" },
                { icon: "🤝", ko: "이민자 한 영혼을 삶으로 환영하는 목자의 마음", en: "A shepherd\\'s heart that welcomes each immigrant" },
                { icon: "🕊️", ko: "숫자가 아닌 한 사람을 향한 순수한 사명", en: "A pure calling for one person, not for numbers" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 2 ? 9 : 0 }}>
                  <span style={{ fontSize: 13, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, color: "rgba(236,253,245,0.8)", lineHeight: 1.6 }}>
                    {lang === "ko" ? item.ko : item.en}
                  </div>
                </div>
              ))}
            </div>

            {/* 프로모션 */}
            <div style={{ background: "rgba(110,231,183,0.07)", border: "1px solid rgba(110,231,183,0.2)", borderRadius: 12, padding: "11px 15px", marginBottom: 12 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(110,231,183,0.85)", lineHeight: 1.7 }}>
                🌿 {lang === "ko"
                  ? "2026년 10월 1일까지 이 선물을 받아 주신 교회는 무상으로 등재해 드립니다."
                  : "Churches that receive this gift by October 1, 2026 will be listed at no charge."}
              </div>
            </div>

            {/* 전달 요청 */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "16px", marginBottom: 12 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#ECFDF5", marginBottom: 8 }}>
                {lang === "ko" ? "한 가지 부탁이 있습니다" : "One Small Request"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, color: "rgba(236,253,245,0.7)", lineHeight: 1.85, marginBottom: 14 }}>
                {lang === "ko"
                  ? "목사님 주변에 영혼구원에 진심인 교회가 있다면,\\n이 선물을 3곳 이상의 교회에 전달해 주시겠습니까?\\n버튼 하나로 쉽게 전달하실 수 있습니다."
                  : "If you know 3 or more churches around you with a genuine heart for souls,\\nwould you pass this gift along to them?\\nJust tap a button below — it takes seconds."}
              </div>
              {/* 공유 버튼들 */}
              {(() => {
                const ko = lang === "ko";
                const shareTitle = ko ? "HebronGuide 교회 등재 — 선물 드립니다" : "A Gift: Free Church Listing on HebronGuide";
                const shareBody = ko
                  ? "목사님, 안녕하세요.\\n\\n전 세계 54개 도시 한인 이민자 정착 앱 HebronGuide가\\n교회 등재를 선물로 드립니다.\\n\\n영혼구원에 갈급한 교회라면 받아 주세요.\\n2026년 10월 1일까지 무상 등재.\\n\\n주변에 영혼구원에 진심인 교회가 있다면\\n이 초청을 함께 전달해 주세요.\\n\\nhebronguide.com\\nhebronplatform@gmail.com\\n\\n마 25:35 \\"내가 나그네 되었을 때 너희가 영접하였다\\""
                  : "Hello Pastor,\\n\\nHebronGuide — the Korean immigrant settlement app in 54 cities worldwide — offers your church a free listing as a gift.\\n\\nIf your church has a heart for souls, please accept.\\nFree listing until October 1, 2026.\\n\\nPlease also pass this to 3+ churches you know have a genuine heart for souls.\\n\\nhebronguide.com\\nhebronplatform@gmail.com\\n\\nMatt 25:35 — \\"I was a stranger and you welcomed me.\\"";
                const shareUrl = "https://hebronguide.com";
                const encodedMsg = encodeURIComponent(shareBody + "\\n\\n" + shareUrl);
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {typeof navigator !== "undefined" && (navigator as any).share ? (
                      <button
                        onClick={() => { (navigator as any).share({ title: shareTitle, text: shareBody, url: shareUrl }).catch(() => {}); }}
                        style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #FEE500, #FFD600)", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#3C1E1E", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        📲 {ko ? "카카오·문자·SNS로 전달하기" : "Share via KakaoTalk · Text · SNS"}
                      </button>
                    ) : (
                      <a href={`https://wa.me/?text=${encodedMsg}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <div style={{ width: "100%", padding: "13px", background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 12, fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 13, color: "#25D366", textAlign: "center" }}>
                          💬 WhatsApp {ko ? "으로 전달" : "Forward"}
                        </div>
                      </a>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <a href={`https://wa.me/?text=${encodedMsg}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: 1 }}>
                        <div style={{ padding: "11px 8px", background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.25)", borderRadius: 10, fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#25D366", textAlign: "center" }}>
                          💬 WhatsApp
                        </div>
                      </a>
                      <a href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodedMsg}`} style={{ textDecoration: "none", flex: 1 }}>
                        <div style={{ padding: "11px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "rgba(236,253,245,0.75)", textAlign: "center" }}>
                          ✉️ {ko ? "이메일" : "Email"}
                        </div>
                      </a>
                      <button
                        onClick={() => { navigator.clipboard.writeText(shareBody + "\\n\\n" + shareUrl).then(() => alert(ko ? "복사됐습니다. 붙여넣기로 전달해 주세요." : "Copied! Paste anywhere to share.")); }}
                        style={{ flex: 1, padding: "11px 8px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, cursor: "pointer", fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 12, color: "rgba(236,253,245,0.45)", textAlign: "center" }}>
                        📋 {ko ? "복사" : "Copy"}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 등재 신청 */}
            <a href={`mailto:hebronplatform@gmail.com?subject=${encodeURIComponent(
              lang === "ko" ? "[HebronGuide] 교회 등재 선물 감사히 받겠습니다" : "[HebronGuide] Accepting the Church Listing Gift"
            )}&body=${encodeURIComponent(
              lang === "ko"
                ? "안녕하세요. {교회명} 담임목사 {성함}입니다.\\nHebronGuide의 선물에 감사드리며 기꺼이 받겠습니다.\\n\\n— 교회명:\\n— 담임목사:\\n— 도시 / 주:\\n— 교단 / 소속:\\n— 교회 웹사이트:\\n— 연락처 (이메일 / 전화):\\n\\n마 25:35 \\"내가 나그네 되었을 때 너희가 영접하였다\\"\\nhebronguide.com"
                : "Hello. I am {Pastor Name}, lead pastor of {Church Name}.\\nWe gratefully accept HebronGuide\\'s gift.\\n\\n— Church Name:\\n— Lead Pastor:\\n— City / State:\\n— Denomination:\\n— Website:\\n— Contact (email / phone):\\n\\nMatt 25:35 — \\"I was a stranger and you welcomed me.\\"\\nhebronguide.com"
            )}`} style={{ display: "block", textDecoration: "none" }}>
              <div style={{ background: "linear-gradient(135deg, #C9A227, #B8901C)", borderRadius: 14, padding: "14px 20px", textAlign: "center", boxShadow: "0 4px 16px rgba(201,162,39,0.28)" }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 3 }}>
                  🎁 {lang === "ko" ? "선물 감사히 받겠습니다 →" : "We Gratefully Accept This Gift →"}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                  hebronplatform@gmail.com · {lang === "ko" ? "1-2주 내 연락드립니다" : "We'll be in touch within 1-2 weeks"}
                </div>
              </div>
            </a>

          </div>
        )}
'''

if old_section in c:
    c = c.replace(old_section, new_section, 1)
    open(tsx, 'w', encoding='utf-8').write(c)
    print('SUCCESS')
else:
    print('NOT FOUND - trying partial match')
    print('Old section length:', len(old_section))
    print('Old section start:', repr(old_section[:100]))
