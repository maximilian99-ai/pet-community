#!/bin/bash

# Supabase PostgreSQL Database Restore Script
# Usage: ./restore-database.sh <backup_file>

set -e

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Pet Community Database Restore${NC}"
echo "=================================="

# 백업 파일 확인
if [ -z "$1" ]; then
    echo -e "${RED}❌ 백업 파일을 지정해주세요.${NC}"
    echo "사용법: ./restore-database.sh <backup_file>"
    echo ""
    echo "사용 가능한 백업 파일:"
    ls -lh ./backups/*.sql.gz 2>/dev/null || echo "백업 파일이 없습니다."
    exit 1
fi

BACKUP_FILE=$1

# 파일 존재 확인
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ 파일을 찾을 수 없습니다: $BACKUP_FILE${NC}"
    exit 1
fi

# DATABASE_URL 확인
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL 환경변수가 설정되지 않았습니다.${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  경고: 이 작업은 현재 데이터베이스를 덮어씁니다!${NC}"
read -p "계속하시겠습니까? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "복원이 취소되었습니다."
    exit 0
fi

# 압축 파일인 경우 압축 해제
if [[ $BACKUP_FILE == *.gz ]]; then
    echo -e "${GREEN}📦 압축 해제 중...${NC}"
    gunzip -k "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

echo -e "${GREEN}🔄 데이터베이스 복원 중...${NC}"
psql "$DATABASE_URL" -f "$BACKUP_FILE"

echo ""
echo -e "${GREEN}✅ 복원 완료!${NC}"
