import { Request, Response, NextFunction } from 'express';
import { VerifiedAuthUser } from '../services/supabase';
export type UserRole = 'user' | 'author' | 'admin';
export type UserStatus = 'active' | 'suspended';
export interface DbUser {
    id: number;
    supabaseUid: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    bio?: string | null;
    githubUrl?: string | null;
    websiteUrl?: string | null;
    socialPlatform?: string | null;
    socialUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    linkedinUrl?: string | null;
    role: UserRole;
    status: UserStatus;
    authorId: number | null;
    createdAt: number | null;
    updatedAt: number | null;
    lastSignInAt: number | null;
}
export interface AuthRequest extends Request {
    user?: DbUser;
    authUser?: VerifiedAuthUser;
}
declare global {
    namespace Express {
        interface Request {
            user?: DbUser;
            authUser?: VerifiedAuthUser;
        }
    }
}
/**
 * Ensures or provisions a user in the local database based on Supabase identity.
 */
export declare function syncOrProvisionUser(verified: VerifiedAuthUser): Promise<DbUser>;
/**
 * Middleware: Optional Auth. Populates req.user if a valid token is present, but doesn't block guests.
 */
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
/**
 * Middleware: Required Auth. Returns 401 if missing, invalid, or suspended.
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware: Enforce minimum required role(s).
 */
export declare function requireRole(...allowedRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireAdmin: (((req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>) | typeof requireAuth)[];
export declare const requireAuthor: (((req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>) | typeof requireAuth)[];
//# sourceMappingURL=auth.d.ts.map