import { eq, asc } from 'drizzle-orm';
import { db } from '../config/database';
import { categories } from '../db/schema';
import type { Category } from '../models';

export class CategoryService {
  /**
   * Get all categories ordered by sort_order.
   */
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.sortOrder));
  }

  /**
   * Get a single category by slug.
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    return category ?? null;
  }
}

export const categoryService = new CategoryService();
