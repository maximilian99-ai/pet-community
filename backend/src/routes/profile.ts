import express, { Router } from 'express';
import prisma from '@/utils/prisma';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { cacheGet, cacheSet, cacheDelete } from '@/utils/cache';
import type { Response } from 'express';

const router: Router = express.Router();

// Get user profile
router.get('/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Check cache first
    const cacheKey = `profile:${userId}`;
    let cachedProfile = cacheGet(cacheKey);

    if (cachedProfile) {
      console.log(`[PROFILE] 프로필 캐시 히트 - ID: ${userId}`);
      res.json(cachedProfile);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pets: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            age: true,
            image: true,
          },
        },
        followers: {
          select: {
            followerId: true,
          },
        },
        following: {
          select: {
            followingId: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`[PROFILE] 프로필 조회 실패 - 사용자 없음: ${userId}`);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const profileData = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      pets: user.pets,
      followers: user.followers.length,
      following: user.following.length,
      createdAt: user.createdAt,
    };

    // Cache for 2 minutes
    cacheSet(cacheKey, profileData, 120000);

    console.log(`[PROFILE] 프로필 조회 성공 - 사용자명: ${user.username}, ID: ${user.id}`);
    res.json(profileData);
  } catch (error) {
    console.error('[PROFILE] 프로필 조회 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { username, bio, avatar } = req.body;
    const userId = req.user?.userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username || undefined,
        bio: bio || undefined,
        avatar: avatar || undefined,
      },
    });

    // Clear profile cache
    cacheDelete(`profile:${userId}`);

    console.log(`[PROFILE] 프로필 수정 성공 - 사용자명: ${user.username}, ID: ${user.id}`);
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
    });
  } catch (error) {
    console.error('[PROFILE] 프로필 수정 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's pets
router.get('/:userId/pets', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const pets = await prisma.pet.findMany({
      where: { userId },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    console.log(`[PROFILE] 반려동물 조회 성공 - 사용자 ID: ${userId}, 반려동물 수: ${pets.length}`);
    res.json(pets);
  } catch (error) {
    console.error('[PROFILE] 반려동물 조회 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add pet
router.post('/me/pets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, species, breed, age, image } = req.body;
    const userId = req.user?.userId;

    if (!name || !species) {
      console.log('[PROFILE] 반려동물 추가 실패 - 필수 필드 누락');
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const pet = await prisma.pet.create({
      data: {
        name,
        species,
        breed: breed || null,
        age: age || null,
        image: image || null,
        userId: userId!,
      },
    });

    console.log(`[PROFILE] 반려동물 추가 성공 - 반려동물명: ${name}, ID: ${pet.id}`);
    res.status(201).json(pet);
  } catch (error) {
    console.error('[PROFILE] 반려동물 추가 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update pet
router.put('/me/pets/:petId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { petId } = req.params;
    const { name, species, breed, age, image } = req.body;

    const pet = await prisma.pet.update({
      where: { id: petId },
      data: {
        name: name || undefined,
        species: species || undefined,
        breed: breed || undefined,
        age: age || undefined,
        image: image || undefined,
      },
    });

    console.log(`[PROFILE] 반려동물 수정 성공 - 반려동물명: ${pet.name}, ID: ${pet.id}`);
    res.json(pet);
  } catch (error) {
    console.error('[PROFILE] 반려동물 수정 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete pet
router.delete('/me/pets/:petId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { petId } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    await prisma.pet.delete({
      where: { id: petId },
    });

    console.log(`[PROFILE] 반려동물 삭제 성공 - 반려동물명: ${pet?.name}, ID: ${petId}`);
    res.json({ message: 'Pet deleted' });
  } catch (error) {
    console.error('[PROFILE] 반려동물 삭제 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
