import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env.production' });

// Routes
import authRoutes from '../src/routes/auth';
import profileRoutes from '../src/routes/profile';
import postRoutes from '../src/routes/post';
import logRoutes from '../src/routes/log';
import recommendationsRoutes from '../src/routes/recommendations';
import followsRoutes from '../src/routes/follows';

const app: Express = express();

// Middleware - 정확한 CORS 설정
const corsOrigins = [
  'http://localhost:3000',
  'https://pet-community-xi.vercel.app',
  process.env.FRONTEND_URL || '',
].filter((origin): origin is string => Boolean(origin));

const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 요청 로깅 미들웨어 (디버깅용)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Pet Community API is running' });
});

// API 라우터
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/follows', followsRoutes);

// 404 핸들러
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// 에러 처리 미들웨어
app.use((err: Error & { statusCode?: number }, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode ?? 500;
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
