"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuthor = exports.requireAdmin = void 0;
exports.syncOrProvisionUser = syncOrProvisionUser;
exports.optionalAuth = optionalAuth;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const schema_1 = require("../db/schema");
const supabase_1 = require("../services/supabase");
const env_1 = require("../config/env");
/**
 * Extracts Bearer token from header.
 */
function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return null;
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        return parts[1];
    }
    return null;
}
/**
 * Ensures or provisions a user in the local database based on Supabase identity.
 */
async function syncOrProvisionUser(verified) {
    const normalizedEmail = (verified.email || '').trim().toLowerCase();
    const existing = await database_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.users.supabaseUid, verified.uid),
    });
    const now = Math.floor(Date.now() / 1000);
    const adminList = env_1.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
    const isAdminEmail = Boolean(normalizedEmail && adminList.includes(normalizedEmail));
    if (existing) {
        // If account is suspended, do not refresh lastSignInAt
        if (existing.status === 'suspended') {
            return existing;
        }
        // If admin email changed in config, ensure admin status
        let role = existing.role;
        if (isAdminEmail && role !== 'admin') {
            role = 'admin';
            await database_1.db.update(schema_1.users).set({ role: 'admin', updatedAt: now }).where((0, drizzle_orm_1.eq)(schema_1.users.id, existing.id));
        }
        // Update last login
        await database_1.db.update(schema_1.users).set({ lastSignInAt: now }).where((0, drizzle_orm_1.eq)(schema_1.users.id, existing.id));
        return { ...existing, role, lastSignInAt: now };
    }
    // Determine initial role (admin if configured in ADMIN_EMAILS, else user)
    const initialRole = isAdminEmail ? 'admin' : 'user';
    const [inserted] = await database_1.db
        .insert(schema_1.users)
        .values({
        supabaseUid: verified.uid,
        email: normalizedEmail,
        name: (verified.name || normalizedEmail.split('@')[0] || 'Maker').trim().slice(0, 60),
        avatarUrl: verified.avatarUrl || null,
        role: initialRole,
        status: 'active',
        lastSignInAt: now,
        createdAt: now,
        updatedAt: now,
    })
        .returning();
    return inserted;
}
/**
 * Middleware: Optional Auth. Populates req.user if a valid token is present, but doesn't block guests.
 */
async function optionalAuth(req, _res, next) {
    try {
        const token = extractToken(req);
        if (!token)
            return next();
        const { user: verified, error } = await (0, supabase_1.verifyAuthToken)(token);
        if (error || !verified)
            return next();
        const dbUser = await syncOrProvisionUser(verified);
        if (dbUser.status !== 'suspended') {
            req.user = dbUser;
            req.authUser = verified;
        }
    }
    catch (err) {
        console.error('optionalAuth error:', err);
    }
    next();
}
/**
 * Middleware: Required Auth. Returns 401 if missing, invalid, or suspended.
 */
async function requireAuth(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({
            error: 'UNAUTHORIZED',
            message: 'Authentication required. Please sign in.',
        });
    }
    const { user: verified, error } = await (0, supabase_1.verifyAuthToken)(token);
    if (error || !verified) {
        return res.status(401).json({
            error: 'INVALID_TOKEN',
            message: error || 'Your session has expired. Please sign in again.',
        });
    }
    try {
        const dbUser = await syncOrProvisionUser(verified);
        if (dbUser.status === 'suspended') {
            return res.status(403).json({
                error: 'ACCOUNT_SUSPENDED',
                message: 'Your account has been suspended. Please contact platform administrators.',
            });
        }
        req.user = dbUser;
        req.authUser = verified;
        next();
    }
    catch (err) {
        console.error('requireAuth database error:', err);
        return res.status(500).json({
            error: 'DATABASE_ERROR',
            message: 'Could not resolve user profile.',
        });
    }
}
/**
 * Middleware: Enforce minimum required role(s).
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Authentication required.',
            });
        }
        // Admins always have access to everything
        if (req.user.role === 'admin' || allowedRoles.includes(req.user.role)) {
            return next();
        }
        return res.status(403).json({
            error: 'FORBIDDEN',
            message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        });
    };
}
exports.requireAdmin = [requireAuth, requireRole('admin')];
exports.requireAuthor = [requireAuth, requireRole('author', 'admin')];
//# sourceMappingURL=auth.js.map