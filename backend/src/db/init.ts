import { client } from '../config/database';

export async function initDatabase(): Promise<void> {
  // Create tables if they do not exist

  await client.execute(`
    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      bio TEXT,
      avatar_url TEXT,
      github_url TEXT,
      website_url TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      icon_name TEXT,
      color TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch())
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      author_id INTEGER REFERENCES authors(id),
      difficulty TEXT NOT NULL DEFAULT 'beginner',
      estimated_minutes INTEGER,
      is_published INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_community INTEGER NOT NULL DEFAULT 0,
      is_official INTEGER NOT NULL DEFAULT 1,
      cover_image_url TEXT,
      video_url TEXT,
      github_url TEXT,
      example_code TEXT,
      firmware_url TEXT,
      platformio_config TEXT,
      view_count INTEGER NOT NULL DEFAULT 0,
      like_count INTEGER NOT NULL DEFAULT 0,
      flash_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      published_at INTEGER
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS project_hardware (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      is_required INTEGER NOT NULL DEFAULT 1,
      purchase_url TEXT,
      notes TEXT
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS libraries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      version TEXT,
      description TEXT,
      repository_url TEXT,
      platformio_lib_id TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supabase_uid TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      github_url TEXT,
      website_url TEXT,
      social_platform TEXT,
      social_url TEXT,
      instagram_url TEXT,
      youtube_url TEXT,
      linkedin_url TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      author_id INTEGER REFERENCES authors(id),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      last_sign_in_at INTEGER
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS author_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      bio TEXT NOT NULL,
      github_url TEXT,
      hardware_experience TEXT NOT NULL,
      sample_project_ideas TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      reviewed_by INTEGER REFERENCES users(id),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      reviewed_at INTEGER
    );
  `);

  // ─── Safe migrations for existing tables ────────────────────────────────────
  const userColumns = [
    'bio TEXT',
    'github_url TEXT',
    'website_url TEXT',
    'social_platform TEXT',
    'social_url TEXT',
    'instagram_url TEXT',
    'youtube_url TEXT',
    'linkedin_url TEXT',
  ];

  for (const col of userColumns) {
    try {
      await client.execute(`ALTER TABLE users ADD COLUMN ${col}`);
    } catch {
      // Column already exists
    }
  }

  const authorColumns = [
    'social_platform TEXT',
    'social_url TEXT',
    'instagram_url TEXT',
    'youtube_url TEXT',
    'linkedin_url TEXT',
  ];

  for (const col of authorColumns) {
    try {
      await client.execute(`ALTER TABLE authors ADD COLUMN ${col}`);
    } catch {
      // Column already exists
    }
  }
}

