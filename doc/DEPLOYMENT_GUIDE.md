# Vercel 배포 가이드 (Vercel Deployment Guide)

이 프로젝트는 Vite(React) + Vercel Serverless Function(API) 구조로 되어 있어 **Vercel** 배포가 가장 적합합니다.

## 1. Vercel 배포 시작하기

1. [Vercel 대시보드](https://vercel.com/dashboard)에 접속합니다.
2. **"Add New..."** -> **"Project"** 버튼을 클릭합니다.
3. **"Import Git Repository"**에서 이 프로젝트의 GitHub 리포지토리(`gajaauction.com`)를 선택하고 **Import**를 누릅니다.

## 1-2. 프로젝트 설정 (Project Configuration)

* **Framework Preset**: `Vite`가 자동으로 선택되어야 합니다.
* **Root Directory**: `./` (기본값 유지)

## 2. ⚠️ 중요: 환경 변수 설정 (Environment Variables)

배포 설정 화면의 **"Environment Variables"** 섹션을 열고, 다음 5개의 값을 하나씩 추가합니다. (로컬 `.env` 파일 내용은 보안상 자동 업로드되지 않으므로 직접 입력해야 합니다.)

| Key (변수명) | Value (값) | 용도 |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | `sk-...` (OpenAI 키) | 챗봇 AI 답변 생성 |
| `VITE_SUPABASE_URL` | `https://...supabase.co` | 프론트엔드 DB 연결 |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (Anon Key) | 프론트엔드 DB 연결 |
| `SUPABASE_URL` | `https://...supabase.co` | 백엔드 API DB 연결 |
| `SUPABASE_KEY` | `eyJ...` (Anon Key) | 백엔드 API DB 연결 |

> **참고**: `VITE_...` 변수와 `SUPABASE_...` 변수의 값은 동일하게 입력하시면 됩니다. 백엔드와 프론트엔드 둘 다 접근하기 위해 중복 설정합니다.

## 3. 배포 완료 (Deploy)

* 모든 설정을 마쳤으면 **"Deploy"** 버튼을 클릭합니다.
* 1~2분 정도 기다리면 배포가 완료되고, 제공된 도메인(예: `gaja-auction-app.vercel.app`)으로 접속할 수 있습니다.

## 4. 배포 후 할 일

1. **챗봇 테스트**: 우측 하단 챗봇 아이콘을 눌러 대화가 정상적으로 되는지 확인합니다.
2. **리드 수집 테스트**: 대화 중 연락처를 입력하고, `/admin/leads` 페이지에서 데이터가 들어왔는지 확인합니다.
3. **이미지/스타일 확인**: 사이트가 깨지지 않고 잘 나오는지 확인합니다.

---

## 5. 유지보수 (데이터 수정)

* **매물/파트너 데이터 수정**: 코드를 수정할 필요 없이 [Supabase 대시보드](https://supabase.com/dashboard)의 Table Editor에서 데이터를 직접 수정하면 웹사이트에 즉시 반영됩니다.
* **코드 수정**: 로컬에서 코드를 수정하고 `git push`를 하면 Vercel이 자동으로 감지하여 재배포합니다.
