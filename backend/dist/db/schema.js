"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorApplicationsRelations = exports.usersRelations = exports.authorApplications = exports.users = exports.firmwareVersionsRelations = exports.tutorialsRelations = exports.projectHardwareRelations = exports.projectLibrariesRelations = exports.projectTagsRelations = exports.tagsRelations = exports.authorsRelations = exports.categoriesRelations = exports.projectsRelations = exports.firmwareVersions = exports.tutorials = exports.projectTags = exports.projectLibraries = exports.libraries = exports.projectHardware = exports.projects = exports.tags = exports.categories = exports.authors = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_orm_2 = require("drizzle-orm");
// ─── Authors ──────────────────────────────────────────────────────────────────
exports.authors = (0, sqlite_core_1.sqliteTable)('authors', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    slug: (0, sqlite_core_1.text)('slug').notNull().unique(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    bio: (0, sqlite_core_1.text)('bio'),
    avatarUrl: (0, sqlite_core_1.text)('avatar_url'),
    githubUrl: (0, sqlite_core_1.text)('github_url'),
    websiteUrl: (0, sqlite_core_1.text)('website_url'),
    socialPlatform: (0, sqlite_core_1.text)('social_platform'),
    socialUrl: (0, sqlite_core_1.text)('social_url'),
    instagramUrl: (0, sqlite_core_1.text)('instagram_url'),
    youtubeUrl: (0, sqlite_core_1.text)('youtube_url'),
    linkedinUrl: (0, sqlite_core_1.text)('linkedin_url'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
});
// ─── Categories ───────────────────────────────────────────────────────────────
exports.categories = (0, sqlite_core_1.sqliteTable)('categories', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    slug: (0, sqlite_core_1.text)('slug').notNull().unique(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    iconName: (0, sqlite_core_1.text)('icon_name'),
    color: (0, sqlite_core_1.text)('color'),
    sortOrder: (0, sqlite_core_1.integer)('sort_order').notNull().default(0),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
});
// ─── Tags ─────────────────────────────────────────────────────────────────────
exports.tags = (0, sqlite_core_1.sqliteTable)('tags', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    slug: (0, sqlite_core_1.text)('slug').notNull().unique(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
});
// ─── Projects ─────────────────────────────────────────────────────────────────
exports.projects = (0, sqlite_core_1.sqliteTable)('projects', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    slug: (0, sqlite_core_1.text)('slug').notNull().unique(),
    title: (0, sqlite_core_1.text)('title').notNull(),
    shortDescription: (0, sqlite_core_1.text)('short_description').notNull(),
    description: (0, sqlite_core_1.text)('description').notNull(),
    categoryId: (0, sqlite_core_1.integer)('category_id').references(() => exports.categories.id),
    authorId: (0, sqlite_core_1.integer)('author_id').references(() => exports.authors.id),
    difficulty: (0, sqlite_core_1.text)('difficulty', { enum: ['beginner', 'intermediate', 'advanced'] }).notNull().default('beginner'),
    estimatedMinutes: (0, sqlite_core_1.integer)('estimated_minutes'),
    isPublished: (0, sqlite_core_1.integer)('is_published', { mode: 'boolean' }).notNull().default(false),
    isFeatured: (0, sqlite_core_1.integer)('is_featured', { mode: 'boolean' }).notNull().default(false),
    isCommunity: (0, sqlite_core_1.integer)('is_community', { mode: 'boolean' }).notNull().default(false),
    isOfficial: (0, sqlite_core_1.integer)('is_official', { mode: 'boolean' }).notNull().default(true),
    coverImageUrl: (0, sqlite_core_1.text)('cover_image_url'),
    videoUrl: (0, sqlite_core_1.text)('video_url'),
    githubUrl: (0, sqlite_core_1.text)('github_url'),
    exampleCode: (0, sqlite_core_1.text)('example_code'),
    firmwareUrl: (0, sqlite_core_1.text)('firmware_url'),
    platformioConfig: (0, sqlite_core_1.text)('platformio_config'),
    viewCount: (0, sqlite_core_1.integer)('view_count').notNull().default(0),
    likeCount: (0, sqlite_core_1.integer)('like_count').notNull().default(0),
    flashCount: (0, sqlite_core_1.integer)('flash_count').notNull().default(0),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
    publishedAt: (0, sqlite_core_1.integer)('published_at'),
});
// ─── Project Hardware Requirements ────────────────────────────────────────────
exports.projectHardware = (0, sqlite_core_1.sqliteTable)('project_hardware', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    projectId: (0, sqlite_core_1.integer)('project_id').notNull().references(() => exports.projects.id),
    name: (0, sqlite_core_1.text)('name').notNull(),
    quantity: (0, sqlite_core_1.integer)('quantity').notNull().default(1),
    isRequired: (0, sqlite_core_1.integer)('is_required', { mode: 'boolean' }).notNull().default(true),
    purchaseUrl: (0, sqlite_core_1.text)('purchase_url'),
    notes: (0, sqlite_core_1.text)('notes'),
});
// ─── Libraries ────────────────────────────────────────────────────────────────
exports.libraries = (0, sqlite_core_1.sqliteTable)('libraries', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    slug: (0, sqlite_core_1.text)('slug').notNull().unique(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    version: (0, sqlite_core_1.text)('version'),
    description: (0, sqlite_core_1.text)('description'),
    repositoryUrl: (0, sqlite_core_1.text)('repository_url'),
    platformioLibId: (0, sqlite_core_1.text)('platformio_lib_id'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
});
// ─── Project Libraries (join) ─────────────────────────────────────────────────
exports.projectLibraries = (0, sqlite_core_1.sqliteTable)('project_libraries', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    projectId: (0, sqlite_core_1.integer)('project_id').notNull().references(() => exports.projects.id),
    libraryId: (0, sqlite_core_1.integer)('library_id').notNull().references(() => exports.libraries.id),
    versionConstraint: (0, sqlite_core_1.text)('version_constraint'),
});
// ─── Project Tags (join) ──────────────────────────────────────────────────────
exports.projectTags = (0, sqlite_core_1.sqliteTable)('project_tags', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    projectId: (0, sqlite_core_1.integer)('project_id').notNull().references(() => exports.projects.id),
    tagId: (0, sqlite_core_1.integer)('tag_id').notNull().references(() => exports.tags.id),
});
// ─── Tutorials ────────────────────────────────────────────────────────────────
exports.tutorials = (0, sqlite_core_1.sqliteTable)('tutorials', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    projectId: (0, sqlite_core_1.integer)('project_id').notNull().references(() => exports.projects.id),
    stepNumber: (0, sqlite_core_1.integer)('step_number').notNull(),
    title: (0, sqlite_core_1.text)('title').notNull(),
    content: (0, sqlite_core_1.text)('content').notNull(),
    imageUrl: (0, sqlite_core_1.text)('image_url'),
    codeSnippet: (0, sqlite_core_1.text)('code_snippet'),
    codeLanguage: (0, sqlite_core_1.text)('code_language').default('cpp'),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
});
// ─── Firmware Versions ────────────────────────────────────────────────────────
exports.firmwareVersions = (0, sqlite_core_1.sqliteTable)('firmware_versions', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    projectId: (0, sqlite_core_1.integer)('project_id').references(() => exports.projects.id),
    version: (0, sqlite_core_1.text)('version').notNull(),
    changelog: (0, sqlite_core_1.text)('changelog'),
    downloadUrl: (0, sqlite_core_1.text)('download_url').notNull(),
    fileSize: (0, sqlite_core_1.integer)('file_size'),
    sha256: (0, sqlite_core_1.text)('sha256'),
    isLatest: (0, sqlite_core_1.integer)('is_latest', { mode: 'boolean' }).notNull().default(false),
    targetChip: (0, sqlite_core_1.text)('target_chip').default('ESP32-S3'),
    flashOffset: (0, sqlite_core_1.integer)('flash_offset').default(0),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
});
// ─── Relations ────────────────────────────────────────────────────────────────
exports.projectsRelations = (0, drizzle_orm_1.relations)(exports.projects, ({ one, many }) => ({
    category: one(exports.categories, { fields: [exports.projects.categoryId], references: [exports.categories.id] }),
    author: one(exports.authors, { fields: [exports.projects.authorId], references: [exports.authors.id] }),
    hardware: many(exports.projectHardware),
    projectLibraries: many(exports.projectLibraries),
    projectTags: many(exports.projectTags),
    tutorials: many(exports.tutorials),
    firmwareVersions: many(exports.firmwareVersions),
}));
exports.categoriesRelations = (0, drizzle_orm_1.relations)(exports.categories, ({ many }) => ({
    projects: many(exports.projects),
}));
exports.authorsRelations = (0, drizzle_orm_1.relations)(exports.authors, ({ many }) => ({
    projects: many(exports.projects),
}));
exports.tagsRelations = (0, drizzle_orm_1.relations)(exports.tags, ({ many }) => ({
    projectTags: many(exports.projectTags),
}));
exports.projectTagsRelations = (0, drizzle_orm_1.relations)(exports.projectTags, ({ one }) => ({
    project: one(exports.projects, { fields: [exports.projectTags.projectId], references: [exports.projects.id] }),
    tag: one(exports.tags, { fields: [exports.projectTags.tagId], references: [exports.tags.id] }),
}));
exports.projectLibrariesRelations = (0, drizzle_orm_1.relations)(exports.projectLibraries, ({ one }) => ({
    project: one(exports.projects, { fields: [exports.projectLibraries.projectId], references: [exports.projects.id] }),
    library: one(exports.libraries, { fields: [exports.projectLibraries.libraryId], references: [exports.libraries.id] }),
}));
exports.projectHardwareRelations = (0, drizzle_orm_1.relations)(exports.projectHardware, ({ one }) => ({
    project: one(exports.projects, { fields: [exports.projectHardware.projectId], references: [exports.projects.id] }),
}));
exports.tutorialsRelations = (0, drizzle_orm_1.relations)(exports.tutorials, ({ one }) => ({
    project: one(exports.projects, { fields: [exports.tutorials.projectId], references: [exports.projects.id] }),
}));
exports.firmwareVersionsRelations = (0, drizzle_orm_1.relations)(exports.firmwareVersions, ({ one }) => ({
    project: one(exports.projects, { fields: [exports.firmwareVersions.projectId], references: [exports.projects.id] }),
}));
// ─── Users ────────────────────────────────────────────────────────────────────
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    supabaseUid: (0, sqlite_core_1.text)('supabase_uid').notNull().unique(),
    email: (0, sqlite_core_1.text)('email').notNull().unique(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    avatarUrl: (0, sqlite_core_1.text)('avatar_url'),
    bio: (0, sqlite_core_1.text)('bio'),
    githubUrl: (0, sqlite_core_1.text)('github_url'),
    websiteUrl: (0, sqlite_core_1.text)('website_url'),
    socialPlatform: (0, sqlite_core_1.text)('social_platform'),
    socialUrl: (0, sqlite_core_1.text)('social_url'),
    instagramUrl: (0, sqlite_core_1.text)('instagram_url'),
    youtubeUrl: (0, sqlite_core_1.text)('youtube_url'),
    linkedinUrl: (0, sqlite_core_1.text)('linkedin_url'),
    role: (0, sqlite_core_1.text)('role', { enum: ['user', 'author', 'admin'] }).notNull().default('user'),
    status: (0, sqlite_core_1.text)('status', { enum: ['active', 'suspended'] }).notNull().default('active'),
    authorId: (0, sqlite_core_1.integer)('author_id').references(() => exports.authors.id),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
    lastSignInAt: (0, sqlite_core_1.integer)('last_sign_in_at'),
});
// ─── Author Applications ──────────────────────────────────────────────────────
exports.authorApplications = (0, sqlite_core_1.sqliteTable)('author_applications', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id').notNull().references(() => exports.users.id),
    bio: (0, sqlite_core_1.text)('bio').notNull(),
    githubUrl: (0, sqlite_core_1.text)('github_url'),
    hardwareExperience: (0, sqlite_core_1.text)('hardware_experience').notNull(),
    sampleProjectIdeas: (0, sqlite_core_1.text)('sample_project_ideas').notNull(),
    status: (0, sqlite_core_1.text)('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
    adminNotes: (0, sqlite_core_1.text)('admin_notes'),
    reviewedBy: (0, sqlite_core_1.integer)('reviewed_by').references(() => exports.users.id),
    createdAt: (0, sqlite_core_1.integer)('created_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').default((0, drizzle_orm_2.sql) `(unixepoch())`),
    reviewedAt: (0, sqlite_core_1.integer)('reviewed_at'),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    author: one(exports.authors, { fields: [exports.users.authorId], references: [exports.authors.id] }),
    applications: many(exports.authorApplications),
}));
exports.authorApplicationsRelations = (0, drizzle_orm_1.relations)(exports.authorApplications, ({ one }) => ({
    user: one(exports.users, { fields: [exports.authorApplications.userId], references: [exports.users.id] }),
    reviewer: one(exports.users, { fields: [exports.authorApplications.reviewedBy], references: [exports.users.id] }),
}));
//# sourceMappingURL=schema.js.map