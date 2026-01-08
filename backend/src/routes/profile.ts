import express, { Router } from 'express';
import prisma from '@/utils/prisma';
import { authenticate, AuthRequest } from '@/middleware/auth';
import type { Response } from 'express';

const router: Router = express.Router();

// Get user profile
router.get('/:userId', async (req: any, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pets: true,
        followers: true,
        following: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      pets: user.pets,
      followers: user.followers.length,
      following: user.following.length,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
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

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's pets
router.get('/:userId/pets', async (req: any, res: Response) => {
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

    res.json(pets);
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add pet
router.post('/me/pets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, species, breed, age, image } = req.body;
    const userId = req.user?.userId;

    if (!name || !species) {
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

    res.status(201).json(pet);
  } catch (error) {
    console.error('Add pet error:', error);
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

    res.json(pet);
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete pet
router.delete('/me/pets/:petId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { petId } = req.params;

    await prisma.pet.delete({
      where: { id: petId },
    });

    res.json({ message: 'Pet deleted' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
