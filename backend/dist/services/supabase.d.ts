import { SupabaseClient } from '@supabase/supabase-js';
export declare function isSupabaseConfigured(): boolean;
export declare function getSupabaseClient(): SupabaseClient | null;
export interface VerifiedAuthUser {
    uid: string;
    email: string;
    name?: string;
    avatarUrl?: string;
}
/**
 * Verifies a real Supabase Bearer JWT token against Supabase Auth.
 */
export declare function verifyAuthToken(token: string): Promise<{
    user: VerifiedAuthUser | null;
    error: string | null;
}>;
//# sourceMappingURL=supabase.d.ts.map