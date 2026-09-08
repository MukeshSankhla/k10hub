"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupabaseConfigured = isSupabaseConfigured;
exports.getSupabaseClient = getSupabaseClient;
exports.verifyAuthToken = verifyAuthToken;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
let supabaseClient = null;
function isSupabaseConfigured() {
    return Boolean(env_1.env.SUPABASE_URL &&
        (env_1.env.SUPABASE_SERVICE_ROLE_KEY || env_1.env.SUPABASE_ANON_KEY) &&
        !env_1.env.SUPABASE_URL.includes('your-project'));
}
function getSupabaseClient() {
    if (!isSupabaseConfigured()) {
        return null;
    }
    if (!supabaseClient) {
        const key = env_1.env.SUPABASE_SERVICE_ROLE_KEY || env_1.env.SUPABASE_ANON_KEY;
        supabaseClient = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return supabaseClient;
}
/**
 * Verifies a real Supabase Bearer JWT token against Supabase Auth.
 */
async function verifyAuthToken(token) {
    if (!token) {
        return { user: null, error: 'No authorization token provided' };
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
        return {
            user: null,
            error: 'Supabase authentication service is not configured on the backend. Please provide SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in your backend .env file.',
        };
    }
    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            return { user: null, error: error?.message || 'Invalid or expired authentication session' };
        }
        const sbUser = data.user;
        const metadata = sbUser.user_metadata || {};
        const name = metadata.full_name || metadata.name || sbUser.email?.split('@')[0] || 'K10 Maker';
        const avatarUrl = metadata.avatar_url || metadata.picture;
        return {
            user: {
                uid: sbUser.id,
                email: sbUser.email || '',
                name,
                avatarUrl,
            },
            error: null,
        };
    }
    catch (err) {
        return { user: null, error: err.message || 'Token verification error' };
    }
}
//# sourceMappingURL=supabase.js.map