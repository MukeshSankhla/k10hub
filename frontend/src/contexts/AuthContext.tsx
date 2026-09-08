import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { api, setAuthTokenGetter, UserProfile, AuthorApplication, UserRole, ProjectSummary } from '../services/api';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  application: AuthorApplication | null;
  contributedProjects: ProjectSummary[];
  role: UserRole;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error?: string; confirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Parameters<typeof api.auth.updateProfile>[0]) => Promise<{ success: boolean; message?: string; error?: string }>;
  applyAuthor: (data: { bio: string; githubUrl?: string; hardwareExperience: string; sampleProjectIdeas: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [application, setApplication] = useState<AuthorApplication | null>(null);
  const [contributedProjects, setContributedProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBackendProfile = useCallback(async (token?: string) => {
    try {
      if (token) {
        setAuthTokenGetter(() => token);
      }
      const res = await api.auth.me();
      setProfile(res.user);
      setApplication(res.application);
      if (res.contributedProjects) {
        setContributedProjects(res.contributedProjects);
      }
      return { success: true, user: res.user };
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg.includes('ACCOUNT_SUSPENDED') || errMsg.toLowerCase().includes('suspended')) {
        if (isSupabaseConfigured && supabase) {
          await supabase.auth.signOut().catch(() => {});
        }
        setUser(null);
        setProfile(null);
        setApplication(null);
        setAuthTokenGetter(() => null);
        return { error: 'Your account has been suspended. Please contact platform administrators.' };
      }
      console.warn('Could not sync user profile from backend API:', err);
      return { error: errMsg };
    }
  }, []);

  // Initialize live Supabase authentication session
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          setUser(session.user);
          setAuthTokenGetter(() => session.access_token);
          await fetchBackendProfile(session.access_token);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) return;
          if (session) {
            setUser(session.user);
            setAuthTokenGetter(() => session.access_token);
            await fetchBackendProfile(session.access_token);
          } else {
            setUser(null);
            setProfile(null);
            setApplication(null);
            setAuthTokenGetter(() => null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error during Supabase session initialization:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [fetchBackendProfile]);

  // Production Sign In with email & password
  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your frontend/.env file.',
      };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        return { error: error.message };
      }

      if (data.session) {
        const activeSession = data.session;
        setUser(data.user);
        setAuthTokenGetter(() => activeSession.access_token);
        const profileRes = await fetchBackendProfile(activeSession.access_token);
        if (profileRes?.error) {
          return { error: profileRes.error };
        }
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' };
    } finally {
      setLoading(false);
    }
  };

  // Production Sign Up with email, password & user metadata
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your frontend/.env file.',
      };
    }

    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = fullName.trim();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            name: trimmedName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.session) {
        const activeSession = data.session;
        setUser(data.user);
        setAuthTokenGetter(() => activeSession.access_token);
        await fetchBackendProfile(activeSession.access_token);
        return { confirmationRequired: false };
      }

      // If Supabase project has email confirmation enabled
      return { confirmationRequired: true };
    } catch (err: any) {
      return { error: err.message || 'Failed to sign up' };
    } finally {
      setLoading(false);
    }
  };

  // Production Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
      setApplication(null);
      setContributedProjects([]);
      setAuthTokenGetter(() => null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchBackendProfile();
  };

  // Update user profile
  const updateProfile = async (data: Parameters<typeof api.auth.updateProfile>[0]) => {
    try {
      const res = await api.auth.updateProfile(data);
      setProfile(res.user);
      await fetchBackendProfile();
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  };

  // Submit author verification application
  const applyAuthor = async (data: { bio: string; githubUrl?: string; hardwareExperience: string; sampleProjectIdeas: string }) => {
    try {
      const res = await api.auth.applyAuthor(data);
      setApplication(res.application);
      await fetchBackendProfile();
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit author application' };
    }
  };

  const role: UserRole = profile?.role || 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        application,
        contributedProjects,
        role,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
        updateProfile,
        applyAuthor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
