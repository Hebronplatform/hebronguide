# Admin Password Rotation — 관리자 비밀번호 회전 절차

> **목적**: HebronGuide 관리자 비밀번호를 안전하게 변경·회전하는 표준 절차
> **권장 주기**: 90일마다 1회 (계절 단위)
> **마지막 갱신**: 2026-04-30 v1.0

---

## 🔍 비밀번호 저장 구조 (이해하기)

```
┌─────────────────────────────────────────────┐
│  사용자 로그인 시도                          │
│  /admin → 비밀번호 입력                      │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│  Supabase Edge Function                     │
│  supabase/functions/server/index.tsx        │
│                                             │
│  1. KV에서 admin:password 조회              │
│  2. 있으면 → 그 값과 비교                    │
│  3. 없으면 → DEFAULT_PASSWORD ("hebron2025") │
│              과 비교                         │
└─────────────────────────────────────────────┘
            ↓
        일치? → 로그인 성공
        불일치 → 거부
```

**저장 위치**:
- **1순위 (운영)**: Supabase DB 테이블 `kv_store_21f2cd69`의 `key = admin:password`
- **2순위 (fallback)**: `supabase/functions/server/index.tsx` 내부 상수 `DEFAULT_PASSWORD`

**핵심**: 비밀번호를 한 번이라도 변경하면 → KV 저장값이 우선 → 옛날 `hebron2025`는 자동 무효.

---

## 🟢 표준 회전 절차 (정상 운영 중 90일마다)

### Step 1: 새 비밀번호 생성 (3분)

#### 1-1. 비밀번호 생성기 사용
- https://1password.com/password-generator/
- https://bitwarden.com/password-generator/

#### 1-2. 권장 설정
| 옵션 | 값 |
|------|-----|
| 길이 | **20자 이상** |
| 대문자 | ✅ |
| 소문자 | ✅ |
| 숫자 | ✅ |
| 특수문자 | ✅ |
| 모호한 문자 (l/I, 0/O) | ❌ |

#### 1-3. 생성된 비밀번호 안전 저장
- 1Password·Bitwarden·Apple Keychain 등 비밀번호 관리자
- 항목 이름: `HebronGuide Admin (Seattle)`

> ⚠️ **절대 X**: 이메일·카톡·문자·메모장·코드에 평문 저장

---

### Step 2: 현재 비밀번호로 로그인 (1분)

#### 2-1. 브라우저에서 관리자 페이지 접속
```
https://hebronguide.com/seattle/admin
```
(현재는 base path 마이그레이션 전이면 `https://hebronguide.com/admin`)

#### 2-2. 현재 비밀번호 입력
- 처음이면: `hebron2025` (기본값)
- 이미 변경한 적 있으면: 비밀번호 관리자에서 가져온 현재 값

---

### Step 3: 비밀번호 변경 UI 사용 (2분)

#### 3-1. Admin Dashboard에서 "Change Password" 클릭
- AdminPage.tsx 698행 부근의 ChangePasswordModal 호출
- 또는 우측 상단 메뉴

#### 3-2. 새 비밀번호 입력
- "Old Password": 현재 비밀번호
- "New Password": Step 1에서 만든 강한 비밀번호
- "Confirm New Password": 같은 값 한 번 더

#### 3-3. "Change Password" 버튼 클릭
- 성공 시 토스트 메시지: "Password changed! Remember your new password."
- KV에 새 비밀번호 저장됨 (`admin:password` 키)

---

### Step 4: 검증 (3분)

#### 4-1. 로그아웃
- "Logout" 클릭

#### 4-2. 새 비밀번호로 로그인
- 다시 `/admin` 접속
- 새 비밀번호 입력 → ✅ 성공

#### 4-3. 옛 비밀번호 차단 확인
- 로그아웃 후 다시 시도
- 옛 비밀번호(예: hebron2025) 입력 → ❌ "비밀번호가 일치하지 않습니다"

#### 4-4. 검증 완료 시
- 비밀번호 관리자에 변경 날짜 메모 추가
- 다음 회전 일정 캘린더 등록 (90일 후)

---

## 🚨 비상 시 절차 (비밀번호 분실·유출 의심)

### Case A: 비밀번호 분실 (관리자 본인)

#### Option 1: Supabase Dashboard 직접 초기화 (추천)
1. https://supabase.com 로그인
2. HebronGuide 프로젝트 선택
3. 좌측 메뉴 **Database → Tables → kv_store_21f2cd69**
4. `admin:password` 행 찾기
5. **삭제** → KV가 비어 있으면 자동으로 DEFAULT_PASSWORD(`hebron2025`)로 폴백
6. `/admin`에서 `hebron2025`로 로그인 → 즉시 새 비밀번호로 변경 (Step 3)

#### Option 2: Edge Function 코드 직접 수정 (마지막 수단)
1. `supabase/functions/server/index.tsx` line 8 의 DEFAULT_PASSWORD 값을 임시로 변경
2. Edge Function 재배포: `supabase functions deploy server`
3. 새 임시 값으로 로그인 → 즉시 정상 회전 (Step 3)
4. ⚠️ git commit에 임시 비밀번호 포함되지 않게 주의 → 즉시 정상 비밀번호로 회전 후 git revert 또는 amend

---

### Case B: 비밀번호 유출 의심

#### 즉시 조치 (5분 내)
1. **Supabase Dashboard에서 admin:password 키 삭제** (Case A Option 1)
2. **DEFAULT_PASSWORD 즉시 변경** (Edge Function 재배포)
3. 새 강한 비밀번호로 로그인 → 즉시 정상 회전
4. **로그 검토**: Supabase Logs에서 의심 로그인 활동 확인
5. **사역팀 보고**: 시애틀지구촌교회 새가족부에 알림 + 사용자 콘텐츠 변조 여부 점검

#### 추가 조치 (24시간 내)
- 모든 관리자가 동시에 새 비밀번호로 회전
- 사용자에게 *"관리자 비밀번호 보안 점검 완료"* 공지 (선택)
- `git log`로 옛 비밀번호 노출 commit 검토 → BFG Repo-Cleaner로 히스토리 정리

---

## 📅 회전 일정 (캘린더)

| 회전 날짜 | 사유 | 담당자 | 비고 |
|---------|------|------|------|
| 2026-04-30 | 초기 회전 (hebron2025 → 강한 비밀번호) | 폴 김 | Critical-1 보안 패치 |
| 2026-07-30 | 정기 회전 (90일) | 폴 김 | 자동 알림 권장 |
| 2026-10-30 | 정기 회전 (90일) | 폴 김 | |
| 2027-01-30 | 정기 회전 (90일) | 폴 김 | |

> 📌 Google Calendar 또는 iCloud Calendar에 분기별 알림 등록 권장

---

## 🛡 비밀번호 정책 (HebronGuide 표준)

### 강도 요구사항
- 최소 길이: **16자** (권장 20자)
- 문자 종류: 대문자 + 소문자 + 숫자 + 특수문자 모두 포함
- 사전 단어 사용 X (예: hebron, seattle, church, admin)
- 연도·교회명·사역자명 단순 결합 X
- 이전 5회 비밀번호 재사용 X

### 저장 방식
- 비밀번호 관리자 (1Password·Bitwarden·Apple Keychain)
- 종이에 적을 경우: 잠금 가능한 보관함에만
- 절대 X: 평문 메모·이메일·카톡·문자·코드·docx

### 공유 정책
- 1차 관리자 (폴 김) 외 공유 금지
- 비상 시 별도 관리자 추가는 *새 비밀번호 발급* 형태로만
- 절대 같은 비밀번호 두 사람 X

---

## 🔮 미래 개선 (Phase 2-3)

### 2026 Q3 — 다중 인증 (2FA)
- TOTP (Google Authenticator·Authy) 도입
- 비밀번호 + 6자리 코드 = 2단계
- Supabase Auth의 MFA 활용

### 2027 Q1 — Magic Link 로그인
- 비밀번호 대신 이메일 매직 링크
- gmc.hc300@gmail.com 으로 1회용 로그인 링크
- 비밀번호 자체 폐기 가능

### 2027 Q3 — Role-Based Access (RBAC)
- 슈퍼 관리자 (폴 김)
- 콘텐츠 관리자 (사역팀)
- 읽기 전용 (검수자)

---

## 📞 비상 연락처

- 폴 김 (1차 관리자): gmc.hc300@gmail.com
- Supabase 지원: https://supabase.com/support
- 시애틀지구촌교회 IT 사역팀: (배정 시 추가)

---

**문서 버전**: v1.0 (2026-04-30)
**다음 갱신**: 2-FA 도입 후 v2.0
**적용 도시**: 시애틀 (다른 도시 확장 시 도시별 사본 권장)
