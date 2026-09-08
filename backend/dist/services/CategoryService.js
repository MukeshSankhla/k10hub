"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = exports.CategoryService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const schema_1 = require("../db/schema");
class CategoryService {
    /**
     * Get all categories ordered by sort_order.
     */
    async getCategories() {
        return database_1.db.select().from(schema_1.categories).orderBy((0, drizzle_orm_1.asc)(schema_1.categories.sortOrder));
    }
    /**
     * Get a single category by slug.
     */
    async getCategoryBySlug(slug) {
        const [category] = await database_1.db
            .select()
            .from(schema_1.categories)
            .where((0, drizzle_orm_1.eq)(schema_1.categories.slug, slug))
            .limit(1);
        return category ?? null;
    }
}
exports.CategoryService = CategoryService;
exports.categoryService = new CategoryService();
//# sourceMappingURL=CategoryService.js.map