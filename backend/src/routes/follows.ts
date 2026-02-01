import express, { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import type { Response } from 'express';

const router: Router = express.Router();

// Follow a user
router.post('/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.user?.userId;

    if (!followerId || followerId === userId) {
      res.status(400).json({ error: 'Invalid follow action' });
      return;
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      res.status(400).json({ error: 'Already following this user' });
      return;
    }

    const follow = await prisma.userFollow.create({
      data: {
        followerId,
        followingId: userId,
      },
    });

    res.status(201).json(follow);
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unfollow a user
router.delete('/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.user?.userId;

    if (!followerId) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    if (!follow) {
      res.status(404).json({ error: 'Follow relationship not found' });
      return;
    }

    await prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's following list
router.get('/:userId/following', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit || '10';
    const take = Math.min(parseInt(limit as string), 50);

    const followingRelations = await prisma.userFollow.findMany({
      where: { followerId: userId },
      take,
      include: {
        following: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            email: true,
          },
        },
      },
    });

    const followingUsers = followingRelations.map((rel) => rel.following);
    res.json(followingUsers);
  } catch (error) {
    console.error('Get following list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's followers list
router.get('/:userId/followers', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit || '10';
    const take = Math.min(parseInt(limit as string), 50);

    const followerRelations = await prisma.userFollow.findMany({
      where: { followingId: userId },
      take,
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            email: true,
          },
        },
      },
    });

    const followers = followerRelations.map((rel) => rel.follower);
    res.json(followers);
  } catch (error) {
    console.error('Get followers list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if following a user
router.get('/:userId/check/:targetUserId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, targetUserId } = req.params;

    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    res.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
