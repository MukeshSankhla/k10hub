import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { projectService } from '../../services/ProjectService';

const router = Router();

// ─── Query validation schemas ─────────────────────────────────────────────────
const listProjectsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(12),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  featured: z.coerce.boolean().optional(),
  community: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// GET /api/projects
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listProjectsSchema.parse(req.query);

    const { data, total } = await projectService.getProjects(
      {
        categorySlug: query.category,
        difficulty: query.difficulty,
        isFeatured: query.featured,
        isCommunity: query.community,
        search: query.search,
      },
      { page: query.page, pageSize: query.pageSize }
    );

    res.json({
      data,
      meta: {
        total,
        page: query.page,
        pageSize: query.pageSize,
        hasNextPage: query.page * query.pageSize < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/featured
router.get('/featured', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await projectService.getFeaturedProjects(3);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const project = await projectService.getProjectBySlug(slug);

    if (!project) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Project "${slug}" not found`,
        statusCode: 404,
      });
    }

    // Increment view count asynchronously (don't await, don't fail request)
    projectService.incrementViewCount(slug).catch(() => {});

    return res.json({ data: project });
  } catch (error) {
    next(error);
  }
});

export default router;
