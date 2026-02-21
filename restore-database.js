#!/usr/bin/env node

/**
 * PostgreSQL Database Restore Script (Node.js version)
 * 
 * 사용법:
 * - node restore-database.js <backup-file> [target-env]
 * 
 * 예시:
 * - node restore-database.js backups/pet_community_production_backup_*.sql.gz production
 * - node restore-database.js backups/pet_community_staging_backup_*.sql.gz staging
 * - node restore-database.js backups/pet_community_local_backup_*.sql.gz local
 * 
 * 이 스크립트는 다음 중 하나가 필요합니다:
 * 1. Docker (권장) - 자동으로 올바른 psql 버전 사용
 * 2. PostgreSQL 16+ 클라이언트 - brew install postgresql@16
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 색상 코드
const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
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

// 사용자 확인
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function restoreDatabase() {
  log('🔄 Pet Community Database Restore', 'blue');
  log('==================================', 'blue');
  console.log();

  // 백업 파일 확인
  const backupFile = process.argv[2];
  
  if (!backupFile) {
    log('❌ 백업 파일을 지정해주세요.', 'red');
    console.log();
    log('사용법:', 'yellow');
    log('  node restore-database.js <backup-file> [target-env]', 'yellow');
    console.log();
    log('예시:', 'yellow');
    log('  node restore-database.js backups/pet_community_production_backup_*.sql.gz production', 'yellow');
    log('  node restore-database.js backups/pet_community_staging_backup_*.sql.gz staging', 'yellow');
    console.log();
    log('사용 가능한 백업 파일:', 'blue');
    try {
      execSync('ls -lh backups/*.gz 2>/dev/null || echo "  백업 파일이 없습니다."', { stdio: 'inherit' });
    } catch {}
    process.exit(1);
  }

  // 파일 존재 확인
  if (!fs.existsSync(backupFile)) {
    log(`❌ 파일을 찾을 수 없습니다: ${backupFile}`, 'red');
    process.exit(1);
  }

  // 대상 환경 결정
  const targetEnv = process.argv[3] || 'production';
  let envFile;
  
  if (targetEnv === 'local') {
    envFile = path.join(__dirname, 'backend', '.env');
  } else if (targetEnv === 'staging') {
    envFile = path.join(__dirname, 'backend', '.env.staging');
  } else if (targetEnv === 'production') {
    envFile = path.join(__dirname, 'backend', '.env.production');
  } else {
    envFile = targetEnv;
  }

  if (!fs.existsSync(envFile)) {
    log(`❌ 환경 파일을 찾을 수 없습니다: ${envFile}`, 'red');
    process.exit(1);
  }

  log(`🎯 복원 대상: ${targetEnv} 환경`, 'blue');
  log(`📂 환경변수 로드: ${envFile}`, 'yellow');
  loadEnvFile(envFile);

  // DATABASE_URL 확인
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  
  if (!databaseUrl) {
    log('❌ DATABASE_URL 또는 DIRECT_URL 환경변수가 설정되지 않았습니다.', 'red');
    process.exit(1);
  }

  // 데이터베이스 정보 표시
  const url = new URL(databaseUrl);
  const dbHost = url.hostname;
  const dbName = url.pathname.slice(1);
  
  console.log();
  log('⚠️  경고: 이 작업은 현재 데이터베이스의 모든 데이터를 덮어씁니다!', 'yellow');
  console.log();
  log('복원 정보:', 'magenta');
  console.log(`  백업 파일: ${backupFile}`);
  console.log(`  대상 DB: ${dbHost}/${dbName}`);
  console.log(`  환경: ${targetEnv}`);
  console.log();

  const confirmed = await askConfirmation('계속하시겠습니까? (yes/no): ');
  
  if (!confirmed) {
    log('복원이 취소되었습니다.', 'yellow');
    process.exit(0);
  }

  console.log();

  // 압축 파일 처리
  let sqlFile = backupFile;
  if (backupFile.endsWith('.gz')) {
    log('📦 압축 해제 중...', 'yellow');
    sqlFile = backupFile.replace('.gz', '');
    
    try {
      execSync(`gunzip -k -f "${backupFile}"`, { stdio: 'inherit' });
      log('✅ 압축 해제 완료', 'green');
    } catch (error) {
      log('❌ 압축 해제 실패!', 'red');
      console.error(error.message);
      process.exit(1);
    }
  }

  try {
    log('🔄 데이터베이스 복원 중...', 'green');
    console.log();

    const dockerAvailable = isDockerAvailable();
    
    if (dockerAvailable) {
      // Docker 사용
      log('🐳 Docker를 사용하여 복원 중...', 'blue');
      
      const dbHost = url.hostname;
      const dbPort = url.port || '5432';
      const dbUser = url.username;
      const dbPassword = url.password;
      
      // Supabase는 PostgreSQL 17을 사용
      const postgresImage = dbHost.includes('supabase') ? 'postgres:17-alpine' : 'postgres:16-alpine';
      
      // SQL 파일을 컨테이너로 읽어들여서 실행
      const command = `docker run --rm -i \\
        -e PGPASSWORD="${dbPassword}" \\
        ${postgresImage} \\
        psql \\
        -h ${dbHost} \\
        -p ${dbPort} \\
        -U ${dbUser} \\
        -d ${dbName} \\
        < "${sqlFile}"`;
      
      execSync(command, {
        stdio: 'inherit',
        env: { ...process.env },
        shell: '/bin/bash'
      });
      
    } else {
      // 로컬 psql 사용
      log('💻 로컬 psql을 사용하여 복원 중...', 'blue');
      execSync(`psql "${databaseUrl}" -f "${sqlFile}"`, {
        stdio: 'inherit',
        env: { ...process.env }
      });
    }

    console.log();
    log('✅ 복원 완료!', 'green');
    console.log();
    log('💡 복원된 데이터 확인:', 'blue');
    log(`  psql "${databaseUrl}" -c "\\dt"`, 'blue');
    
    // 압축 해제한 임시 파일 삭제
    if (backupFile.endsWith('.gz') && sqlFile !== backupFile && fs.existsSync(sqlFile)) {
      log(`🗑️  임시 파일 삭제: ${sqlFile}`, 'yellow');
      fs.unlinkSync(sqlFile);
    }
    
  } catch (error) {
    log('❌ 복원 실패!', 'red');
    console.error(error.message);
    console.log();
    log('💡 문제 해결:', 'yellow');
    log('  1. Docker가 실행 중인지 확인하세요', 'yellow');
    log('  2. 데이터베이스 연결 정보가 올바른지 확인하세요', 'yellow');
    log('  3. 백업 파일이 손상되지 않았는지 확인하세요', 'yellow');
    
    // 압축 해제한 임시 파일 삭제
    if (backupFile.endsWith('.gz') && sqlFile !== backupFile && fs.existsSync(sqlFile)) {
      fs.unlinkSync(sqlFile);
    }
    
    process.exit(1);
  }
}

// 스크립트 실행
restoreDatabase();
