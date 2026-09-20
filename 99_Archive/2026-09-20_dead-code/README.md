# 2026-09-20 — 죽은 코드 정리

## 왜 내렸나

`make-server-21f2cd69` 는 2026-05-01 앱 첫 배포 때 스캐폴드로 딸려 들어온
Supabase Edge Function 이다. **한 번도 배포된 적이 없다** — 이날 확인했을 때
`https://vextxqzggznulwpganwt.supabase.co/functions/v1/make-server-21f2cd69/health`
가 HTTP 404 를 돌려줬다.

그 안에 `DEFAULT_PASSWORD = "hebron2025"` 가 들어 있어서 자가 점검기가
매번 「치명」으로 잡았는데, **열리지 않는 문의 열쇠**였다. 위험은 아니지만
죽은 짐이고, 진짜 위험과 섞여 보이면 진짜를 놓치게 된다.

| 내린 것 | 왜 |
|---|---|
| `supabase-edge-functions/` | 배포된 적 없음. hebron2025 가 여기 |
| `AdminPage.tsx` | 그 죽은 함수만 부르던 화면. 앱의 `/admin` 경로에 붙어 있었다 |
| `admin-community.html` | 같음 |
| `ADMIN_PASSWORD_ROTATION.md` | 그 죽은 체계의 설명서. 어디서도 참조되지 않았다 |
| `admin-churches.html` | 없는 테이블(`church_partners`)을 읽던 CRM. admin.html 교회 탭이 정본 |

## 되살리려면

전부 git 기록에 남아 있다. 이 폴더에서 원래 자리로 옮기면 그대로 돌아온다.
다만 되살리기 전에 **그 서버 기능부터 있는지** 확인할 것.

## 함께 한 일

- 앱의 `/admin` 경로 제거 (routes.tsx) — 열리지만 아무것도 안 되던 주소였다
- `Ad/HebronGuide-promo-{ko,en,es}.png` 제거 — `hebronguide/public/` 에 같은 파일이 있다
- `hebronguide-home.standalone.html` (14MB) → `_local/archive/` — git 밖으로
