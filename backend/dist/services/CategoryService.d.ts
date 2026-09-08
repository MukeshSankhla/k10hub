import type { Category } from '../models';
export declare class CategoryService {
    /**
     * Get all categories ordered by sort_order.
     */
    getCategories(): Promise<Category[]>;
    /**
     * Get a single category by slug.
     */
    getCategoryBySlug(slug: string): Promise<Category | null>;
}
export declare const categoryService: CategoryService;
//# sourceMappingURL=CategoryService.d.ts.map