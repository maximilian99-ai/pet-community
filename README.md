# Pet Community 서비스 정보

🐾 반려동물 커뮤니티 플랫폼: 사용자가 반려동물의 일상을 기록하고 공유할 수 있는 소셜 네트워크 애플리케이션

## 테크 스택

### Frontend
- **Runtime**: Node.js 20.5.1
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand (클라이언트 상태), TanStack - React Query (서버 상태)
- **UI Library**: Chakra UI + Emotion/styled-components
- **Styling**: TailwindCSS (반응형)
- **Internationalization**: next-intl (다국어 지원: EN, KO, FR, DE, ES, NL, DA)
- **HTTP Client**: Axios
- **Testing**: Jest, Playwright

### Backend
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT
- **File Upload**: Multer + Cloudinary
- **Testing**: Jest

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL (Supabase 또는 로컬)
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway / Render
- **CI/CD**: GitHub Actions

## FSD 구조

```
pet-community/
├── backend/                      # Express API 서버
│   ├── src/
│   │   ├── index.ts             # 진입점
│   │   ├── routes/              # API 라우트
│   │   │   ├── auth.ts          # 인증 (회원가입, 로그인)
│   │   │   ├── profile.ts       # 프로필 & 반려동물
│   │   │   ├── post.ts          # 포스트 & 댓글
│   │   │   ├── log.ts           # 일지
│   │   │   └── recommendations.ts # 추천
│   │   ├── middleware/          # 미들웨어
│   │   │   └── auth.ts          # JWT 검증
│   │   ├── utils/               # 유틸리티
│   │   │   ├── jwt.ts           # JWT 생성/검증
│   │   │   └── prisma.ts        # DB 클라이언트
│   │   └── types/               # TypeScript 타입
│   ├── prisma/
│   │   ├── schema.prisma        # DB 스키마
│   │   └── seed.ts              # 샘플 데이터
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env
│
├── frontend/                     # Next.js 클라이언트
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root 레이아웃
│   │   │   ├── [locale]/
│   │   │   │   ├── layout.tsx    # Locale 레이아웃
│   │   │   │   ├── page.tsx      # 홈페이지
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── signup/
│   │   │   │   ├── profile/
│   │   │   │   ├── feed/
│   │   │   │   └── dashboard/
│   │   ├── components/           # React 컴포넌트
│   │   ├── store/                # Zustand 스토어
│   │   ├── hooks/                # 커스텀 훅
│   │   │   ├── usePost.ts        # 포스트 관련
│   │   │   ├── useProfile.ts     # 프로필 관련
│   │   │   └── useDashboard.ts   # 대시보드 관련
│   │   ├── api/                  # API 클라이언트
│   │   ├── types/                # TypeScript 타입
│   │   ├── utils/                # 유틸리티
│   │   ├── messages/             # 다국어 JSON
│   │   ├── i18n.ts               # i18n 설정
│   │   └── globals.css           # 전역 스타일
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── .env
│
├── docker-compose.yml            # Docker Compose 설정
└── .gitignore
```

## 데이터베이스 스키마

### Models
- **User**: 사용자 계정 (email, username, password, avatar, bio)
- **Pet**: 반려동물 (name, species, breed, age, image)
- **Log**: 반려동물 일지 (feeding, walk, health, play)
- **Post**: 커뮤니티 포스트 (title, content, image)
- **Comment**: 포스트 댓글
- **Like**: 포스트 좋아요
- **Badge**: 최고의 일지 배지 시스템

## API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보 (JWT 필수)

### 프로필
- `GET /api/profiles/:userId` - 사용자 프로필
- `PUT /api/profiles/me` - 프로필 수정 (JWT 필수)
- `GET /api/profiles/:userId/pets` - 사용자 반려동물
- `POST /api/profiles/me/pets` - 반려동물 추가 (JWT 필수)
- `PUT /api/profiles/me/pets/:petId` - 반려동물 수정 (JWT 필수)
- `DELETE /api/profiles/me/pets/:petId` - 반려동물 삭제 (JWT 필수)

### 포스트
- `GET /api/posts` - 피드 조회 (무한 스크롤 지원)
- `POST /api/posts` - 포스트 작성 (JWT 필수)
- `GET /api/posts/:postId` - 포스트 상세 조회
- `PUT /api/posts/:postId` - 포스트 수정 (JWT 필수)
- `DELETE /api/posts/:postId` - 포스트 삭제 (JWT 필수)
- `POST /api/posts/:postId/comments` - 댓글 작성 (JWT 필수)
- `POST /api/posts/:postId/likes` - 좋아요/취소 (JWT 필수)

### 일지
- `GET /api/logs/pet/:petId` - 반려동물 일지 조회
- `POST /api/logs` - 일지 생성 (JWT 필수)
- `PUT /api/logs/:logId` - 일지 수정 (JWT 필수)
- `DELETE /api/logs/:logId` - 일지 삭제 (JWT 필수)
- `GET /api/logs/pet/:petId/weekly-stats` - 주간 통계

## 로컬 개발 환경 설정

### 필수 사항
- Node.js 20.5.1 (nvm 사용)
- Docker & Docker Compose
- Git

```bash
# 저장소 복제
git clone <repository-url>
cd pet-community

# 환경 설정
cp .env.example .env

# Backend 초기화
cd backend
pnpm install
pnpm prisma:generate
pnpm prisma db push
pnpm prisma db seed
cd ..

# Frontend 초기화
cd frontend
pnpm install
cd ..

# 통합 개발 서버 시작
pnpm -r dev

# http://localhost:3000/en (또는 /ko, /fr 등)
```

### 테스트 계정
```
이메일: alice@example.com
비밀번호: password123

사용 가능한 사용자명: alice, bob, charlie
```

## 📊 서비스 개발 과정 요약

**주요 마일스톤**
1. 서비스 기획 및 FSD 구조 설계
2. Docker 환경 구축 및 포트 충돌 해결
3. npm → pnpm 마이그레이션
4. next-intl 버전 업그레이드 및 호환성 처리
5. 핵심 기능 구현 (인증, 프로필, 포스트)
6. 고급 기능 구현 (이미지, 댓글, 팔로우, 배지)
7. 이미지 업로드 최적화 및 대용량 처리
8. 다크모드, 다국어, 반응형 디자인 완성
9. 시드 데이터 설정 및 데이터 보안

## 개발 워크플로우

### 작업
```bash
pnpm -r dev         # 개발 서버 실행
pnpm -r test        # 테스트 실행
pnpm -r build       # 프로덕션 빌드
pnpm -r lint        # ESLint 검사
```

### 필수 계정 및 서비스
- GitHub 계정 (저장소 관리)
- Vercel 계정 (Frontend 배포)
- Railway 또는 Render 계정 (Backend 배포)
- PostgreSQL 데이터베이스 (Supabase 또는 Railway)
- Cloudinary 계정 (이미지 관리)

### 배포 순서
1. **Cloudinary 설정** - 이미지 업로드 서비스
2. **Backend 배포 (Railway)** - Express API 서버
3. **Frontend 배포 (Vercel)** - Next.js 애플리케이션
4. **CI/CD 자동화** - GitHub Actions 설정

### 배포 검증
```bash
# Backend 헬스 체크
curl https://pet-community-backend-prod.railway.app/health

# Frontend 확인
https://pet-community.vercel.app
```

---

## 🔒 보안 주의사항

### 필수 보안 조치
- [ ] JWT_SECRET 강력한 값으로 변경 (최소 32자, 무작위)
- [ ] Cloudinary API Secret은 절대 프론트엔드에 노출 금지
- [ ] 프로덕션 환경에서 CORS 설정 검토
- [ ] HTTPS 강제 (Vercel, Railway 기본 지원)
- [ ] 정기적으로 보안 패치 업데이트

### 환경 변수 관리
- 로컬: `.env` 파일 (`.gitignore`에 포함)
- 프로덕션: 플랫폼의 환경 변수 관리 기능 사용
- 절대 코드에 하드코딩하지 말 것

**일반적인 문제 해결**
- Backend 배포 실패: 빌드 로그 확인, `pnpm build` 테스트
- Frontend 배포 실패: 환경 변수 설정, 루트 디렉토리 설정 확인
- 포트 충돌: `lsof -i :5000` 명령어로 프로세스 확인
- 데이터베이스 연결: `DATABASE_URL` 형식 및 네트워크 권한 확인

---

## 성능 최적화

### Frontend
- Next.js 이미지 최적화 (`next/image`)
- 코드 스플리팅 및 레이지 로딩
- TanStack Query로 서버 상태 캐싱
- 무한 스크롤 구현

### Backend
- Prisma 쿼리 최적화
- 인덱스 설정 (email, username, userId)
- 페이지네이션 (limit/offset)
- 응답 압축 (gzip)

## 라이센스

MIT

---

**개발 완료일**: 2026년 1월 21일
**배포 준비 상태**: MVP 구현 완료, 배포 준비 완료