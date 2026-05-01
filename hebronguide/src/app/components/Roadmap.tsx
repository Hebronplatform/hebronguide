import React, { useState } from "react";

type Status = "done" | "inprogress" | "todo";

interface Task {
  text: string;
  status: Status;
  note?: string;
}

interface Phase {
  id: number;
  phase: string;
  title: string;
  color: string;
  accent: string;
  icon: string;
  deadline: string;
  tasks: Task[];
}

const statusLabel: Record<Status, { label: string; color: string }> = {
  done: { label: "완료", color: "#6EE7B7" },
  inprogress: { label: "진행중", color: "#C9A227" },
  todo: { label: "예정", color: "#64748b" },
};

const phases: Phase[] = [
  {
    id: 1,
    phase: "PHASE 1",
    title: "제품 완성 (Product Completion)",
    color: "#6EE7B7",
    accent: "rgba(110,231,183,0.08)",
    icon: "🛠",
    deadline: "~2주",
    tasks: [
      { text: "홈 탭 콘텐츠 완성 (히어로, 날씨, 빠른 링크)", status: "done" },
      { text: "가이드 탭 – 카테고리별 정착 정보 완성", status: "done", note: "주거·의료·교육·금융·교통 등" },
      { text: "커뮤니티 탭 – 게시판 or 자주 묻는 질문(FAQ)", status: "done" },
      { text: "지도 탭 – 시애틀 핵심 장소 핀 표시", status: "done" },
      { text: "관리자 페이지 – 콘텐츠 CRUD 완성", status: "done" },
      { text: "EN/KO 번역 문구 100% 완성", status: "done" },
      { text: "다국어 3개 이상 추가 (스페인어 ES 추가)", status: "done" },
      { text: "PWA manifest + Service Worker(오프라인 캐싱) 설정", status: "done" },
      { text: "모바일 UI/UX 전체 점검 (실기기 테스트)", status: "todo", note: "👤 목사님이 직접 스마트폰으로 확인 필요" },
    ],
  },
  {
    id: 2,
    phase: "PHASE 2",
    title: "배포 & 도메인 (Launch)",
    color: "#C9A227",
    accent: "rgba(201,162,39,0.08)",
    icon: "🚀",
    deadline: "~1주",
    tasks: [
      { text: "vercel.json SPA 라우팅 설정", status: "done" },
      { text: "GitHub 저장소 생성 및 코드 업로드", status: "inprogress", note: "👤 목사님: github.com → New Repository" },
      { text: "Vercel 계정 생성 및 GitHub 연동", status: "todo", note: "👤 목사님: vercel.com → Continue with GitHub" },
      { text: "Vercel 프로젝트 배포 (자동 CI/CD)", status: "todo" },
      { text: "HebronGuide.com 도메인 구매", status: "todo", note: "👤 Namecheap·GoDaddy·Cloudflare 추천" },
      { text: "Vercel에 커스텀 도메인 연결 + HTTPS 설정", status: "todo" },
      { text: "환경변수 Vercel에 등록 (SUPABASE_URL 등)", status: "todo" },
    ],
  },
  {
    id: 3,
    phase: "PHASE 3",
    title: "검색 & 신뢰 (SEO & Trust)",
    color: "#818cf8",
    accent: "rgba(129,140,248,0.08)",
    icon: "🔍",
    deadline: "~2주",
    tasks: [
      { text: "메타태그·OG태그·Twitter Card 설정", status: "todo" },
      { text: "sitemap.xml 생성 및 Google Search Console 등록", status: "todo" },
      { text: "robots.txt 설정", status: "todo" },
      { text: "Google Analytics 4 연동", status: "todo" },
      { text: "개인정보처리방침 페이지 작성", status: "todo", note: "글로벌 서비스 필수 (GDPR·CCPA)" },
      { text: "이용약관 페이지 작성", status: "todo" },
      { text: "Google Business Profile 등록", status: "todo" },
    ],
  },
  {
    id: 4,
    phase: "PHASE 4",
    title: "글로벌 비즈니스 (Business Setup)",
    color: "#f472b6",
    accent: "rgba(244,114,182,0.08)",
    icon: "🌐",
    deadline: "~1개월",
    tasks: [
      { text: "사업자 등록 (미국 LLC 또는 한국 법인)", status: "todo", note: "서비스 지역에 따라 결정" },
      { text: "비즈니스 이메일 설정 (hello@hebronguide.com)", status: "todo" },
      { text: "수익 모델 확정 (광고·구독·파트너십·프리미엄)", status: "todo" },
      { text: "결제 시스템 연동 (Stripe)", status: "todo", note: "프리미엄 기능 판매 시" },
      { text: "파트너 교회·단체 네트워크 구축", status: "todo" },
      { text: "한인 커뮤니티 SNS 채널 개설 (Instagram·YouTube·카카오)", status: "todo" },
      { text: "미국 내 세금·회계 담당자 선정", status: "todo" },
    ],
  },
  {
    id: 5,
    phase: "PHASE 5",
    title: "성장 & 확장 (Growth)",
    color: "#34d399",
    accent: "rgba(52,211,153,0.08)",
    icon: "📈",
    deadline: "지속",
    tasks: [
      { text: "시애틀 외 도시 확장 (LA·뉴욕·시카고·달라스)", status: "todo" },
      { text: "사용자 리뷰·별점 시스템 추가", status: "todo" },
      { text: "앱스토어 등록 (iOS App Store·Google Play)", status: "todo", note: "PWA → 네이티브 래퍼(Capacitor)" },
      { text: "유튜브/블로그 정착 콘텐츠 연동", status: "todo" },
      { text: "광고주·스폰서 영업 시작", status: "todo" },
      { text: "사용자 피드백 수집 및 정기 업데이트", status: "todo" },
      { text: "팀 채용 또는 프리랜서 협업 체계 구축", status: "todo" },
    ],
  },
];

const progressCount = (tasks: Task[]) => {
  const done = tasks.filter((t) => t.status === "done").length;
  const inprogress = tasks.filter((t) => t.status === "inprogress").length;
  return { done, inprogress, total: tasks.length };
};

function PhaseCard({ phase, expanded, onToggle }: { phase: Phase; expanded: boolean; onToggle: () => void }) {
  const { done, inprogress, total } = progressCount(phase.tasks);
  const pct = Math.round(((done + inprogress * 0.5) / total) * 100);

  return (
    <div
      style={{
        background: "#161b22",
        border: `1px solid ${expanded ? phase.color : "#21262d"}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: expanded ? phase.accent : "transparent",
          border: "none",
          cursor: "pointer",
          padding: "18px 20px",
          textAlign: "left",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>{phase.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: phase.color, letterSpacing: 1, fontFamily: "monospace" }}>
                {phase.phase}
              </span>
              <span style={{ fontSize: 11, color: "#64748b", background: "#0d1117", borderRadius: 4, padding: "1px 6px" }}>
                {phase.deadline}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e6edf3" }}>{phase.title}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: phase.color }}>{pct}%</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>완료</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 12, height: 4, background: "#21262d", borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${phase.color}, ${phase.color}99)`,
              borderRadius: 2,
              transition: "width 0.5s",
            }}
          />
        </div>
      </button>

      {/* Task List */}
      {expanded && (
        <div style={{ padding: "4px 20px 16px" }}>
          {phase.tasks.map((task, i) => {
            const s = statusLabel[task.status];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: i < phase.tasks.length - 1 ? "1px solid #21262d" : "none",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: s.color,
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: task.status === "done" ? "#64748b" : "#e6edf3", lineHeight: 1.5 }}>
                    {task.status === "done" ? <s>{task.text}</s> : task.text}
                  </div>
                  {task.note && (
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>↳ {task.note}</div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: s.color,
                    border: `1px solid ${s.color}44`,
                    borderRadius: 4,
                    padding: "1px 6px",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Roadmap() {
  const [expanded, setExpanded] = useState<number | null>(1);

  const allTasks = phases.flatMap((p) => p.tasks);
  const totalDone = allTasks.filter((t) => t.status === "done").length;
  const totalInProgress = allTasks.filter((t) => t.status === "inprogress").length;
  const totalTodo = allTasks.filter((t) => t.status === "todo").length;
  const totalPct = Math.round(((totalDone + totalInProgress * 0.5) / allTasks.length) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        paddingBottom: 80,
      }}
    >
      {/* Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #161b22 0%, #0d1117 100%)",
          borderBottom: "1px solid #21262d",
          padding: "32px 20px 24px",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>🗺</span>
            <div>
              <div style={{ fontSize: 11, color: "#C9A227", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
                HebronGuide.com
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#e6edf3", lineHeight: 1.2 }}>
                글로벌 론칭 로드맵
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 20, lineHeight: 1.6 }}>
            시애틀 정착 가이드 → 글로벌 이민자 플랫폼으로의 성장 계획
          </div>

          {/* Overall Progress */}
          <div style={{ background: "#161b22", borderRadius: 12, padding: "16px 18px", border: "1px solid #21262d" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#8b949e" }}>전체 진행률</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#C9A227" }}>{totalPct}%</span>
            </div>
            <div style={{ height: 6, background: "#21262d", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
              <div
                style={{
                  height: "100%",
                  width: `${totalPct}%`,
                  background: "linear-gradient(90deg, #C9A227, #6EE7B7)",
                  borderRadius: 3,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6EE7B7", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#8b949e" }}>완료 <strong style={{ color: "#e6edf3" }}>{totalDone}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C9A227", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#8b949e" }}>진행중 <strong style={{ color: "#e6edf3" }}>{totalInProgress}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#64748b", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#8b949e" }}>예정 <strong style={{ color: "#e6edf3" }}>{totalTodo}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Cards */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            expanded={expanded === phase.id}
            onToggle={() => setExpanded(expanded === phase.id ? null : phase.id)}
          />
        ))}

        {/* Key Principles */}
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 16, padding: "20px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e6edf3", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span>💡</span> 핵심 원칙
          </div>
          {[
            { icon: "🎯", title: "MVP 우선", desc: "완벽함보다 빠른 출시. 시장 반응을 먼저 확인한다." },
            { icon: "🤝", title: "커뮤니티 중심", desc: "교회·한인회·학교 네트워크가 최초 사용자 기반이다." },
            { icon: "🌍", title: "글로벌 스케일", desc: "시애틀에서 검증 → 미국 전역 → 글로벌 도시로 확장." },
            { icon: "🔒", title: "신뢰가 자산", desc: "개인정보·법적 컴플라이언스는 타협하지 않는다." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ textAlign: "center", fontSize: 11, color: "#464f59", padding: "8px 0" }}>
          마지막 업데이트: 2026년 4월 · HebronGuide Team
        </div>
      </div>
    </div>
  );
}