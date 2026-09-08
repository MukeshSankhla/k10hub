import { eq, desc, and, like } from 'drizzle-orm';
import { db } from '../config/database';
import { projects, categories, authors } from '../db/schema';

export interface ProjectFilter {
  categorySlug?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isFeatured?: boolean;
  isCommunity?: boolean;
  search?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export class ProjectService {
  async getProjects(filter: ProjectFilter = {}, pagination: Pagination = { page: 1, pageSize: 12 }) {
    const conditions = [];

    if (filter.difficulty) {
      conditions.push(eq(projects.difficulty, filter.difficulty));
    }
    if (filter.isFeatured !== undefined) {
      conditions.push(eq(projects.isFeatured, filter.isFeatured));
    }
    if (filter.isCommunity !== undefined) {
      conditions.push(eq(projects.isCommunity, filter.isCommunity));
    }
    if (filter.search) {
      conditions.push(like(projects.title, `%${filter.search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (pagination.page - 1) * pagination.pageSize;

    const data = await db.query.projects.findMany({
      where: whereClause,
      with: {
        category: true,
        author: true,
      },
      limit: pagination.pageSize,
      offset,
      orderBy: [desc(projects.createdAt)],
    });

    const all = await db.select().from(projects).where(whereClause);
    const total = all.length;

    return { data, total };
  }

  async getFeaturedProjects(limit = 3) {
    return db.query.projects.findMany({
      where: eq(projects.isFeatured, true),
      with: {
        category: true,
        author: true,
      },
      limit,
      orderBy: [desc(projects.likeCount)],
    });
  }

  async getProjectsByAuthor(authorId: number) {
    return db.query.projects.findMany({
      where: eq(projects.authorId, authorId),
      with: {
        category: true,
        author: true,
      },
      orderBy: [desc(projects.createdAt)],
    });
  }

  async getProjectBySlug(slug: string) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.slug, slug),
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

  async incrementViewCount(slug: string) {
    const existing = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    if (existing.length > 0) {
      await db
        .update(projects)
        .set({ viewCount: existing[0].viewCount + 1 })
        .where(eq(projects.slug, slug));
    }
  }
}

export const projectService = new ProjectService();
