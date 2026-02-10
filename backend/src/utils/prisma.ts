import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client to prevent connection issues in serverless
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Optimize for Vercel serverless with connection pooling
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Connection pooling settings for serverless environments
prisma.$connect().catch((err) => {
  console.error('Failed to connect to database:', err);
});

export default prisma;
