// ─── API Client ───────────────────────────────────────────────────────────────
// Communicates with the K10 Hub backend with automatic Bearer token injection.

const API_BASE = '/api';

let getAuthToken: (() => string | null) | null = null;

export function setAuthTokenGetter(fn: () => string | null) {
  getAuthToken = fn;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken ? getAuthToken() : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ─── Project types ────────────────────────────────────────────────────────────
export interface ProjectSummary {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  isCommunity: boolean;
  isOfficial: boolean;
  viewCount: number;
  likeCount: number;
  flashCount: number;
  publishedAt: number | null;
  category: {
    slug: string;
    name: string;
    iconName: string | null;
    color: string | null;
  } | null;
  author: {
    slug: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  iconName: string | null;
  color: string | null;
  sortOrder: number;
}

export interface ApiListResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
    hasNextPage?: boolean;
  };
}

export interface ApiItemResponse<T> {
  data: T;
}

// ─── User & Role types ────────────────────────────────────────────────────────
export type UserRole = 'unknown' | 'user' | 'author' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
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
  authorId?: number | null;
  createdAt: number | null;
  lastSignInAt: number | null;
  author?: {
    id: number;
    slug: string;
    name: string;
    bio: string | null;
    avatarUrl: string | null;
    githubUrl?: string | null;
    websiteUrl?: string | null;
    socialPlatform?: string | null;
    socialUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    linkedinUrl?: string | null;
  } | null;
}

export interface AuthorApplication {
  id: number;
  userId: number;
  bio: string;
  githubUrl?: string | null;
  hardwareExperience: string;
  sampleProjectIdeas: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string | null;
  reviewedBy?: number | null;
  createdAt: number;
  reviewedAt?: number | null;
  user?: UserProfile;
}

export interface AdminStats {
  totalUsers: number;
  usersByRole: {
    user: number;
    author: number;
    admin: number;
  };
  pendingApplications: number;
  totalProjects: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────
export const api = {
  projects: {
    list: (params?: { page?: number; pageSize?: number; category?: string; difficulty?: string; featured?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.pageSize) query.set('pageSize', String(params.pageSize));
      if (params?.category) query.set('category', params.category);
      if (params?.difficulty) query.set('difficulty', params.difficulty);
      if (params?.featured !== undefined) query.set('featured', String(params.featured));
      const qs = query.toString();
      return request<ApiListResponse<ProjectSummary>>(`/projects${qs ? `?${qs}` : ''}`);
    },
    get: (slug: string) => request<ApiItemResponse<ProjectSummary>>(`/projects/${slug}`),
    featured: () => request<ApiItemResponse<ProjectSummary[]>>('/projects/featured'),
  },
  categories: {
    list: () => request<ApiListResponse<Category>>('/categories'),
    get: (slug: string) => request<ApiItemResponse<Category>>(`/categories/${slug}`),
  },
  auth: {
    me: () => request<{ user: UserProfile; application: AuthorApplication | null; contributedProjects?: ProjectSummary[] }>('/auth/me'),
    updateProfile: (payload: {
      name?: string;
      avatarUrl?: string;
      bio?: string;
      githubUrl?: string;
      websiteUrl?: string;
      socialPlatform?: string;
      socialUrl?: string;
      instagramUrl?: string;
      youtubeUrl?: string;
      linkedinUrl?: string;
    }) =>
      request<{ success: boolean; message: string; user: UserProfile }>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    sync: (payload: { name?: string; avatarUrl?: string }) =>
      request<{ success: boolean; user: UserProfile }>('/auth/sync', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    applyAuthor: (payload: {
      bio: string;
      githubUrl?: string;
      hardwareExperience?: string;
      sampleProjectIdeas?: string;
      workedOnUnihiker?: boolean;
      unihikerProjectUrl?: string;
      acceptedTerms?: boolean;
    }) =>
      request<{ success: boolean; message: string; application: AuthorApplication }>('/auth/apply-author', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    myApplication: () => request<{ application: AuthorApplication | null }>('/auth/my-application'),
    getPublicProfile: (identifier: string) =>
      request<{ user: UserProfile }>(`/auth/profile/${encodeURIComponent(identifier)}`),
  },
  admin: {
    getStats: () => request<AdminStats>('/admin/stats'),
    getUsers: (params?: { page?: number; pageSize?: number; search?: string; role?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.pageSize) query.set('pageSize', String(params.pageSize));
      if (params?.search) query.set('search', params.search);
      if (params?.role && params.role !== 'all') query.set('role', params.role);
      if (params?.status && params.status !== 'all') query.set('status', params.status);
      const qs = query.toString();
      return request<ApiListResponse<UserProfile>>(`/admin/users${qs ? `?${qs}` : ''}`);
    },
    updateUserRole: (id: number, role: UserRole) =>
      request<{ success: boolean; message: string; user: UserProfile }>(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    updateUserStatus: (id: number, status: UserStatus) =>
      request<{ success: boolean; message: string }>(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getAuthorApplications: (status?: string) => {
      const qs = status && status !== 'all' ? `?status=${status}` : '';
      return request<{ data: AuthorApplication[] }>(`/admin/author-applications${qs}`);
    },
    approveAuthorApplication: (id: number) =>
      request<{ success: boolean; message: string }>(`/admin/author-applications/${id}/approve`, {
        method: 'POST',
      }),
    rejectAuthorApplication: (id: number, adminNotes?: string) =>
      request<{ success: boolean; message: string }>(`/admin/author-applications/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ adminNotes }),
      }),
  },
  health: () => request<{ status: string; service: string; version: string }>('/health'),
};
