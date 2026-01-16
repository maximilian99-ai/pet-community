import express, { Router } from 'express';
import prisma from '@/utils/prisma';
import { authenticate, AuthRequest } from '@/middleware/auth';
import type { Response } from 'express';

const router: Router = express.Router();

// Get feed (with pagination)
router.get('/', async (req: any, res: Response) => {
  try {
    const { limit = '10', offset = '0' } = req.query;
    const take = Math.min(parseInt(limit), 100);
    const skip = parseInt(offset);

    const posts = await prisma.post.findMany({
      skip,
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
        pet: true,
        likes: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        badges: true,
      },
    });

    const totalCount = await prisma.post.count();

    res.json({
      posts,
      total: totalCount,
      limit: take,
      offset: skip,
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create post
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, petId, image } = req.body;
    const authorId = req.user?.userId;

    if (!title || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        image: image || null,
        petId: petId || null,
        authorId: authorId!,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post
router.get('/:postId', async (req: any, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        pet: true,
        likes: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        badges: true,
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post
router.put('/:postId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { title, content, image } = req.body;
    const userId = req.user?.userId;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.authorId !== userId) {
      res.status(403).json({ error: 'Not authorized to update this post' });
      return;
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title || undefined,
        content: content || undefined,
        image: image || undefined,
      },
    });

    res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post
router.delete('/:postId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.authorId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this post' });
      return;
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment
router.post('/:postId/comments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const authorId = req.user?.userId;

    if (!content) {
      res.status(400).json({ error: 'Missing content' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: authorId!,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like post
router.post('/:postId/likes', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId!,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: userId!,
            postId,
          },
        },
      });
      res.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: userId!,
          postId,
        },
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user?.userId;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.authorId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this comment' });
      return;
    }

    if (comment.postId !== postId) {
      res.status(400).json({ error: 'Comment does not belong to this post' });
      return;
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
