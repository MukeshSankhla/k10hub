"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../../config/database");
const schema_1 = require("../../db/schema");
const auth_1 = require("../../middleware/auth");
const ProjectService_1 = require("../../services/ProjectService");
const router = (0, express_1.Router)();
// Helper for safe HTTP/HTTPS URLs
const safeHttpUrl = zod_1.z.string().trim().max(500).refine((val) => {
    if (!val)
        return true;
    try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    catch {
        return false;
    }
}, { message: 'Must be a valid HTTP or HTTPS URL' });
// Validation schema for Author Application
const applyAuthorSchema = zod_1.z.object({
    bio: zod_1.z.string().trim().min(20, 'Please provide a brief bio of at least 20 characters').max(1000, 'Bio cannot exceed 1000 characters'),
    githubUrl: safeHttpUrl.optional().or(zod_1.z.literal('')),
    hardwareExperience: zod_1.z.string().trim().min(20, 'Please describe your embedded/hardware experience in at least 20 characters').max(2000, 'Experience description cannot exceed 2000 characters'),
    sampleProjectIdeas: zod_1.z.string().trim().min(20, 'Please describe your planned UNIHIKER K10 projects in at least 20 characters').max(2000, 'Project ideas cannot exceed 2000 characters'),
});
// Validation schema for profile update
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters').optional(),
    avatarUrl: safeHttpUrl.optional().or(zod_1.z.literal('')),
    bio: zod_1.z.string().trim().max(1000, 'About bio cannot exceed 1000 characters').optional().or(zod_1.z.literal('')),
    githubUrl: safeHttpUrl.optional().or(zod_1.z.literal('')),
    websiteUrl: safeHttpUrl.optional().or(zod_1.z.literal('')),
    socialPlatform: zod_1.z.string().trim().max(50).optional().or(zod_1.z.literal('')),
    socialUrl: safeHttpUrl.optional().or(zod_1.z.literal('')),
    instagramUrl: safeHttpUrl.optional().or(zod_1.z.literal('')),
    youtubeUrl: safeHttpUrl.optional().or(zod_1.z.literal('')),
    linkedinUrl: safeHttpUrl.optional().or(zod_1.z.literal('')),
});
/**
 * GET /api/auth/me
 * Returns current authenticated user profile & role, plus contributed projects
 */
router.get('/me', auth_1.requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const userRecord = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, user.id),
            with: { author: true },
        });
        const dbUser = (userRecord || user);
        // Auto-link author record for admin or author if not yet linked
        if (!dbUser.authorId && (dbUser.role === 'admin' || dbUser.role === 'author')) {
            const existingAuthor = await database_1.db.query.authors.findFirst({
                where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.authors.slug, 'mukesh-sankhla'), (0, drizzle_orm_1.like)(schema_1.authors.name, `%${dbUser.name}%`)),
            });
            if (existingAuthor) {
                await database_1.db.update(schema_1.users).set({ authorId: existingAuthor.id }).where((0, drizzle_orm_1.eq)(schema_1.users.id, dbUser.id));
                dbUser.authorId = existingAuthor.id;
                dbUser.author = existingAuthor;
            }
        }
        // Fetch latest application if any
        const latestApplication = await database_1.db.query.authorApplications.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.authorApplications.userId, user.id),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.authorApplications.createdAt)],
        });
        // Fetch contributed projects for this author/admin
        let contributedProjects = [];
        if (dbUser.authorId) {
            contributedProjects = await ProjectService_1.projectService.getProjectsByAuthor(dbUser.authorId);
        }
        // If admin and has 0 personal author projects, populate with platform projects they manage
        if (contributedProjects.length === 0 && dbUser.role === 'admin') {
            const teamAuthor = await database_1.db.query.authors.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.authors.slug, 'k10-hub-team'),
            });
            if (teamAuthor) {
                contributedProjects = await ProjectService_1.projectService.getProjectsByAuthor(teamAuthor.id);
            }
        }
        return res.json({
            user: {
                id: dbUser.id,
                supabaseUid: dbUser.supabaseUid,
                email: dbUser.email,
                name: dbUser.name,
                avatarUrl: dbUser.avatarUrl,
                bio: dbUser.bio || dbUser.author?.bio || null,
                githubUrl: dbUser.githubUrl || dbUser.author?.githubUrl || null,
                websiteUrl: dbUser.websiteUrl || dbUser.author?.websiteUrl || null,
                socialPlatform: dbUser.socialPlatform || dbUser.author?.socialPlatform || 'linkedin',
                socialUrl: dbUser.socialUrl || dbUser.author?.socialUrl || null,
                instagramUrl: dbUser.instagramUrl || dbUser.author?.instagramUrl || null,
                youtubeUrl: dbUser.youtubeUrl || dbUser.author?.youtubeUrl || null,
                linkedinUrl: dbUser.linkedinUrl || dbUser.author?.linkedinUrl || null,
                role: dbUser.role,
                status: dbUser.status,
                authorId: dbUser.authorId,
                author: dbUser.author || null,
                createdAt: dbUser.createdAt,
                lastSignInAt: dbUser.lastSignInAt,
            },
            application: latestApplication || null,
            contributedProjects,
        });
    }
    catch (error) {
        console.error('Error fetching /me:', error);
        return res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
    }
});
/**
 * PATCH /api/auth/profile
 * Update user profile details (Name, About/Bio, GitHub, Social Links, Avatar)
 */
router.patch('/profile', auth_1.requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const parseResult = updateProfileSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                message: parseResult.error.errors[0]?.message || 'Invalid profile data',
            });
        }
        const data = parseResult.data;
        const now = Math.floor(Date.now() / 1000);
        const updates = { updatedAt: now };
        if (data.name !== undefined)
            updates.name = data.name;
        if (data.avatarUrl !== undefined)
            updates.avatarUrl = data.avatarUrl || null;
        if (data.bio !== undefined)
            updates.bio = data.bio || null;
        if (data.githubUrl !== undefined)
            updates.githubUrl = data.githubUrl || null;
        if (data.websiteUrl !== undefined)
            updates.websiteUrl = data.websiteUrl || null;
        if (data.socialPlatform !== undefined)
            updates.socialPlatform = data.socialPlatform || null;
        if (data.socialUrl !== undefined)
            updates.socialUrl = data.socialUrl || null;
        if (data.instagramUrl !== undefined)
            updates.instagramUrl = data.instagramUrl || null;
        if (data.youtubeUrl !== undefined)
            updates.youtubeUrl = data.youtubeUrl || null;
        if (data.linkedinUrl !== undefined)
            updates.linkedinUrl = data.linkedinUrl || null;
        await database_1.db.update(schema_1.users).set(updates).where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        // Also synchronize author record if user has authorId or is author/admin
        let authorId = user.authorId;
        if (authorId) {
            const authorUpdates = { updatedAt: now };
            if (data.name)
                authorUpdates.name = data.name;
            if (data.avatarUrl !== undefined)
                authorUpdates.avatarUrl = data.avatarUrl || null;
            if (data.bio !== undefined)
                authorUpdates.bio = data.bio || null;
            if (data.githubUrl !== undefined)
                authorUpdates.githubUrl = data.githubUrl || null;
            if (data.websiteUrl !== undefined)
                authorUpdates.websiteUrl = data.websiteUrl || null;
            if (data.socialPlatform !== undefined)
                authorUpdates.socialPlatform = data.socialPlatform || null;
            if (data.socialUrl !== undefined)
                authorUpdates.socialUrl = data.socialUrl || null;
            if (data.instagramUrl !== undefined)
                authorUpdates.instagramUrl = data.instagramUrl || null;
            if (data.youtubeUrl !== undefined)
                authorUpdates.youtubeUrl = data.youtubeUrl || null;
            if (data.linkedinUrl !== undefined)
                authorUpdates.linkedinUrl = data.linkedinUrl || null;
            await database_1.db.update(schema_1.authors).set(authorUpdates).where((0, drizzle_orm_1.eq)(schema_1.authors.id, authorId));
        }
        const updatedUser = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, user.id),
            with: { author: true },
        });
        return res.json({
            success: true,
            message: 'Profile updated successfully!',
            user: updatedUser,
        });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'UPDATE_ERROR', message: error.message });
    }
});
/**
 * POST /api/auth/sync
 * Sync profile info after login / registration
 */
router.post('/sync', auth_1.requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const body = updateProfileSchema.safeParse(req.body);
        if (body.success) {
            const now = Math.floor(Date.now() / 1000);
            const updates = { updatedAt: now };
            if (body.data.name)
                updates.name = body.data.name;
            if (body.data.avatarUrl)
                updates.avatarUrl = body.data.avatarUrl;
            await database_1.db.update(schema_1.users).set(updates).where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
            req.user = { ...user, ...updates };
        }
        return res.json({
            success: true,
            user: req.user,
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'SYNC_ERROR', message: error.message });
    }
});
/**
 * POST /api/auth/apply-author
 * Authenticated user submits an application to become a verified Author
 */
router.post('/apply-author', auth_1.requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (user.role === 'author' || user.role === 'admin') {
            return res.status(400).json({
                error: 'ALREADY_AUTHOR',
                message: `You already have ${user.role} privileges on K10 Hub!`,
            });
        }
        const parseResult = applyAuthorSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                message: parseResult.error.errors[0]?.message || 'Invalid form data',
            });
        }
        // Check if there is already a pending application
        const existingPending = await database_1.db.query.authorApplications.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.authorApplications.userId, user.id),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.authorApplications.createdAt)],
        });
        if (existingPending && existingPending.status === 'pending') {
            return res.status(409).json({
                error: 'APPLICATION_PENDING',
                message: 'You already have an author application under review by the K10 Hub team.',
            });
        }
        const now = Math.floor(Date.now() / 1000);
        const { bio, githubUrl, hardwareExperience, sampleProjectIdeas } = parseResult.data;
        const [created] = await database_1.db
            .insert(schema_1.authorApplications)
            .values({
            userId: user.id,
            bio,
            githubUrl: githubUrl || null,
            hardwareExperience,
            sampleProjectIdeas,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        })
            .returning();
        return res.status(201).json({
            success: true,
            message: 'Author application submitted successfully! Administrators will review your request.',
            application: created,
        });
    }
    catch (error) {
        console.error('Error submitting author application:', error);
        return res.status(500).json({ error: 'APPLICATION_ERROR', message: error.message });
    }
});
/**
 * GET /api/auth/my-application
 */
router.get('/my-application', auth_1.requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const latest = await database_1.db.query.authorApplications.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.authorApplications.userId, user.id),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.authorApplications.createdAt)],
        });
        return res.json({ application: latest || null });
    }
    catch (error) {
        return res.status(500).json({ error: 'QUERY_ERROR', message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map