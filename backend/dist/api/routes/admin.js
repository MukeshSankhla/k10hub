"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../config/database");
const schema_1 = require("../../db/schema");
const auth_1 = require("../../middleware/auth");
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
// Apply admin protection to all routes in this router
router.use(auth_1.requireAdmin);
/**
 * GET /api/admin/stats
 * Platform user and creator statistics
 */
router.get('/stats', async (_req, res) => {
    try {
        const totalUsersResult = await database_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.users);
        const totalUsers = totalUsersResult[0]?.count || 0;
        const roleCounts = await database_1.db
            .select({
            role: schema_1.users.role,
            count: (0, drizzle_orm_1.count)(),
        })
            .from(schema_1.users)
            .groupBy(schema_1.users.role);
        const pendingAppsResult = await database_1.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.authorApplications)
            .where((0, drizzle_orm_1.eq)(schema_1.authorApplications.status, 'pending'));
        const pendingApplications = pendingAppsResult[0]?.count || 0;
        const totalProjectsResult = await database_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.projects);
        const totalProjects = totalProjectsResult[0]?.count || 0;
        const rolesMap = { user: 0, author: 0, admin: 0 };
        for (const row of roleCounts) {
            rolesMap[row.role] = row.count;
        }
        return res.json({
            totalUsers,
            usersByRole: rolesMap,
            pendingApplications,
            totalProjects,
        });
    }
    catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({ error: 'STATS_ERROR', message: error.message });
    }
});
/**
 * GET /api/admin/users
 * Paginated user listing with search and filters
 */
router.get('/users', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 15));
        const offset = (page - 1) * pageSize;
        const rawSearch = req.query.search?.trim().slice(0, 100);
        const roleFilter = req.query.role;
        const statusFilter = req.query.status;
        const conditions = [];
        if (rawSearch) {
            // Escape special SQLite LIKE characters to prevent wildcard injection
            const escapedSearch = rawSearch.replace(/[%_\\]/g, '\\$&');
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.users.name, `%${escapedSearch}%`), (0, drizzle_orm_1.like)(schema_1.users.email, `%${escapedSearch}%`)));
        }
        if (roleFilter && ['user', 'author', 'admin'].includes(roleFilter)) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.users.role, roleFilter));
        }
        if (statusFilter && ['active', 'suspended'].includes(statusFilter)) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.users.status, statusFilter));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const userList = await database_1.db.query.users.findMany({
            where: whereClause,
            limit: pageSize,
            offset,
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.users.createdAt)],
            with: {
                author: true,
            },
        });
        const totalResult = await database_1.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schema_1.users)
            .where(whereClause);
        const total = totalResult[0]?.count || 0;
        return res.json({
            data: userList,
            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        console.error('Error listing admin users:', error);
        return res.status(500).json({ error: 'USERS_ERROR', message: error.message });
    }
});
/**
 * PATCH /api/admin/users/:id/role
 * Change a user's role (user, author, admin)
 */
const updateRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['user', 'author', 'admin']),
});
router.patch('/users/:id/role', async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId) || targetUserId <= 0) {
            return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid user ID' });
        }
        const parseResult = updateRoleSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid role' });
        }
        const targetUser = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, targetUserId),
        });
        if (!targetUser) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
        }
        const newRole = parseResult.data.role;
        // Prevent administrator self-demotion
        if (req.user?.id === targetUserId && newRole !== 'admin') {
            return res.status(400).json({
                error: 'SELF_DEMOTION',
                message: 'Administrators cannot demote their own account.',
            });
        }
        // Protect primary configured system admins
        const adminList = env_1.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
        if (adminList.includes(targetUser.email.toLowerCase()) && newRole !== 'admin') {
            return res.status(400).json({
                error: 'PROTECTED_ADMIN',
                message: 'This user is configured in ADMIN_EMAILS and cannot be demoted.',
            });
        }
        const now = Math.floor(Date.now() / 1000);
        // If upgrading to author and doesn't have an author profile yet, create one!
        let authorId = targetUser.authorId;
        if (newRole === 'author' && !authorId) {
            const baseSlug = targetUser.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `creator-${targetUser.id}`;
            let finalSlug = baseSlug;
            const existingSlug = await database_1.db.query.authors.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.authors.slug, finalSlug),
            });
            if (existingSlug) {
                finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
            }
            const [newAuthor] = await database_1.db
                .insert(schema_1.authors)
                .values({
                slug: finalSlug,
                name: targetUser.name,
                bio: 'Verified UNIHIKER K10 Creator',
                avatarUrl: targetUser.avatarUrl,
                createdAt: now,
                updatedAt: now,
            })
                .returning();
            authorId = newAuthor.id;
        }
        await database_1.db
            .update(schema_1.users)
            .set({
            role: newRole,
            authorId: authorId || null,
            updatedAt: now,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, targetUserId));
        const updated = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, targetUserId),
            with: { author: true },
        });
        return res.json({
            success: true,
            message: `User role successfully updated to ${newRole}`,
            user: updated,
        });
    }
    catch (error) {
        console.error('Error updating role:', error);
        return res.status(500).json({ error: 'ROLE_UPDATE_ERROR', message: error.message });
    }
});
/**
 * PATCH /api/admin/users/:id/status
 * Activate or Suspend a user
 */
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'suspended']),
});
router.patch('/users/:id/status', async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);
        if (isNaN(targetUserId) || targetUserId <= 0) {
            return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid user ID' });
        }
        if (req.user?.id === targetUserId) {
            return res.status(400).json({
                error: 'SELF_SUSPENSION',
                message: 'Administrators cannot suspend their own account.',
            });
        }
        const targetUser = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, targetUserId),
        });
        if (!targetUser) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
        }
        const parseResult = updateStatusSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid status' });
        }
        // Protect primary configured system admins against suspension
        const adminList = env_1.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
        if (adminList.includes(targetUser.email.toLowerCase()) && parseResult.data.status === 'suspended') {
            return res.status(400).json({
                error: 'PROTECTED_ADMIN',
                message: 'System administrators configured in ADMIN_EMAILS cannot be suspended.',
            });
        }
        const now = Math.floor(Date.now() / 1000);
        await database_1.db
            .update(schema_1.users)
            .set({
            status: parseResult.data.status,
            updatedAt: now,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, targetUserId));
        return res.json({
            success: true,
            message: `User status changed to ${parseResult.data.status}`,
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'STATUS_UPDATE_ERROR', message: error.message });
    }
});
/**
 * GET /api/admin/author-applications
 * List author applications
 */
router.get('/author-applications', async (req, res) => {
    try {
        const statusFilter = req.query.status;
        const condition = statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)
            ? (0, drizzle_orm_1.eq)(schema_1.authorApplications.status, statusFilter)
            : undefined;
        const applications = await database_1.db.query.authorApplications.findMany({
            where: condition,
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.authorApplications.createdAt)],
            with: {
                user: true,
                reviewer: true,
            },
        });
        return res.json({ data: applications });
    }
    catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ error: 'APPS_ERROR', message: error.message });
    }
});
/**
 * POST /api/admin/author-applications/:id/approve
 * Approve application -> Upgrade user to Author -> Create author record
 */
router.post('/author-applications/:id/approve', async (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        if (isNaN(applicationId) || applicationId <= 0) {
            return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid application ID' });
        }
        const appRecord = await database_1.db.query.authorApplications.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.authorApplications.id, applicationId),
            with: { user: true },
        });
        if (!appRecord) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Application not found' });
        }
        const applicant = appRecord.user;
        const now = Math.floor(Date.now() / 1000);
        // Create author profile if applicant does not have one
        let authorId = applicant.authorId;
        if (!authorId) {
            const baseSlug = applicant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `creator-${applicant.id}`;
            let finalSlug = baseSlug;
            const existing = await database_1.db.query.authors.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.authors.slug, finalSlug) });
            if (existing) {
                finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
            }
            const [newAuthor] = await database_1.db
                .insert(schema_1.authors)
                .values({
                slug: finalSlug,
                name: applicant.name,
                bio: appRecord.bio,
                avatarUrl: applicant.avatarUrl,
                githubUrl: appRecord.githubUrl,
                createdAt: now,
                updatedAt: now,
            })
                .returning();
            authorId = newAuthor.id;
        }
        // Update user role to author
        await database_1.db
            .update(schema_1.users)
            .set({
            role: 'author',
            authorId,
            updatedAt: now,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, applicant.id));
        // Update application status
        await database_1.db
            .update(schema_1.authorApplications)
            .set({
            status: 'approved',
            reviewedBy: req.user.id,
            reviewedAt: now,
            updatedAt: now,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.authorApplications.id, applicationId));
        return res.json({
            success: true,
            message: `Applicant ${applicant.name} approved as Author!`,
        });
    }
    catch (error) {
        console.error('Error approving application:', error);
        return res.status(500).json({ error: 'APPROVE_ERROR', message: error.message });
    }
});
/**
 * POST /api/admin/author-applications/:id/reject
 * Reject application with optional feedback
 */
const rejectSchema = zod_1.z.object({
    adminNotes: zod_1.z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});
router.post('/author-applications/:id/reject', async (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        if (isNaN(applicationId) || applicationId <= 0) {
            return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid application ID' });
        }
        const parseResult = rejectSchema.safeParse(req.body || {});
        if (!parseResult.success) {
            return res.status(400).json({ error: 'VALIDATION_ERROR', message: parseResult.error.errors[0]?.message || 'Invalid notes' });
        }
        const { adminNotes } = parseResult.data;
        const now = Math.floor(Date.now() / 1000);
        await database_1.db
            .update(schema_1.authorApplications)
            .set({
            status: 'rejected',
            adminNotes: adminNotes || null,
            reviewedBy: req.user.id,
            reviewedAt: now,
            updatedAt: now,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.authorApplications.id, applicationId));
        return res.json({
            success: true,
            message: 'Author application has been marked as rejected.',
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'REJECT_ERROR', message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map