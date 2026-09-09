// projectStorageService.ts
// Client-side persistence and CRUD management for UNIHIKER K10 projects and tutorials.

import { ProjectDetail } from '../../config/projectsData';

const STORAGE_KEY = 'k10_projects_store_v3';
const UPDATE_EVENT = 'k10_projects_updated';

// Self-executing cleanup to wipe legacy dummy projects and old cached data across browser sessions
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('k10_projects_store_v2');
    localStorage.removeItem('k10_projects_store_v1');
    localStorage.removeItem('k10_projects_store');
    localStorage.removeItem('k10_authors_profile_cache');
    localStorage.removeItem('k10_flash_counts');
  }
} catch (e) {
  // Ignore storage access errors
}

/**
 * Normalizes an array of projects, ensuring defaults and integrity.
 */
function getStoredProjects(): ProjectDetail[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Clean up any legacy dummy sample projects if present
      const filtered = parsed.filter(
        (p) =>
          p &&
          p.id &&
          p.id !== 'esp32-p4-display' &&
          !p.title?.toLowerCase().includes('getting started with unihiker')
      );
      if (filtered.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
    return [];
  } catch (err) {
    console.warn('Could not parse stored projects:', err);
    return [];
  }
}

/**
 * Manually clears all project and author storage from the browser.
 */
export function clearAllProjectStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('k10_projects_store_v2');
    localStorage.removeItem('k10_projects_store_v1');
    localStorage.removeItem('k10_projects_store');
    localStorage.removeItem('k10_authors_profile_cache');
    localStorage.removeItem('k10_flash_counts');
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  } catch (err) {
    console.warn('Failed to clear project storage:', err);
  }
}

/**
 * Checks whether the currently logged-in user is the author of the project.
 */
export function isProjectAuthor(
  project?: ProjectDetail | null,
  user?: any,
  profile?: any
): boolean {
  if (!project) return false;
  if (!user && !profile) return false;

  const userIds = [
    profile?.id !== undefined && profile?.id !== null ? String(profile.id).toLowerCase() : null,
    user?.id !== undefined && user?.id !== null ? String(user.id).toLowerCase() : null,
  ].filter(Boolean) as string[];

  const userEmails = [
    profile?.email,
    user?.email,
    user?.user_metadata?.email,
  ].filter(Boolean).map((e: string) => e.trim().toLowerCase());

  const userNames = [
    profile?.name,
    user?.user_metadata?.full_name,
    user?.user_metadata?.name,
    user?.email ? user.email.split('@')[0] : null,
  ].filter(Boolean).map((n: string) => n.trim().toLowerCase());

  const projectAuthorId = project.authorId ? String(project.authorId).toLowerCase() : '';
  const projectAuthorEmail = (project.authorEmail || '').trim().toLowerCase();
  const projectAuthorName = (project.author || '').trim().toLowerCase();

  // 1. Match by Author ID
  if (projectAuthorId && userIds.some((id) => id === projectAuthorId)) {
    return true;
  }

  // 2. Match by Email
  if (projectAuthorEmail && userEmails.some((email) => email === projectAuthorEmail)) {
    return true;
  }

  // 3. Match by Author Name or Email Prefix
  for (const name of userNames) {
    if (name && projectAuthorName) {
      if (name === projectAuthorName || projectAuthorName.includes(name) || name.includes(projectAuthorName)) {
        return true;
      }
    }
  }

  // 4. Default fallback: if project has no author identity assigned yet, current authenticated author owns it
  if (!projectAuthorId && !projectAuthorEmail && !projectAuthorName) {
    return true;
  }

  return false;
}

const AUTHORS_CACHE_KEY = 'k10_authors_profile_cache';

export interface CachedAuthorProfile {
  id?: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  email?: string;
  updatedAt?: number;
}

export function getKnownAuthorsCache(): Record<string, CachedAuthorProfile> {
  try {
    const raw = localStorage.getItem(AUTHORS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveKnownAuthor(author: CachedAuthorProfile): void {
  if (!author || (!author.id && !author.name && !author.email)) return;
  try {
    const cache = getKnownAuthorsCache();
    const entry: CachedAuthorProfile = {
      ...author,
      updatedAt: Date.now(),
    };
    if (author.id) cache[String(author.id).toLowerCase()] = entry;
    if (author.email) cache[author.email.toLowerCase()] = entry;
    if (author.name) cache[author.name.toLowerCase()] = entry;
    localStorage.setItem(AUTHORS_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('Failed to cache author profile:', err);
  }
}

export interface ResolvedAuthor {
  name: string;
  avatarUrl?: string;
  role?: string;
  authorId?: string;
  isCurrentUser: boolean;
}

/**
 * Dynamically resolves author information (name, avatar, role, and ID) for a project.
 * If the project belongs to the currently logged in user, it returns their live profile.
 * Otherwise, checks the cached author directory or falls back to project snapshot fields.
 */
export function resolveProjectAuthor(
  project?: ProjectDetail | null,
  currentUser?: any,
  currentProfile?: any
): ResolvedAuthor {
  if (!project) {
    return {
      name: 'Unknown Maker',
      avatarUrl: '',
      role: 'user',
      authorId: '',
      isCurrentUser: false,
    };
  }

  // 1. If currently logged in user is the author, ALWAYS return their live profile!
  if (currentUser || currentProfile) {
    if (isProjectAuthor(project, currentUser, currentProfile)) {
      const liveName =
        currentProfile?.name ||
        currentUser?.user_metadata?.name ||
        currentUser?.user_metadata?.full_name ||
        currentUser?.email?.split('@')[0] ||
        project.author ||
        'Maker';
      const liveAvatar =
        currentProfile?.avatarUrl ||
        currentUser?.user_metadata?.avatar_url ||
        project.authorAvatar ||
        '';
      const liveRole =
        currentProfile?.role ||
        project.authorRole ||
        'author';
      const liveId = String(currentProfile?.id || currentUser?.id || project.authorId || '');

      return {
        name: liveName,
        avatarUrl: liveAvatar,
        role: liveRole,
        authorId: liveId,
        isCurrentUser: true,
      };
    }
  }

  // 2. Check author cache by authorId, authorEmail, or authorName
  const cache = getKnownAuthorsCache();
  const idKey = project.authorId ? String(project.authorId).toLowerCase() : '';
  const emailKey = project.authorEmail ? project.authorEmail.toLowerCase() : '';
  const nameKey = project.author ? project.author.toLowerCase() : '';

  const cached =
    (idKey && cache[idKey]) ||
    (emailKey && cache[emailKey]) ||
    (nameKey && cache[nameKey]);

  if (cached && cached.name) {
    return {
      name: cached.name,
      avatarUrl: cached.avatarUrl || project.authorAvatar || '',
      role: cached.role || project.authorRole || 'author',
      authorId: cached.id || project.authorId || '',
      isCurrentUser: false,
    };
  }

  // 3. Fallback to static snapshot on project
  return {
    name: project.author || 'Maker',
    avatarUrl: project.authorAvatar || '',
    role: project.authorRole || 'author',
    authorId: project.authorId || '',
    isCurrentUser: false,
  };
}

/**
 * Synchronizes author profile changes across all stored projects belonging to this author.
 */
export function syncAuthorProfileAcrossProjects(
  authorIdentifier: {
    id?: string | number | null;
    email?: string | null;
    name?: string | null;
  },
  updates: {
    name?: string;
    avatarUrl?: string;
    role?: string;
    email?: string;
  }
): number {
  const all = getStoredProjects();
  if (!Array.isArray(all) || all.length === 0) return 0;

  const targetId =
    authorIdentifier.id !== undefined && authorIdentifier.id !== null
      ? String(authorIdentifier.id).toLowerCase()
      : '';
  const targetEmail = (authorIdentifier.email || '').trim().toLowerCase();
  const targetName = (authorIdentifier.name || '').trim().toLowerCase();

  let modifiedCount = 0;

  const updatedProjects = all.map((project) => {
    const pId = project.authorId ? String(project.authorId).toLowerCase() : '';
    const pEmail = (project.authorEmail || '').trim().toLowerCase();
    const pName = (project.author || '').trim().toLowerCase();

    // Match if IDs match
    const matchId = Boolean(targetId && pId && pId === targetId);
    // Match if Emails match
    const matchEmail = Boolean(targetEmail && pEmail && pEmail === targetEmail);
    // Match if Names match
    const matchName = Boolean(
      targetName && pName && (pName === targetName || pName.includes(targetName) || targetName.includes(pName))
    );

    if (matchId || matchEmail || matchName) {
      modifiedCount++;
      return {
        ...project,
        author: updates.name !== undefined && updates.name.trim() ? updates.name.trim() : project.author,
        authorAvatar: updates.avatarUrl !== undefined ? updates.avatarUrl : project.authorAvatar,
        authorRole: updates.role !== undefined ? updates.role : project.authorRole,
        authorId: targetId ? String(authorIdentifier.id) : project.authorId,
        authorEmail: updates.email || authorIdentifier.email || project.authorEmail,
      };
    }

    return project;
  });

  if (modifiedCount > 0) {
    persistProjects(updatedProjects);
  }

  // Update known author cache
  saveKnownAuthor({
    id: targetId || undefined,
    email: targetEmail || undefined,
    name: updates.name || authorIdentifier.name || '',
    avatarUrl: updates.avatarUrl,
    role: updates.role,
  });

  return modifiedCount;
}

/**
 * Automatically inspects stored projects and retro-links them to the currently authenticated user
 * if they were created by them.
 */
export function syncCurrentUserProjects(currentUser?: any, currentProfile?: any): number {
  if (!currentUser && !currentProfile) return 0;

  const userId =
    currentProfile?.id !== undefined && currentProfile?.id !== null
      ? String(currentProfile.id)
      : (currentUser?.id ? String(currentUser.id) : '');
  const userEmail = currentProfile?.email || currentUser?.email || '';
  const userName =
    currentProfile?.name ||
    currentUser?.user_metadata?.name ||
    currentUser?.user_metadata?.full_name ||
    (userEmail ? userEmail.split('@')[0] : '');
  const userAvatar = currentProfile?.avatarUrl || currentUser?.user_metadata?.avatar_url || '';
  const userRole = currentProfile?.role || 'author';

  if (!userName && !userId) return 0;

  const all = getStoredProjects();
  let modifiedCount = 0;

  const updatedProjects = all.map((project) => {
    if (isProjectAuthor(project, currentUser, currentProfile)) {
      const needsUpdate =
        project.author !== userName ||
        project.authorAvatar !== userAvatar ||
        (userId && project.authorId !== userId) ||
        (userRole && project.authorRole !== userRole);

      if (needsUpdate) {
        modifiedCount++;
        return {
          ...project,
          author: userName || project.author,
          authorAvatar: userAvatar || project.authorAvatar,
          authorRole: userRole || project.authorRole,
          authorId: userId || project.authorId,
          authorEmail: userEmail || project.authorEmail,
        };
      }
    }
    return project;
  });

  if (modifiedCount > 0) {
    persistProjects(updatedProjects);
  }

  saveKnownAuthor({
    id: userId,
    email: userEmail,
    name: userName,
    avatarUrl: userAvatar,
    role: userRole,
  });

  return modifiedCount;
}

function persistProjects(projects: ProjectDetail[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}

/**
 * Returns all active projects and tutorials (regardless of status).
 */
export function getAllProjects(): ProjectDetail[] {
  return getStoredProjects();
}

/**
 * Returns only approved, public projects for the main catalog.
 */
export function getPublicProjects(): ProjectDetail[] {
  return getStoredProjects().filter(
    (p) => (p.status === 'published' || !p.status) && (p.visibility === 'public' || !p.visibility)
  );
}

/**
 * Returns pending projects waiting for admin verification.
 */
export function getPendingProjects(): ProjectDetail[] {
  return getStoredProjects().filter((p) => p.status === 'pending_approval');
}

/**
 * Returns projects created by a specific author (by ID or author name).
 */
export function getAuthorProjects(authorIdOrName?: string): ProjectDetail[] {
  if (!authorIdOrName) return [];
  const query = authorIdOrName.trim().toLowerCase();
  return getStoredProjects().filter(
    (p) => (p.authorId && p.authorId.toLowerCase() === query) || (p.author && p.author.toLowerCase() === query)
  );
}

/**
 * Returns a specific project or tutorial by ID/slug.
 */
export function getProjectById(id: string): ProjectDetail | undefined {
  if (!id) return undefined;
  const cleanId = id.trim().toLowerCase();
  const all = getStoredProjects();
  return all.find((p) => p.id.toLowerCase() === cleanId);
}

/**
 * Creates or updates a project/tutorial.
 * Automatically stamps publishDate and firmware releaseDate.
 */
export function saveProject(project: ProjectDetail): ProjectDetail {
  const all = getStoredProjects();
  const existingIdx = all.findIndex((p) => p.id.toLowerCase() === project.id.toLowerCase());
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const firmwares = Array.isArray(project.firmwares) && project.firmwares.length > 0
    ? project.firmwares.map(f => ({
        ...f,
        releaseDate: f.releaseDate && f.releaseDate.trim() ? f.releaseDate : currentDate,
      }))
    : [
        {
          version: 'v1.0.0',
          name: `${project.title} Default Build`,
          releaseDate: currentDate,
          firmwareUrl: '',
          flashAddress: '0x00',
          versionNote: 'Initial release build.',
        }
      ];

  const toSave: ProjectDetail = {
    ...project,
    status: project.status || 'draft',
    visibility: project.visibility || (project.status === 'published' ? 'public' : 'draft'),
    publishDate: project.publishDate || currentDate,
    coverImage: normalizeImageUrl(project.coverImage) || project.coverImage,
    projectMdFile: normalizeMarkdownUrl(project.projectMdFile) || null,
    license: project.license || 'MIT',
    flashCount: typeof project.flashCount === 'number' ? project.flashCount : 0,
    featured: Boolean(project.featured ?? project.isFeatured ?? false),
    isFeatured: Boolean(project.featured ?? project.isFeatured ?? false),
    firmwares,
  };

  if (existingIdx >= 0) {
    all[existingIdx] = toSave;
  } else {
    // Insert new project at the beginning of the list
    all.unshift(toSave);
  }

  persistProjects(all);
  return toSave;
}

/**
 * Admin action: toggles featured status of a project or tutorial.
 */
export function toggleFeaturedProject(id: string): boolean {
  if (!id) return false;
  const cleanId = id.trim().toLowerCase();
  const all = getStoredProjects();
  const project = all.find((p) => p.id.toLowerCase() === cleanId);
  if (!project) return false;

  const nextVal = !(project.featured || project.isFeatured);
  project.featured = nextVal;
  project.isFeatured = nextVal;

  persistProjects(all);
  return true;
}

/**
 * Admin action: sets explicit featured status of a project or tutorial.
 */
export function setProjectFeatured(id: string, featured: boolean): boolean {
  if (!id) return false;
  const cleanId = id.trim().toLowerCase();
  const all = getStoredProjects();
  const project = all.find((p) => p.id.toLowerCase() === cleanId);
  if (!project) return false;

  project.featured = featured;
  project.isFeatured = featured;

  persistProjects(all);
  return true;
}

/**
 * Returns all featured public projects and tutorials.
 */
export function getFeaturedProjects(): ProjectDetail[] {
  const publicList = getPublicProjects();
  const explicitlyFeatured = publicList.filter((p) => p.featured || p.isFeatured);
  if (explicitlyFeatured.length > 0) {
    return explicitlyFeatured;
  }
  // Fallback: return top published projects
  return publicList.slice(0, 6);
}

/**
 * Admin action: approves a project, making it published and public.
 */
export function approveProject(id: string): boolean {
  if (!id) return false;
  const cleanId = id.trim().toLowerCase();
  const all = getStoredProjects();
  const project = all.find((p) => p.id.toLowerCase() === cleanId);
  if (!project) return false;

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  project.status = 'published';
  project.visibility = 'public';
  project.publishDate = currentDate;

  persistProjects(all);
  return true;
}

/**
 * Admin action: rejects a project.
 */
export function rejectProject(id: string): boolean {
  if (!id) return false;
  const cleanId = id.trim().toLowerCase();
  const all = getStoredProjects();
  const project = all.find((p) => p.id.toLowerCase() === cleanId);
  if (!project) return false;

  project.status = 'rejected';
  project.visibility = 'draft';

  persistProjects(all);
  return true;
}

/**
 * Deletes a project by ID.
 */
export function deleteProject(id: string): boolean {
  if (!id) return false;
  const cleanId = id.trim().toLowerCase();
  const all = getStoredProjects();
  const filtered = all.filter((p) => p.id.toLowerCase() !== cleanId);

  if (filtered.length !== all.length) {
    persistProjects(filtered);
    return true;
  }
  return false;
}

/**
 * Subscribes to real-time updates when projects are added, edited, or removed.
 */
export function subscribeProjects(callback: (projects: ProjectDetail[]) => void): () => void {
  const handleUpdate = () => callback(getStoredProjects());

  window.addEventListener(UPDATE_EVENT, handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener(UPDATE_EVENT, handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

/**
 * Converts a video URL (YouTube, Vimeo, direct MP4) into an embeddable player URL.
 */
export function parseVideoEmbedUrl(url?: string): { type: 'youtube' | 'vimeo' | 'mp4' | 'unknown'; embedUrl: string } | null {
  if (!url || !url.trim()) return null;
  const clean = url.trim();

  // YouTube (standard watch, shortened youtu.be, or embed)
  const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
    };
  }

  // Direct MP4 / WebM video file
  if (clean.endsWith('.mp4') || clean.endsWith('.webm')) {
    return {
      type: 'mp4',
      embedUrl: clean,
    };
  }

  return {
    type: 'unknown',
    embedUrl: clean,
  };
}

/**
 * Automatically converts GitHub repository blob URLs into direct raw content URLs.
 * e.g. https://github.com/:user/:repo/blob/:branch/path.png -> https://raw.githubusercontent.com/:user/:repo/:branch/path.png
 */
export function normalizeImageUrl(url?: string): string {
  if (!url || !url.trim()) return '';
  const clean = url.trim();

  // GitHub blob link: https://github.com/:user/:repo/blob/:branch/...
  const githubBlobRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i;
  const match = clean.match(githubBlobRegex);
  if (match) {
    const [, user, repo, rest] = match;
    return `https://raw.githubusercontent.com/${user}/${repo}/${rest}`;
  }

  return clean;
}

/**
 * Automatically converts any GitHub markdown URL (blob, raw, or branch direct)
 * into a CORS-friendly raw.githubusercontent.com URL.
 */
export function normalizeMarkdownUrl(url?: string | null): string {
  if (!url || !url.trim()) return '';
  const clean = url.trim();

  // If already raw.githubusercontent.com, return as-is
  if (/^https?:\/\/raw\.githubusercontent\.com\//i.test(clean)) {
    return clean;
  }

  // 1. https://github.com/:user/:repo/(blob|raw)/:branch/:path...
  const blobOrRawRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+)$/i;
  const match1 = clean.match(blobOrRawRegex);
  if (match1) {
    const [, user, repo, rest] = match1;
    return `https://raw.githubusercontent.com/${user}/${repo}/${rest}`;
  }

  // 2. https://github.com/:user/:repo/:branch/:path... (where path ends with .md or has slashes)
  const branchPathRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+\.md)$/i;
  const match2 = clean.match(branchPathRegex);
  if (match2) {
    const [, user, repo, branch, path] = match2;
    return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
  }

  return clean;
}
