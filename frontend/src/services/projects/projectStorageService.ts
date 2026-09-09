// projectStorageService.ts
// Client-side persistence and CRUD management for UNIHIKER K10 projects and tutorials.

import { ProjectDetail } from '../../config/projectsData';

const STORAGE_KEY = 'k10_projects_store_v2';
const UPDATE_EVENT = 'k10_projects_updated';

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
      // Clean up legacy sample project if present
      const filtered = parsed.filter((p) => p && p.id && p.id !== 'esp32-p4-display');
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
