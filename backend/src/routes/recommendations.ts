import express, { Router } from 'express';
import prisma from '../utils/prisma';
import { cacheGet, cacheSet } from '../utils/cache';
import { AuthRequest } from '../middleware/auth';
import type { Response } from 'express';

const router: Router = express.Router();

// Get recommended posts (popular posts with most likes/comments)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const limit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit || '10';
    const take = Math.min(parseInt(limit as string), 50);

    // Check cache first
    const cacheKey = `recommendations:${take}`;
    let cachedPosts = cacheGet(cacheKey);

    if (cachedPosts) {
      console.log(`[REC] 추천 포스트 캐시 히트 - limit: ${take}`);
      res.json(cachedPosts);
      return;
    }

    // Get posts from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      take,
      orderBy: [
        {
          likes: {
            _count: 'desc',
          },
        },
        {
          comments: {
            _count: 'desc',
          },
        },
      ],
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Cache for 5 minutes
    cacheSet(cacheKey, posts, 300000);

    res.json(posts);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get best posts (with badges)
router.get('/best', async (req: AuthRequest, res: Response) => {
  try {
    const limit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit || '10';
    const take = Math.min(parseInt(limit as string), 50);

    const postsWithBadges = await prisma.post.findMany({
      where: {
        badges: {
          some: {},
        },
      },
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        badges: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.json(postsWithBadges);
  } catch (error) {
    console.error('Get best posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recommended users (based on followers/following)
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const limit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit || '10';
    const take = Math.min(parseInt(limit as string), 50);

    const users = await prisma.user.findMany({
      take,
      orderBy: {
        followers: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Get recommended users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
