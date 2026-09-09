// communityService.ts
// Handles Likes, Reddit-style Nested Comments, and Bookmarks for UNIHIKER K10 Projects & Tutorials.
// STRICTLY RESTRICTED TO LOGGED-IN PROFILES ONLY.

import { ProjectDetail } from '../../config/projectsData';
import { getAllProjects } from '../projects/projectStorageService';

export interface ProjectComment {
  id: string;
  projectId: string;
  parentId: string | null; // null for top-level, or parent comment id for nested replies
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  authorRole?: string;
  authorId: string; // Strictly required
  content: string;
  createdAt: string; // ISO string
  score: number;
  upvotedBy: string[];
  downvotedBy: string[];
  isDeleted?: boolean;
}

const LIKES_KEY = 'k10_community_likes_v2';
const BOOKMARKS_KEY = 'k10_community_bookmarks_v2';
const COMMENTS_KEY = 'k10_community_comments_v2';
const COMMUNITY_EVENT = 'k10_community_updated';

// Clean up any legacy guest/visitor cache
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('k10_visitor_id');
    localStorage.removeItem('k10_community_likes_v1');
    localStorage.removeItem('k10_community_bookmarks_v1');
    localStorage.removeItem('k10_community_comments_v1');
  }
} catch (e) {
  // Ignore localStorage errors
}

function dispatchCommunityUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COMMUNITY_EVENT));
  }
}

export function subscribeCommunity(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(COMMUNITY_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(COMMUNITY_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

// ─── LIKES ─────────────────────────────────────────────────────────────────────

// Map of projectId -> array of user IDs who liked it
function getLikesMap(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLikesMap(map: Record<string, string[]>): void {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(map));
    dispatchCommunityUpdate();
  } catch (e) {
    console.error('Failed to save likes', e);
  }
}

export function getProjectLikeCount(projectId: string, fallbackBase = 0): number {
  if (!projectId) return fallbackBase;
  const map = getLikesMap();
  const likedUsers = map[projectId.toLowerCase()] || [];
  return Math.max(likedUsers.length, fallbackBase);
}

export function isProjectLiked(projectId: string, userId?: string): boolean {
  if (!projectId || !userId) return false;
  const uid = String(userId).trim().toLowerCase();
  const map = getLikesMap();
  const list = map[projectId.toLowerCase()] || [];
  return list.some((id) => id.toLowerCase() === uid);
}

export function toggleProjectLike(projectId: string, userId?: string, fallbackBase = 0): { liked: boolean; count: number } {
  if (!userId) {
    throw new Error('Please sign in to like projects and tutorials.');
  }
  if (!projectId) return { liked: false, count: 0 };
  const uid = String(userId).trim().toLowerCase();
  const map = getLikesMap();
  const key = projectId.toLowerCase();
  let list = map[key] || [];

  let liked = false;
  if (list.some((id) => id.toLowerCase() === uid)) {
    list = list.filter((id) => id.toLowerCase() !== uid);
    liked = false;
  } else {
    list = [...list, uid];
    liked = true;
  }

  map[key] = list;
  saveLikesMap(map);
  const count = Math.max(list.length, fallbackBase);
  return { liked, count };
}

// ─── BOOKMARKS ─────────────────────────────────────────────────────────────────

// Map of userId -> array of projectIds
function getBookmarksMap(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveBookmarksMap(map: Record<string, string[]>): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(map));
    dispatchCommunityUpdate();
  } catch (e) {
    console.error('Failed to save bookmarks', e);
  }
}

export function isProjectBookmarked(projectId: string, userId?: string): boolean {
  if (!projectId || !userId) return false;
  const uid = String(userId).trim().toLowerCase();
  const map = getBookmarksMap();
  const userBookmarks = map[uid] || [];
  return userBookmarks.some((id) => id.toLowerCase() === projectId.toLowerCase());
}

export function toggleProjectBookmark(projectId: string, userId?: string): boolean {
  if (!userId) {
    throw new Error('Please sign in to bookmark projects and tutorials.');
  }
  if (!projectId) return false;
  const uid = String(userId).trim().toLowerCase();
  const map = getBookmarksMap();
  let userBookmarks = map[uid] || [];
  const cleanId = projectId.toLowerCase();

  let bookmarked = false;
  if (userBookmarks.some((id) => id.toLowerCase() === cleanId)) {
    userBookmarks = userBookmarks.filter((id) => id.toLowerCase() !== cleanId);
    bookmarked = false;
  } else {
    userBookmarks = [cleanId, ...userBookmarks];
    bookmarked = true;
  }

  map[uid] = userBookmarks;
  saveBookmarksMap(map);
  return bookmarked;
}

export function getUserBookmarkedProjectIds(userId?: string): string[] {
  if (!userId) return [];
  const uid = String(userId).trim().toLowerCase();
  const map = getBookmarksMap();
  return map[uid] || [];
}

export function getUserBookmarkedProjects(userId?: string): ProjectDetail[] {
  const ids = getUserBookmarkedProjectIds(userId);
  if (!ids.length) return [];
  const all = getAllProjects();
  const mapById = new Map<string, ProjectDetail>();
  for (const p of all) {
    mapById.set(p.id.toLowerCase(), p);
  }
  const result: ProjectDetail[] = [];
  for (const id of ids) {
    const found = mapById.get(id.toLowerCase());
    if (found) {
      result.push(found);
    }
  }
  return result;
}

// ─── REDDIT-STYLE NESTED COMMENTS ──────────────────────────────────────────────

function getAllStoredComments(): ProjectComment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveAllComments(comments: ProjectComment[]): void {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    dispatchCommunityUpdate();
  } catch (e) {
    console.error('Failed to save comments', e);
  }
}

export function getProjectComments(projectId: string): ProjectComment[] {
  if (!projectId) return [];
  const all = getAllStoredComments();
  const cleanId = projectId.toLowerCase();
  return all.filter((c) => c.projectId.toLowerCase() === cleanId);
}

export function getProjectCommentCount(projectId: string): number {
  if (!projectId) return 0;
  const list = getProjectComments(projectId);
  return list.filter((c) => !c.isDeleted).length;
}

export interface CommentAuthor {
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  id: string; // Strictly required
}

export function addComment(
  projectId: string,
  content: string,
  parentId: string | null = null,
  author?: CommentAuthor
): ProjectComment {
  if (!author || !author.id) {
    throw new Error('Please sign in to post comments or replies.');
  }

  const cleanContent = content.trim();
  if (!cleanContent) {
    throw new Error('Comment content cannot be empty.');
  }

  const authorIdStr = String(author.id).trim();
  const all = getAllStoredComments();
  const newComment: ProjectComment = {
    id: 'cmt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7),
    projectId: projectId.toLowerCase(),
    parentId: parentId || null,
    authorName: author.name || 'Maker',
    authorEmail: author.email,
    authorAvatar: author.avatar,
    authorRole: author.role || 'User',
    authorId: authorIdStr,
    content: cleanContent,
    createdAt: new Date().toISOString(),
    score: 1, // Reddit-style start with 1 upvote from author
    upvotedBy: [authorIdStr],
    downvotedBy: [],
    isDeleted: false,
  };

  all.unshift(newComment);
  saveAllComments(all);
  return newComment;
}

export function voteComment(
  commentId: string,
  type: 'up' | 'down',
  userId?: string
): ProjectComment | null {
  if (!userId) {
    throw new Error('Please sign in to vote on discussion comments.');
  }
  const uid = String(userId).trim().toLowerCase();
  const all = getAllStoredComments();
  const idx = all.findIndex((c) => c.id === commentId);
  if (idx < 0) return null;

  const comment = { ...all[idx] };
  const hasUpvoted = comment.upvotedBy.some((id) => id.toLowerCase() === uid);
  const hasDownvoted = comment.downvotedBy.some((id) => id.toLowerCase() === uid);

  if (type === 'up') {
    if (hasUpvoted) {
      // Remove upvote
      comment.upvotedBy = comment.upvotedBy.filter((id) => id.toLowerCase() !== uid);
    } else {
      // Add upvote, remove downvote if any
      comment.upvotedBy = [...comment.upvotedBy, uid];
      comment.downvotedBy = comment.downvotedBy.filter((id) => id.toLowerCase() !== uid);
    }
  } else {
    if (hasDownvoted) {
      // Remove downvote
      comment.downvotedBy = comment.downvotedBy.filter((id) => id.toLowerCase() !== uid);
    } else {
      // Add downvote, remove upvote if any
      comment.downvotedBy = [...comment.downvotedBy, uid];
      comment.upvotedBy = comment.upvotedBy.filter((id) => id.toLowerCase() !== uid);
    }
  }

  comment.score = comment.upvotedBy.length - comment.downvotedBy.length;
  all[idx] = comment;
  saveAllComments(all);
  return comment;
}

export function deleteComment(commentId: string, _userIdentifier?: string): boolean {
  const all = getAllStoredComments();
  const idx = all.findIndex((c) => c.id === commentId);
  if (idx < 0) return false;

  const comment = all[idx];
  // Check if comment has replies; if it has replies, soft delete to preserve thread structure
  const hasReplies = all.some((c) => c.parentId === commentId);

  if (hasReplies) {
    all[idx] = {
      ...comment,
      isDeleted: true,
      content: '[This comment has been removed by author]',
    };
  } else {
    all.splice(idx, 1);
  }

  saveAllComments(all);
  return true;
}

/**
 * Builds nested comment tree node structure for recursive rendering
 */
export interface CommentTreeNode {
  comment: ProjectComment;
  children: CommentTreeNode[];
}

export function buildCommentTree(comments: ProjectComment[]): CommentTreeNode[] {
  const map = new Map<string, CommentTreeNode>();
  const roots: CommentTreeNode[] = [];

  // Initialize nodes
  for (const comment of comments) {
    map.set(comment.id, { comment, children: [] });
  }

  // Build tree
  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
