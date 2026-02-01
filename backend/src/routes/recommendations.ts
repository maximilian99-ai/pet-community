import express, { Router } from 'express';
import prisma from '@/utils/prisma';
import type { Response } from 'express';

const router: Router = express.Router();

// Get recommended posts (popular posts with most likes/comments)
router.get('/', async (req: any, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const take = Math.min(parseInt(limit), 50);

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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.json(posts);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get best posts (with badges)
router.get('/best', async (req: any, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const take = Math.min(parseInt(limit), 50);

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
router.get('/users', async (req: any, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const take = Math.min(parseInt(limit), 50);

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
