"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = exports.ProjectService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const schema_1 = require("../db/schema");
class ProjectService {
    async getProjects(filter = {}, pagination = { page: 1, pageSize: 12 }) {
        const conditions = [];
        if (filter.difficulty) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.projects.difficulty, filter.difficulty));
        }
        if (filter.isFeatured !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.projects.isFeatured, filter.isFeatured));
        }
        if (filter.isCommunity !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.projects.isCommunity, filter.isCommunity));
        }
        if (filter.search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.projects.title, `%${filter.search}%`));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const offset = (pagination.page - 1) * pagination.pageSize;
        const data = await database_1.db.query.projects.findMany({
            where: whereClause,
            with: {
                category: true,
                author: true,
            },
            limit: pagination.pageSize,
            offset,
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.projects.createdAt)],
        });
        const all = await database_1.db.select().from(schema_1.projects).where(whereClause);
        const total = all.length;
        return { data, total };
    }
    async getFeaturedProjects(limit = 3) {
        return database_1.db.query.projects.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.projects.isFeatured, true),
            with: {
                category: true,
                author: true,
            },
            limit,
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.projects.likeCount)],
        });
    }
    async getProjectsByAuthor(authorId) {
        return database_1.db.query.projects.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.projects.authorId, authorId),
            with: {
                category: true,
                author: true,
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.projects.createdAt)],
        });
    }
    async getProjectBySlug(slug) {
        const project = await database_1.db.query.projects.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.projects.slug, slug),
            with: {
                category: true,
                author: true,
                hardware: true,
                tutorials: true,
                firmwareVersions: true,
            },
        });
        return project ?? null;
    }
    async incrementViewCount(slug) {
        const existing = await database_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.slug, slug)).limit(1);
        if (existing.length > 0) {
            await database_1.db
                .update(schema_1.projects)
                .set({ viewCount: existing[0].viewCount + 1 })
                .where((0, drizzle_orm_1.eq)(schema_1.projects.slug, slug));
        }
    }
}
exports.ProjectService = ProjectService;
exports.projectService = new ProjectService();
//# sourceMappingURL=ProjectService.js.map