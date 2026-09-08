import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';


// ─── Authors ──────────────────────────────────────────────────────────────────
export const authors = sqliteTable('authors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  githubUrl: text('github_url'),
  websiteUrl: text('website_url'),
  socialPlatform: text('social_platform'),
  socialUrl: text('social_url'),
  instagramUrl: text('instagram_url'),
  youtubeUrl: text('youtube_url'),
  linkedinUrl: text('linkedin_url'),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`),
});

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  iconName: text('icon_name'),
  color: text('color'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  shortDescription: text('short_description').notNull(),
  description: text('description').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  authorId: integer('author_id').references(() => authors.id),
  difficulty: text('difficulty', { enum: ['beginner', 'intermediate', 'advanced'] }).notNull().default('beginner'),
  estimatedMinutes: integer('estimated_minutes'),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  isCommunity: integer('is_community', { mode: 'boolean' }).notNull().default(false),
  isOfficial: integer('is_official', { mode: 'boolean' }).notNull().default(true),
  coverImageUrl: text('cover_image_url'),
  videoUrl: text('video_url'),
  githubUrl: text('github_url'),
  exampleCode: text('example_code'),
  firmwareUrl: text('firmware_url'),
  platformioConfig: text('platformio_config'),
  viewCount: integer('view_count').notNull().default(0),
  likeCount: integer('like_count').notNull().default(0),
  flashCount: integer('flash_count').notNull().default(0),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`),
  publishedAt: integer('published_at'),
});

// ─── Project Hardware Requirements ────────────────────────────────────────────
export const projectHardware = sqliteTable('project_hardware', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  isRequired: integer('is_required', { mode: 'boolean' }).notNull().default(true),
  purchaseUrl: text('purchase_url'),
  notes: text('notes'),
});

// ─── Libraries ────────────────────────────────────────────────────────────────
export const libraries = sqliteTable('libraries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  version: text('version'),
  description: text('description'),
  repositoryUrl: text('repository_url'),
  platformioLibId: text('platformio_lib_id'),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// ─── Project Libraries (join) ─────────────────────────────────────────────────
export const projectLibraries = sqliteTable('project_libraries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  libraryId: integer('library_id').notNull().references(() => libraries.id),
  versionConstraint: text('version_constraint'),
});

// ─── Project Tags (join) ──────────────────────────────────────────────────────
export const projectTags = sqliteTable('project_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  tagId: integer('tag_id').notNull().references(() => tags.id),
});

// ─── Tutorials ────────────────────────────────────────────────────────────────
export const tutorials = sqliteTable('tutorials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  stepNumber: integer('step_number').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  codeSnippet: text('code_snippet'),
  codeLanguage: text('code_language').default('cpp'),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// ─── Firmware Versions ────────────────────────────────────────────────────────
export const firmwareVersions = sqliteTable('firmware_versions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id),
  version: text('version').notNull(),
  changelog: text('changelog'),
  downloadUrl: text('download_url').notNull(),
  fileSize: integer('file_size'),
  sha256: text('sha256'),
  isLatest: integer('is_latest', { mode: 'boolean' }).notNull().default(false),
  targetChip: text('target_chip').default('ESP32-S3'),
  flashOffset: integer('flash_offset').default(0),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const projectsRelations = relations(projects, ({ one, many }) => ({
  category: one(categories, { fields: [projects.categoryId], references: [categories.id] }),
  author: one(authors, { fields: [projects.authorId], references: [authors.id] }),
  hardware: many(projectHardware),
  projectLibraries: many(projectLibraries),
  projectTags: many(projectTags),
  tutorials: many(tutorials),
  firmwareVersions: many(firmwareVersions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  projects: many(projects),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  projects: many(projects),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  projectTags: many(projectTags),
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, { fields: [projectTags.projectId], references: [projects.id] }),
  tag: one(tags, { fields: [projectTags.tagId], references: [tags.id] }),
}));

export const projectLibrariesRelations = relations(projectLibraries, ({ one }) => ({
  project: one(projects, { fields: [projectLibraries.projectId], references: [projects.id] }),
  library: one(libraries, { fields: [projectLibraries.libraryId], references: [libraries.id] }),
}));

export const projectHardwareRelations = relations(projectHardware, ({ one }) => ({
  project: one(projects, { fields: [projectHardware.projectId], references: [projects.id] }),
}));

export const tutorialsRelations = relations(tutorials, ({ one }) => ({
  project: one(projects, { fields: [tutorials.projectId], references: [projects.id] }),
}));

export const firmwareVersionsRelations = relations(firmwareVersions, ({ one }) => ({
  project: one(projects, { fields: [firmwareVersions.projectId], references: [projects.id] }),
}));

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  supabaseUid: text('supabase_uid').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  githubUrl: text('github_url'),
  websiteUrl: text('website_url'),
  socialPlatform: text('social_platform'),
  socialUrl: text('social_url'),
  instagramUrl: text('instagram_url'),
  youtubeUrl: text('youtube_url'),
  linkedinUrl: text('linkedin_url'),
  role: text('role', { enum: ['user', 'author', 'admin'] }).notNull().default('user'),
  status: text('status', { enum: ['active', 'suspended'] }).notNull().default('active'),
  authorId: integer('author_id').references(() => authors.id),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`),
  lastSignInAt: integer('last_sign_in_at'),
});

// ─── Author Applications ──────────────────────────────────────────────────────
export const authorApplications = sqliteTable('author_applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  bio: text('bio').notNull(),
  githubUrl: text('github_url'),
  hardwareExperience: text('hardware_experience').notNull(),
  sampleProjectIdeas: text('sample_project_ideas').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  adminNotes: text('admin_notes'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`),
  reviewedAt: integer('reviewed_at'),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  author: one(authors, { fields: [users.authorId], references: [authors.id] }),
  applications: many(authorApplications),
}));

export const authorApplicationsRelations = relations(authorApplications, ({ one }) => ({
  user: one(users, { fields: [authorApplications.userId], references: [users.id] }),
  reviewer: one(users, { fields: [authorApplications.reviewedBy], references: [users.id] }),
}));

