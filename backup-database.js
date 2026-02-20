#!/usr/bin/env node

/**
 * Supabase PostgreSQL Database Backup Script (Node.js version)
 * 
 * 사용법:
 * - node backup-database.js                    → 운영 DB 백업 (.env.production)
 * - node backup-database.js local              → 로컬 DB 백업 (.env)
 * - node backup-database.js staging            → 스테이징 DB 백업 (.env.staging)
 * - node backup-database.js backend/.env.test  → 직접 파일 경로 지정
 * 
 * 이 스크립트는 다음 중 하나가 필요합니다:
 * 1. Docker (권장) - 자동으로 올바른 pg_dump 버전 사용
 * 2. PostgreSQL 16+ 클라이언트 - brew install postgresql@16
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// .env 파일 로드 함수
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
  });
  
  return true;
}

// Docker 사용 가능 여부 확인
function isDockerAvailable() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// pg_dump 버전 확인
function getPgDumpVersion() {
  try {
    const version = execSync('pg_dump --version', { encoding: 'utf8' });
    const match = version.match(/(\d+)\./);
    return match ? parseInt(match[1]) : 0;
  } catch {
    return 0;
  }
}

async function backupDatabase() {
  log('🗄️  Pet Community Database Backup', 'blue');
  log('==================================', 'blue');
  console.log();

  // 환경 파일 결정
  const arg = process.argv[2];
  let envFile;
  let envName = 'production';
  
  if (!arg) {
    // 기본값: production
    envFile = path.join(__dirname, 'backend', '.env.production');
    envName = 'production';
  } else if (arg === 'local') {
    envFile = path.join(__dirname, 'backend', '.env');
    envName = 'local';
  } else if (arg === 'staging') {
    envFile = path.join(__dirname, 'backend', '.env.staging');
    envName = 'staging';
  } else if (arg === 'production') {
    envFile = path.join(__dirname, 'backend', '.env.production');
    envName = 'production';
  } else {
    // 직접 파일 경로 지정
    envFile = arg;
    envName = path.basename(arg);
  }
  
  log(`🎯 백업 대상: ${envName} 환경`, 'blue');
  
  if (!fs.existsSync(envFile)) {
    log(`❌ 환경 파일을 찾을 수 없습니다: ${envFile}`, 'red');
    console.log();
    log('💡 사용 가능한 명령어:', 'yellow');
    log('  node backup-database.js              → production DB (기본값)', 'yellow');
    log('  node backup-database.js local         → 로컬 DB', 'yellow');
    log('  node backup-database.js staging       → staging DB', 'yellow');
    log('  node backup-database.js production    → production DB', 'yellow');
    process.exit(1);
  }
  
  log(`📂 환경변수 로드 중: ${envFile}`, 'yellow');
  loadEnvFile(envFile);

  // DATABASE_URL 확인
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  
  if (!databaseUrl) {
    log('❌ DATABASE_URL 또는 DIRECT_URL 환경변수가 설정되지 않았습니다.', 'red');
    log(`backend/.env 파일을 확인하세요: ${envFile}`, 'yellow');
    process.exit(1);
  }

  // 백업 디렉토리 생성
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 타임스탬프 생성
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = path.join(backupDir, `pet_community_${envName}_backup_${timestamp}.sql`);

  try {
    log('📍 백업 시작...', 'green');
    console.log(`백업 파일: ${backupFile}`);
    console.log();

    const dockerAvailable = isDockerAvailable();
    const pgDumpVersion = getPgDumpVersion();
    
    let command;
    
    if (dockerAvailable) {
      // Docker 사용 (권장)
      log('🐳 Docker를 사용하여 백업 중...', 'blue');
      
      // DATABASE_URL 파싱
      const url = new URL(databaseUrl);
      const dbHost = url.hostname === 'localhost' ? 'host.docker.internal' : url.hostname;
      const dbName = url.pathname.slice(1);
      const dbUser = url.username;
      const dbPassword = url.password;
      const dbPort = url.port || '5432';
      
      // Supabase는 PostgreSQL 17을 사용하므로 최신 버전 사용
      const postgresImage = dbHost.includes('supabase') ? 'postgres:17-alpine' : 'postgres:16-alpine';
      
      command = `docker run --rm \\
        -e PGPASSWORD="${dbPassword}" \\
        ${postgresImage} \\
        pg_dump \\
        -h ${dbHost} \\
        -p ${dbPort} \\
        -U ${dbUser} \\
        -d ${dbName} \\
        --schema=public \\
        --no-owner \\
        --no-acl \\
        --clean \\
        --if-exists > "${backupFile}"`;
      
    } else if (pgDumpVersion >= 15) {
      // 로컬 pg_dump 사용 (버전 15 이상)
      log('💻 로컬 pg_dump를 사용하여 백업 중...', 'blue');
      command = `pg_dump "${databaseUrl}" --schema=public --no-owner --no-acl --clean --if-exists > "${backupFile}"`;
      
    } else {
      log('❌ 백업 도구를 찾을 수 없습니다.', 'red');
      console.log();
      log('다음 중 하나를 설치하세요:', 'yellow');
      log('  1. Docker (권장): https://www.docker.com/products/docker-desktop', 'yellow');
      log('  2. PostgreSQL 16+: brew install postgresql@16', 'yellow');
      console.log();
      log(`현재 pg_dump 버전: ${pgDumpVersion || '설치되지 않음'}`, 'yellow');
      process.exit(1);
    }
    
    execSync(command, {
      stdio: 'inherit',
      env: { ...process.env },
      shell: '/bin/bash'
    });

    // 파일 크기 확인
    const stats = fs.statSync(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log();
    log('✅ 백업 완료!', 'green');
    console.log(`파일: ${backupFile}`);
    console.log(`크기: ${fileSizeMB} MB`);
    console.log();
    
    // 압축
    log('📦 백업 파일 압축 중...', 'yellow');
    execSync(`gzip "${backupFile}"`, { stdio: 'inherit' });
    
    const compressedFile = `${backupFile}.gz`;
    const compressedStats = fs.statSync(compressedFile);
    const compressedSizeMB = (compressedStats.size / (1024 * 1024)).toFixed(2);
    
    console.log();
    log('✅ 압축 완료!', 'green');
    console.log(`파일: ${compressedFile}`);
    console.log(`크기: ${compressedSizeMB} MB`);
    console.log();
    
    log('💡 복원 방법:', 'blue');
    console.log(`  gunzip ${compressedFile}`);
    console.log(`  psql $DATABASE_URL -f ${backupFile}`);
    console.log();
    
    log('또는 복원 스크립트 사용:', 'blue');
    console.log(`  ./restore-database.sh ${compressedFile}`);
    
  } catch (error) {
    log('❌ 백업 실패!', 'red');
    console.error(error.message);
    console.log();
    log('💡 문제 해결:', 'yellow');
    log('  1. Docker가 실행 중인지 확인하세요', 'yellow');
    log('  2. 또는 PostgreSQL 16+ 설치: brew install postgresql@16', 'yellow');
    log('  3. 데이터베이스 연결 정보가 올바른지 확인하세요', 'yellow');
    process.exit(1);
  }
}

// 스크립트 실행
backupDatabase();
