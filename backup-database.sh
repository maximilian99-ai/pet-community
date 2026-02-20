#!/bin/bash

# Supabase PostgreSQL Database Backup Script
# Usage: ./backup-database.sh

set -e

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  Pet Community Database Backup${NC}"
echo "=================================="

# 백업 디렉토리 생성
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# 타임스탬프 생성
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/pet_community_backup_$TIMESTAMP.sql"

# DATABASE_URL에서 연결 정보 추출
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL 환경변수가 설정되지 않았습니다.${NC}"
    echo "백엔드 .env 파일에서 DATABASE_URL을 확인하세요."
    exit 1
fi

echo -e "${GREEN}📍 백업 시작...${NC}"
echo "백업 파일: $BACKUP_FILE"

# pg_dump를 사용하여 public 스키마만 백업
pg_dump "$DATABASE_URL" \
    --schema=public \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    --verbose \
    --file="$BACKUP_FILE"

# 백업 파일 압축
echo -e "${GREEN}📦 백업 파일 압축 중...${NC}"
gzip "$BACKUP_FILE"

COMPRESSED_FILE="$BACKUP_FILE.gz"
FILE_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)

echo ""
echo -e "${GREEN}✅ 백업 완료!${NC}"
echo "파일: $COMPRESSED_FILE"
echo "크기: $FILE_SIZE"
echo ""
echo -e "${BLUE}💡 복원 방법:${NC}"
echo "gunzip $COMPRESSED_FILE"
echo "psql \$DATABASE_URL -f $BACKUP_FILE"
