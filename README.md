# Pet Community 서비스 정보

🐾 반려동물 커뮤니티 플랫폼: 사용자가 반려동물의 일상을 기록하고 공유할 수 있는 소셜 네트워크 애플리케이션

## 📚 문서

- 🚀 [빠른 시작 (5분)](QUICKSTART.md) - **새로운 개발자는 여기서 시작하세요**
- 🔧 [개발 환경 설정](DEVELOPMENT.md) - 상세한 로컬 개발 환경 구축 가이드
- 📦 [배포 가이드](DEPLOYMENT.md) - Railway, Vercel, Supabase 배포 방법
- 🏗️ [시스템 아키텍처](ARCHITECTURE.md) - 기술 아키텍처 및 설계
- ✅ [배포 체크리스트](DEPLOYMENT_CHECKLIST.md) - 배포 전 최종 검증

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
- **UserFollow**: 사용자 팔로우 관계

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

### 추천
- `GET /api/recommendations` - 인기 포스트 추천
- `GET /api/recommendations/best` - 최고의 일지 배지 포스트
- `GET /api/recommendations/users` - 추천 사용자

## 로컬 개발 환경 설정

### 필수 사항
- Node.js 20.5.1 (nvm 사용)
- Docker & Docker Compose
- Git

### 1단계: 저장소 복제 및 환경 설정
```bash
cd pet-community

# .env 파일 생성
cp .env.example .env

# 기본 값 수정 (Cloudinary 토큰 등)
nano .env
```

### 2단계: Backend 초기화
```bash
cd backend

# npm 패키지 설치
npm install

# Prisma 클라이언트 생성
npm run prisma:generate

# (선택사항) 로컬 환경에서만 실행
# 데이터베이스 마이그레이션
npm run prisma:migrate

# 샘플 데이터 삽입
npm run prisma:seed

cd ..
```

### 3단계: Frontend 초기화
```bash
cd frontend

# npm 패키지 설치
npm install

cd ..
```

### 4단계: Docker Compose로 로컬 서버 실행
```bash
# PostgreSQL + Backend 실행
docker-compose up -d

# Backend 서버 준비 확인
# http://localhost:5000/health 방문
```

### 5단계: Frontend 개발 서버 실행
```bash
cd frontend
npm run dev

# http://localhost:3000/en (또는 http://localhost:3000/ko 등)
```

### 테스트 데이터
```
이메일: alice@example.com
비밀번호: password123

username: alice, bob, charlie
```

## 개발 워크플로우

### Backend 작업
```bash
cd backend
npm run dev          # 개발 서버 실행
npm test            # 테스트 실행
npm run build       # 프로덕션 빌드
```

### Frontend 작업
```bash
cd frontend
npm run dev          # 개발 서버 실행
npm test            # 테스트 실행
npm run build       # 프로덕션 빌드
```

## 배포 가이드

### Frontend (Vercel)
1. Vercel에 GitHub 계정 연동
2. 프로젝트 임포트
3. 환경 변수 설정 (.env 참고)
4. 자동 배포 활성화

### Backend (Railway 또는 Render)

#### Railway
1. railway.app에 로그인
2. 새 프로젝트 생성
3. PostgreSQL 데이터베이스 추가
4. GitHub 저장소 연동
5. Dockerfile 경로: `./backend/Dockerfile`

#### Render
1. render.com에 로그인
2. 웹 서비스 생성
3. GitHub 저장소 연동
4. 빌드 커맨드: `npm install && npm run prisma:generate && npm run build`
5. 시작 커맨드: `npm start`

### 환경 변수 (프로덕션)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=your-secure-random-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 기능 명세

### MVP (Minimum Viable Product)
- ✅ 사용자 회원가입/로그인 (JWT)
- ✅ 반려동물 프로필 관리 (등록, 수정, 삭제)
- ✅ 일지 기록 (식사, 산책, 건강 로그)
- ✅ 피드 및 포스트 공유
- ✅ 댓글 및 좋아요 기능
- ✅ 베스트 일지 배지 시스템
- ✅ 주간 건강 차트
- ✅ 다국어 지원 (7개 언어)
- ✅ 반응형 디자인 (모바일/태블릿/PC)

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

## 테스트

### Backend 테스트
```bash
cd backend
npm test                # 모든 테스트 실행
npm test -- --watch    # 감시 모드
```

### Frontend E2E 테스트
```bash
cd frontend
npm run test:e2e        # Playwright 테스트
```

## 보안

- ✅ JWT 토큰 기반 인증
- ✅ 비밀번호 해싱 (bcryptjs)
- ✅ CORS 설정
- ✅ SQL Injection 방지 (Prisma ORM)
- ✅ 환경 변수 보호

## 문제 해결

### "데이터베이스 연결 실패"
```bash
docker-compose down
docker-compose up -d
```

### "포트 이미 사용 중"
```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "모듈을 찾을 수 없음"
```bash
# 패키지 재설치
rm -rf node_modules package-lock.json
npm install
```

## 라이센스

MIT

## 문의

프로젝트 이슈나 제안은 GitHub Issues에서 제출해주세요.

---

**마지막 업데이트**: 2026년 1월 6일