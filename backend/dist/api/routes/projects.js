"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const ProjectService_1 = require("../../services/ProjectService");
const router = (0, express_1.Router)();
// ─── Query validation schemas ─────────────────────────────────────────────────
const listProjectsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    pageSize: zod_1.z.coerce.number().min(1).max(50).default(12),
    category: zod_1.z.string().optional(),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    featured: zod_1.z.coerce.boolean().optional(),
    community: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().optional(),
});
// GET /api/projects
router.get('/', async (req, res, next) => {
    try {
        const query = listProjectsSchema.parse(req.query);
        const { data, total } = await ProjectService_1.projectService.getProjects({
            categorySlug: query.category,
            difficulty: query.difficulty,
            isFeatured: query.featured,
            isCommunity: query.community,
            search: query.search,
        }, { page: query.page, pageSize: query.pageSize });
        res.json({
            data,
            meta: {
                total,
                page: query.page,
                pageSize: query.pageSize,
                hasNextPage: query.page * query.pageSize < total,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/projects/featured
router.get('/featured', async (_req, res, next) => {
    try {
        const data = await ProjectService_1.projectService.getFeaturedProjects(3);
        res.json({ data });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/projects/:slug
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const project = await ProjectService_1.projectService.getProjectBySlug(slug);
        if (!project) {
            return res.status(404).json({
                error: 'NOT_FOUND',
                message: `Project "${slug}" not found`,
                statusCode: 404,
            });
        }
        // Increment view count asynchronously (don't await, don't fail request)
        ProjectService_1.projectService.incrementViewCount(slug).catch(() => { });
        return res.json({ data: project });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map