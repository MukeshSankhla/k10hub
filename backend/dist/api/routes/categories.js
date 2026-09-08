"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoryService_1 = require("../../services/CategoryService");
const router = (0, express_1.Router)();
// GET /api/categories
router.get('/', async (_req, res, next) => {
    try {
        const data = await CategoryService_1.categoryService.getCategories();
        res.json({ data });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/categories/:slug
router.get('/:slug', async (req, res, next) => {
    try {
        const category = await CategoryService_1.categoryService.getCategoryBySlug(req.params.slug);
        if (!category) {
            return res.status(404).json({
                error: 'NOT_FOUND',
                message: `Category "${req.params.slug}" not found`,
                statusCode: 404,
            });
        }
        return res.json({ data: category });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map