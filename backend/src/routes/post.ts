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

    console.log(`[POST] 피드 조회 성공 - 포스트 수: ${posts.length}, 총합: ${totalCount}`);
    res.json({
      posts,
      total: totalCount,
      limit: take,
      offset: skip,
    });
  } catch (error) {
    console.error('[POST] 피드 조회 오류:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ 
      error: 'Internal server error',
      message: isDev ? message : undefined 
    });
  }
});

// Create post
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, petId, image } = req.body;
    const authorId = req.user?.userId;

    if (!title || !content) {
      console.log('[POST] 포스트 생성 실패 - 필수 필드 누락');
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

    console.log(`[POST] 포스트 생성 성공 - 제목: ${title}, ID: ${post.id}, 작성자: ${post.author.username}`);
    res.status(201).json(post);
  } catch (error) {
    console.error('[POST] 포스트 생성 오류:', error);
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
      console.log(`[POST] 포스트 조회 실패 - 포스트 없음: ${postId}`);
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    console.log(`[POST] 포스트 조회 성공 - 제목: ${post.title}, ID: ${postId}`);
    res.json(post);
  } catch (error) {
    console.error('[POST] 포스트 조회 오류:', error);
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
      console.log(`[POST] 포스트 수정 실패 - 포스트 없음: ${postId}`);
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.authorId !== userId) {
      console.log(`[POST] 포스트 수정 실패 - 권한 없음: ${postId}`);
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

    console.log(`[POST] 포스트 수정 성공 - 제목: ${updatedPost.title}, ID: ${postId}`);
    res.json(updatedPost);
  } catch (error) {
    console.error('[POST] 포스트 수정 오류:', error);
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
      console.log(`[POST] 포스트 삭제 실패 - 포스트 없음: ${postId}`);
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.authorId !== userId) {
      console.log(`[POST] 포스트 삭제 실패 - 권한 없음: ${postId}`);
      res.status(403).json({ error: 'Not authorized to delete this post' });
      return;
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    console.log(`[POST] 포스트 삭제 성공 - 제목: ${post.title}, ID: ${postId}`);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('[POST] 포스트 삭제 오류:', error);
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
      console.log('[POST] 댓글 추가 실패 - 필수 필드 누락');
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

    console.log(`[POST] 댓글 추가 성공 - 포스트 ID: ${postId}, 댓글 ID: ${comment.id}, 작성자: ${comment.author.username}`);
    res.status(201).json(comment);
  } catch (error) {
    console.error('[POST] 댓글 추가 오류:', error);
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
      console.log(`[POST] 좋아요 취소 성공 - 포스트 ID: ${postId}, 사용자 ID: ${userId}`);
      res.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: userId!,
          postId,
        },
      });
      console.log(`[POST] 좋아요 추가 성공 - 포스트 ID: ${postId}, 사용자 ID: ${userId}`);
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('[POST] 좋아요 처리 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update comment
router.put('/:postId/comments/:commentId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!content) {
      console.log('[POST] 댓글 수정 실패 - 필수 필드 누락');
      res.status(400).json({ error: 'Missing content' });
      return;
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      console.log(`[POST] 댓글 수정 실패 - 댓글 없음: ${commentId}`);
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.authorId !== userId) {
      console.log(`[POST] 댓글 수정 실패 - 권한 없음: ${commentId}`);
      res.status(403).json({ error: 'Not authorized to update this comment' });
      return;
    }

    if (comment.postId !== postId) {
      console.log(`[POST] 댓글 수정 실패 - 포스트 불일치: ${commentId}`);
      res.status(400).json({ error: 'Comment does not belong to this post' });
      return;
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
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

    console.log(`[POST] 댓글 수정 성공 - 댓글 ID: ${commentId}, 포스트 ID: ${postId}`);
    res.json(updatedComment);
  } catch (error) {
    console.error('[POST] 댓글 수정 오류:', error);
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
      console.log(`[POST] 댓글 삭제 실패 - 댓글 없음: ${commentId}`);
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.authorId !== userId) {
      console.log(`[POST] 댓글 삭제 실패 - 권한 없음: ${commentId}`);
      res.status(403).json({ error: 'Not authorized to delete this comment' });
      return;
    }

    if (comment.postId !== postId) {
      console.log(`[POST] 댓글 삭제 실패 - 포스트 불일치: ${commentId}`);
      res.status(400).json({ error: 'Comment does not belong to this post' });
      return;
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    console.log(`[POST] 댓글 삭제 성공 - 댓글 ID: ${commentId}, 포스트 ID: ${postId}`);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('[POST] 댓글 삭제 오류:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
