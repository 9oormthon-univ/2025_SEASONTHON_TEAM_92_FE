# 월세의 정석 - 프론트엔드

월세 공동협약 네트워크 서비스의 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **Framework**: Next.js 15.3.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **UI Components**: Custom Components with Remix Icons

## 📋 주요 기능

- ✅ 회원가입/로그인 (JWT 인증)
- ✅ 위치 기반 실거주 인증 (GPS → 주소 변환)
- ✅ 거주 환경 진단 시스템 (10개 카테고리)
- ✅ 맞춤형 협상 리포트 생성
- ✅ 주간 미션 시스템
- ✅ 정책 정보 조회
- ✅ 공공 데이터 연동 (오피스텔 실거래가)
- ✅ 분쟁 해결 기관 정보

## 🛠️ 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# API 기본 URL 설정
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# 백엔드 서버 설정
# 로컬 개발: http://localhost:8080
# 프로덕션: https://2025seasonthonteam92be-production.up.railway.app
```

### 3. 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 🔧 백엔드 연동

### API 엔드포인트

- **회원 관리**: `/member/*`
- **진단 시스템**: `/api/v1/diagnosis/*`
- **리포트**: `/report/*`
- **주간 미션**: `/mission/weekly/*`
- **정책 정보**: `/api/policy/*`
- **공공 데이터**: `/api/officetel/*`

### 인증

JWT 토큰을 사용한 인증 시스템이 구현되어 있습니다.

- 로그인 시 JWT 토큰을 localStorage에 저장
- API 요청 시 Authorization 헤더에 토큰 자동 추가
- 토큰 만료 시 자동 로그아웃 및 로그인 페이지 리다이렉트

## 📁 프로젝트 구조

```
frontend-backup/
├── app/                    # Next.js App Router 페이지
│   ├── auth/              # 인증 관련 페이지
│   ├── dashboard/         # 대시보드
│   ├── diagnosis/         # 진단 시스템
│   ├── weekly-mission/    # 주간 미션
│   └── ...
├── components/            # 재사용 가능한 컴포넌트
├── lib/                   # 유틸리티 및 API 클라이언트
├── types/                 # TypeScript 타입 정의
└── ...
```

## 🎯 주요 수정 사항

### API 연동 개선
- 환경별 API URL 설정 수정
- 하드코딩된 URL 제거
- 백엔드 응답 구조에 맞는 데이터 처리

### 인증 시스템 개선
- JWT 토큰 처리 로직 수정
- 자동 로그아웃 및 리다이렉트 로직 개선
- 사용자 상태 관리 개선

### 에러 처리 개선
- 네트워크 에러 처리
- 서버 에러 처리
- 사용자 친화적 에러 메시지

## 🚀 배포

### 프로덕션 빌드

```bash
npm run build
```

### 환경 변수 설정

프로덕션 환경에서는 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_API_BASE_URL=https://2025seasonthonteam92be-production.up.railway.app
```

## 📞 지원

문제가 발생하거나 질문이 있으시면 개발팀에 문의해주세요.

---

**월세의 정석** - 공정한 월세를 위한 스마트한 협상 플랫폼