import express, { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import type { Response } from 'express';

const router: Router = express.Router();

// Get logs for a pet
router.get('/pet/:petId', async (req: AuthRequest, res: Response) => {
  try {
    const { petId } = req.params;
    const { startDate, endDate, type } = req.query;

    const whereClause: any = { petId };

    if (type) {
      whereClause.type = Array.isArray(type) ? type[0] : type;
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        const dateStr = Array.isArray(startDate) ? startDate[0] : startDate;
        whereClause.date.gte = new Date(dateStr as string);
      }
      if (endDate) {
        const dateStr = Array.isArray(endDate) ? endDate[0] : endDate;
        whereClause.date.lte = new Date(dateStr as string);
      }
    }

    const logs = await prisma.log.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create log
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { petId, type, content, date } = req.body;

    if (!petId || !type || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const log = await prisma.log.create({
      data: {
        petId,
        type,
        content,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update log
router.put('/:logId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { logId } = req.params;
    const { type, content, date } = req.body;

    const log = await prisma.log.update({
      where: { id: logId },
      data: {
        type: type || undefined,
        content: content || undefined,
        date: date ? new Date(date) : undefined,
      },
    });

    res.json(log);
  } catch (error) {
    console.error('Update log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete log
router.delete('/:logId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { logId } = req.params;

    await prisma.log.delete({
      where: { id: logId },
    });

    res.json({ message: 'Log deleted' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weekly stats for a pet
router.get('/pet/:petId/weekly-stats', async (req: AuthRequest, res: Response) => {
  try {
    const { petId } = req.params;

    // Get logs from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await prisma.log.findMany({
      where: {
        petId,
        date: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Group by type
    const stats: Record<string, number> = {};
    logs.forEach((log) => {
      stats[log.type] = (stats[log.type] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Get weekly stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
