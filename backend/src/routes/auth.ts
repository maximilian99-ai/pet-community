import express, { Router } from 'express';
import bcryptjs from 'bcryptjs';
import prisma from '@/utils/prisma';
import { generateToken } from '@/utils/jwt';
import { authenticate, AuthRequest } from '@/middleware/auth';
import type { Response } from 'express';

const router: Router = express.Router();

// Sign up
router.post('/signup', async (req: AuthRequest, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      console.log('[AUTH] 회원가입 실패 - 필수 필드 누락');
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      console.log(`[AUTH] 회원가입 실패 - 이미 존재하는 사용자: ${email || username}`);
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    console.log(`[AUTH] 회원가입 성공 - 사용자명: ${username}, ID: ${user.id}`);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('[AUTH] 회원가입 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('[AUTH] 로그인 실패 - 필수 필드 누락');
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`[AUTH] 로그인 실패 - 사용자 없음: ${email}`);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(`[AUTH] 로그인 실패 - 비밀번호 오류: ${email}`);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    console.log(`[AUTH] 로그인 성공 - 사용자명: ${user.username}, ID: ${user.id}`);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('[AUTH] 로그인 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
    });

    if (!user) {
      console.log(`[AUTH] 사용자 조회 실패 - 사용자 없음: ${req.user?.userId}`);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log(`[AUTH] 사용자 조회 성공 - 사용자명: ${user.username}, ID: ${user.id}`);
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('[AUTH] 사용자 조회 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account
router.delete('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log(`[AUTH] 회원탈퇴 실패 - 사용자 없음: ${userId}`);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Delete user (cascade will delete related posts, comments, etc.)
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`[AUTH] 회원탈퇴 성공 - 사용자명: ${user.username}, ID: ${userId}`);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('[AUTH] 회원탈퇴 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
