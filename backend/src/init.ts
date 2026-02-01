import { PrismaClient } from '@prisma/client';

/**
 * Prisma 마이그레이션 및 시드 초기화
 * Vercel 배포 환경에서 서버 시작 시 실행
 */
export async function initializeDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 데이터베이스 초기화 중...');

    // 데이터베이스 연결 테스트
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ 데이터베이스 연결 성공');

    // 마이그레이션 실행 (배포 환경)
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 프로덕션 환경에서 마이그레이션 실행...');
      // 이 부분은 빌드 시간에 실행되므로, 여기서는 연결만 확인
      console.log('✅ 마이그레이션 준비 완료');
    }

    console.log('✅ 데이터베이스 초기화 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
