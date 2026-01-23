import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Routes
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import postRoutes from './routes/post';
import logRoutes from './routes/log';
import recommendationsRoutes from './routes/recommendations';
import followsRoutes from './routes/follows';

const app: Express = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:3000', 'https://pet-community-xi.vercel.app']
);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Pet Community API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/follows', followsRoutes);

// Error handling middleware
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  if (stack) {
    console.error(stack);
  } else {
    console.error(err);
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? message : 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
