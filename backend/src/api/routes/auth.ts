import { Router, Response, Request } from 'express';
import { z } from 'zod';
import { eq, desc, or, like, and } from 'drizzle-orm';
import { db } from '../../config/database';
import { users, authorApplications, authors } from '../../db/schema';
import { requireAuth, AuthRequest, syncOrProvisionUser } from '../../middleware/auth';
import { projectService } from '../../services/ProjectService';
import { getSupabaseClient } from '../../services/supabase';

const router = Router();

// Helper for safe HTTP/HTTPS URLs
const safeHttpUrl = z.string().trim().max(500).refine((val) => {
  if (!val) return true;
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}, { message: 'Must be a valid HTTP or HTTPS URL' });

// Validation schema for Author Application
const applyAuthorSchema = z.object({
  bio: z.string().trim().min(3, 'Please tell us who you are in at least 3 characters').max(1000, 'Bio cannot exceed 1000 characters'),
  githubUrl: safeHttpUrl.optional().or(z.literal('')),
  hardwareExperience: z.string().trim().max(2000).optional(),
  sampleProjectIdeas: z.string().trim().max(2000).optional(),
  workedOnUnihiker: z.boolean().optional(),
  unihikerProjectUrl: safeHttpUrl.optional().or(z.literal('')),
  acceptedTerms: z.boolean().optional(),
});

// Validation schema for profile update
const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters').optional(),
  avatarUrl: safeHttpUrl.optional().or(z.literal('')),
  bio: z.string().trim().max(1000, 'About bio cannot exceed 1000 characters').optional().or(z.literal('')),
  githubUrl: safeHttpUrl.optional().or(z.literal('')),
  websiteUrl: safeHttpUrl.optional().or(z.literal('')),
  socialPlatform: z.string().trim().max(50).optional().or(z.literal('')),
  socialUrl: safeHttpUrl.optional().or(z.literal('')),
  instagramUrl: safeHttpUrl.optional().or(z.literal('')),
  youtubeUrl: safeHttpUrl.optional().or(z.literal('')),
  linkedinUrl: safeHttpUrl.optional().or(z.literal('')),
});

const registerSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(60),
});

/**
 * POST /api/auth/register
 * Maker account creation via Supabase Admin API with auto-confirmed email.
 * Bypasses public SMTP rate limits and delivers instant active account.
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: parseResult.error.errors[0]?.message || 'Invalid registration data',
      });
    }

    const { email, password, name } = parseResult.data;
    const normalizedEmail = email.toLowerCase();
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({
        error: 'SUPABASE_NOT_CONFIGURED',
        message: 'Authentication service is not configured on the backend.',
      });
    }

    // Use admin client to create pre-confirmed user (bypasses SMTP rate limits)
    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        full_name: name,
      },
    });

    if (error) {
      const msg = error.message || 'Failed to create user';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
        return res.status(409).json({
          error: 'USER_ALREADY_EXISTS',
          message: 'An account with this email address already exists. Please sign in instead.',
        });
      }
      return res.status(400).json({
        error: 'REGISTRATION_FAILED',
        message: msg,
      });
    }

    if (data.user) {
      // Sync into local database
      await syncOrProvisionUser({
        uid: data.user.id,
        email: normalizedEmail,
        name,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred during registration.',
    });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user profile & role, plus contributed projects
 */
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: { author: true },
    });

    const dbUser = (userRecord || user) as any;

    // Auto-link author record for admin or author if not yet linked
    if (!dbUser.authorId && (dbUser.role === 'admin' || dbUser.role === 'author')) {
      const existingAuthor = await db.query.authors.findFirst({
        where: or(
          eq(authors.slug, 'mukesh-sankhla'),
          like(authors.name, `%${dbUser.name}%`)
        ),
      });

      if (existingAuthor) {
        await db.update(users).set({ authorId: existingAuthor.id }).where(eq(users.id, dbUser.id));
        dbUser.authorId = existingAuthor.id;
        dbUser.author = existingAuthor;
      }
    }

    // Fetch latest application if any
    const latestApplication = await db.query.authorApplications.findFirst({
      where: eq(authorApplications.userId, user.id),
      orderBy: [desc(authorApplications.createdAt)],
    });

    // Fetch contributed projects for this author/admin
    let contributedProjects: any[] = [];
    if (dbUser.authorId) {
      contributedProjects = await projectService.getProjectsByAuthor(dbUser.authorId);
    }
    
    // If admin and has 0 personal author projects, populate with platform projects they manage
    if (contributedProjects.length === 0 && dbUser.role === 'admin') {
      const teamAuthor = await db.query.authors.findFirst({
        where: eq(authors.slug, 'k10-hub-team'),
      });
      if (teamAuthor) {
        contributedProjects = await projectService.getProjectsByAuthor(teamAuthor.id);
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
  } catch (error: any) {
    console.error('Error fetching /me:', error);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});

/**
 * PATCH /api/auth/profile
 * Update user profile details (Name, About/Bio, GitHub, Social Links, Avatar)
 */
router.patch('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const parseResult = updateProfileSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: parseResult.error.errors[0]?.message || 'Invalid profile data',
      });
    }

    const data = parseResult.data;
    const now = Math.floor(Date.now() / 1000);
    const updates: any = { updatedAt: now };

    if (data.name !== undefined) updates.name = data.name;
    if (data.avatarUrl !== undefined) updates.avatarUrl = data.avatarUrl || null;
    if (data.bio !== undefined) updates.bio = data.bio || null;
    if (data.githubUrl !== undefined) updates.githubUrl = data.githubUrl || null;
    if (data.websiteUrl !== undefined) updates.websiteUrl = data.websiteUrl || null;
    if (data.socialPlatform !== undefined) updates.socialPlatform = data.socialPlatform || null;
    if (data.socialUrl !== undefined) updates.socialUrl = data.socialUrl || null;
    if (data.instagramUrl !== undefined) updates.instagramUrl = data.instagramUrl || null;
    if (data.youtubeUrl !== undefined) updates.youtubeUrl = data.youtubeUrl || null;
    if (data.linkedinUrl !== undefined) updates.linkedinUrl = data.linkedinUrl || null;

    await db.update(users).set(updates).where(eq(users.id, user.id));

    // Also synchronize author record if user has authorId or is author/admin
    let authorId = user.authorId;
    if (authorId) {
      const authorUpdates: any = { updatedAt: now };
      if (data.name) authorUpdates.name = data.name;
      if (data.avatarUrl !== undefined) authorUpdates.avatarUrl = data.avatarUrl || null;
      if (data.bio !== undefined) authorUpdates.bio = data.bio || null;
      if (data.githubUrl !== undefined) authorUpdates.githubUrl = data.githubUrl || null;
      if (data.websiteUrl !== undefined) authorUpdates.websiteUrl = data.websiteUrl || null;
      if (data.socialPlatform !== undefined) authorUpdates.socialPlatform = data.socialPlatform || null;
      if (data.socialUrl !== undefined) authorUpdates.socialUrl = data.socialUrl || null;
      if (data.instagramUrl !== undefined) authorUpdates.instagramUrl = data.instagramUrl || null;
      if (data.youtubeUrl !== undefined) authorUpdates.youtubeUrl = data.youtubeUrl || null;
      if (data.linkedinUrl !== undefined) authorUpdates.linkedinUrl = data.linkedinUrl || null;

      await db.update(authors).set(authorUpdates).where(eq(authors.id, authorId));
    }

    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: { author: true },
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'UPDATE_ERROR', message: error.message });
  }
});

/**
 * POST /api/auth/sync
 * Sync profile info after login / registration
 */
router.post('/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const body = updateProfileSchema.safeParse(req.body);

    if (body.success) {
      const now = Math.floor(Date.now() / 1000);
      const updates: any = { updatedAt: now };
      if (body.data.name) updates.name = body.data.name;
      if (body.data.avatarUrl) updates.avatarUrl = body.data.avatarUrl;

      await db.update(users).set(updates).where(eq(users.id, user.id));
      req.user = { ...user, ...updates };
    }

    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'SYNC_ERROR', message: error.message });
  }
});

/**
 * POST /api/auth/apply-author
 * Authenticated user submits an application to become a verified Author
 */
router.post('/apply-author', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

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

    // Check if user was previously an approved author and subsequently demoted
    const previousApproved = await db.query.authorApplications.findFirst({
      where: and(
        eq(authorApplications.userId, user.id),
        eq(authorApplications.status, 'approved')
      ),
    });

    if (previousApproved && user.role === 'user') {
      return res.status(403).json({
        error: 'AUTHOR_DEMOTED',
        message: 'You were previously an approved Author, but your access was demoted by a Platform Administrator. Please contact admin@k10hub.io to appeal or restore your author privileges.',
      });
    }

    // Check if there is already a pending application
    const existingPending = await db.query.authorApplications.findFirst({
      where: eq(authorApplications.userId, user.id),
      orderBy: [desc(authorApplications.createdAt)],
    });

    if (existingPending && existingPending.status === 'pending') {
      return res.status(409).json({
        error: 'APPLICATION_PENDING',
        message: 'You already have an author application under review by the K10 Hub team.',
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const { bio, githubUrl, workedOnUnihiker, unihikerProjectUrl } = parseResult.data;
    const hardwareExp = parseResult.data.hardwareExperience || (workedOnUnihiker ? `Worked on UNIHIKER: Yes (${unihikerProjectUrl || 'Confirmed'})` : 'Worked on UNIHIKER: No (New maker)');
    const sampleIdeas = parseResult.data.sampleProjectIdeas || 'Accepted K10 Hub Author Legal Policies and Publishing Code of Conduct.';

    const [created] = await db
      .insert(authorApplications)
      .values({
        userId: user.id,
        bio,
        githubUrl: githubUrl || null,
        hardwareExperience: hardwareExp,
        sampleProjectIdeas: sampleIdeas,
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
  } catch (error: any) {
    console.error('Error submitting author application:', error);
    return res.status(500).json({ error: 'APPLICATION_ERROR', message: error.message });
  }
});

/**
 * GET /api/auth/my-application
 */
router.get('/my-application', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const latest = await db.query.authorApplications.findFirst({
      where: eq(authorApplications.userId, user.id),
      orderBy: [desc(authorApplications.createdAt)],
    });

    return res.json({ application: latest || null });
  } catch (error: any) {
    return res.status(500).json({ error: 'QUERY_ERROR', message: error.message });
  }
});

/**
 * GET /api/auth/profile/:identifier
 * Public profile details
 */
router.get('/profile/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const clean = identifier.trim();

    const isNum = !isNaN(Number(clean));
    const userRecord = await db.query.users.findFirst({
      where: isNum
        ? eq(users.id, Number(clean))
        : or(
            eq(users.email, clean),
            like(users.name, `%${clean}%`)
          ),
      with: { author: true },
    });

    if (userRecord) {
      return res.json({
        user: {
          id: userRecord.id,
          name: userRecord.name,
          avatarUrl: userRecord.avatarUrl,
          bio: userRecord.bio || userRecord.author?.bio || null,
          githubUrl: userRecord.githubUrl || userRecord.author?.githubUrl || null,
          websiteUrl: userRecord.websiteUrl || userRecord.author?.websiteUrl || null,
          socialPlatform: userRecord.socialPlatform || userRecord.author?.socialPlatform || null,
          socialUrl: userRecord.socialUrl || userRecord.author?.socialUrl || null,
          instagramUrl: userRecord.instagramUrl || userRecord.author?.instagramUrl || null,
          youtubeUrl: userRecord.youtubeUrl || userRecord.author?.youtubeUrl || null,
          linkedinUrl: userRecord.linkedinUrl || userRecord.author?.linkedinUrl || null,
          role: userRecord.role,
        }
      });
    }

    const authorRecord = await db.query.authors.findFirst({
      where: or(
        eq(authors.slug, clean.toLowerCase()),
        like(authors.name, `%${clean}%`)
      ),
    });

    if (authorRecord) {
      return res.json({
        user: {
          id: authorRecord.id,
          name: authorRecord.name,
          avatarUrl: authorRecord.avatarUrl,
          bio: authorRecord.bio,
          githubUrl: authorRecord.githubUrl,
          websiteUrl: authorRecord.websiteUrl,
          socialPlatform: authorRecord.socialPlatform,
          socialUrl: authorRecord.socialUrl,
          instagramUrl: authorRecord.instagramUrl,
          youtubeUrl: authorRecord.youtubeUrl,
          linkedinUrl: authorRecord.linkedinUrl,
          role: 'author',
        }
      });
    }

    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found' });
  } catch (err: any) {
    return res.status(500).json({ error: 'QUERY_ERROR', message: err.message });
  }
});

export default router;
