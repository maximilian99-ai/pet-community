#!/bin/bash

# Pet-Community 배포 전 검사 스크립트
# 사용: bash deploy-check.sh

set -e

echo "🔍 Pet-Community 배포 전 검사 시작..."
echo "=========================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 검사 함수
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 존재"
    return 0
  else
    echo -e "${RED}✗${NC} $1 없음"
    return 1
  fi
}

check_command() {
  if command -v $1 &> /dev/null; then
    echo -e "${GREEN}✓${NC} $1 설치됨"
    return 0
  else
    echo -e "${RED}✗${NC} $1 미설치"
    return 1
  fi
}

# 1️⃣ 필수 도구 확인
echo "📦 필수 도구 확인"
echo "----------------------------------------"
check_command node
check_command npm
check_command git
echo ""

# 2️⃣ Backend 확인
echo "🔧 Backend 점검"
echo "----------------------------------------"
echo "Backend 파일 구조:"
check_file "backend/package.json"
check_file "backend/vercel.json"
check_file "backend/src/index.ts"
check_file "backend/api/index.ts"
check_file "backend/tsconfig.json"
check_file "backend/prisma/schema.prisma"
echo ""

echo "Backend 환경변수:"
if [ -f "backend/.env.production" ]; then
  echo -e "${GREEN}✓${NC} backend/.env.production 존재"
  if grep -q "DATABASE_URL" backend/.env.production; then
    echo -e "${GREEN}✓${NC} DATABASE_URL 설정됨"
  else
    echo -e "${RED}✗${NC} DATABASE_URL 미설정"
  fi
else
  echo -e "${YELLOW}⚠${NC} backend/.env.production 없음 (배포 시 Vercel에서 설정)"
fi
echo ""

# 3️⃣ Frontend 확인
echo "🎨 Frontend 점검"
echo "----------------------------------------"
echo "Frontend 파일 구조:"
check_file "frontend/package.json"
check_file "frontend/vercel.json"
check_file "frontend/next.config.js"
check_file "frontend/tsconfig.json"
echo ""

echo "Frontend 환경변수:"
if [ -f "frontend/.env.production" ]; then
  echo -e "${GREEN}✓${NC} frontend/.env.production 존재"
  if grep -q "NEXT_PUBLIC_API_URL" frontend/.env.production; then
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_API_URL 설정됨"
  else
    echo -e "${RED}✗${NC} NEXT_PUBLIC_API_URL 미설정"
  fi
else
  echo -e "${YELLOW}⚠${NC} frontend/.env.production 없음 (배포 시 Vercel에서 설정)"
fi
echo ""

# 4️⃣ Build 테스트
echo "🏗️  Build 테스트"
echo "----------------------------------------"

echo "Backend build 테스트..."
cd backend
if npm run build &> /dev/null; then
  echo -e "${GREEN}✓${NC} Backend build 성공"
else
  echo -e "${RED}✗${NC} Backend build 실패"
  echo "  → npm run build 로그 확인"
fi
cd ..
echo ""

echo "Frontend build 테스트..."
cd frontend
if npm run build &> /dev/null; then
  echo -e "${GREEN}✓${NC} Frontend build 성공"
else
  echo -e "${RED}✗${NC} Frontend build 실패"
  echo "  → npm run build 로그 확인"
fi
cd ..
echo ""

# 5️⃣ Prisma 확인
echo "🗄️  Prisma 확인"
echo "----------------------------------------"
cd backend
if npx prisma generate &> /dev/null; then
  echo -e "${GREEN}✓${NC} Prisma generate 성공"
else
  echo -e "${RED}✗${NC} Prisma generate 실패"
  echo "  → DATABASE_URL 확인 필요"
fi
cd ..
echo ""

# 6️⃣ Git 상태 확인
echo "📝 Git 상태 확인"
echo "----------------------------------------"
if git status | grep -q ".env"; then
  echo -e "${RED}✗${NC} .env 파일이 Git에 추적되고 있음 (보안 위험)"
  echo "  → git rm --cached .env 실행"
else
  echo -e "${GREEN}✓${NC} .env 파일이 .gitignore에서 제외됨"
fi

if git diff --quiet HEAD; then
  echo -e "${GREEN}✓${NC} 커밋할 변경사항 없음 (또는 모두 커밋됨)"
else
  echo -e "${YELLOW}⚠${NC} 커밋하지 않은 변경사항 있음"
  echo "  → git status 확인"
fi
echo ""

# 7️⃣ 최종 점검
echo "✅ 배포 전 최종 체크리스트"
echo "----------------------------------------"
echo "다음 사항 확인:"
echo "[ ] Vercel Backend 프로젝트에서 Environment Variables 설정:"
echo "    - NODE_ENV = production"
echo "    - DATABASE_URL = (PostgreSQL URL)"
echo "    - JWT_SECRET = (보안 토큰)"
echo "    - FRONTEND_URL = (Frontend 배포 URL)"
echo ""
echo "[ ] Vercel Frontend 프로젝트에서 Environment Variables 설정:"
echo "    - NEXT_PUBLIC_API_URL = https://pet-community-express-server.vercel.app/api"
echo "    - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = (Cloudinary 이름)"
echo ""
echo "[ ] Git 커밋 및 푸시 완료"
echo "[ ] Vercel Dashboard에서 배포 시작 감시"
echo ""

echo "=========================================="
echo -e "${GREEN}✓ 검사 완료!${NC}"
echo ""
echo "배포 진행:"
echo "1. git add ."
echo "2. git commit -m 'chore: deployment optimization'"
echo "3. git push"
echo "4. Vercel Dashboard에서 배포 확인"
echo ""
