import { client } from '../config/database';
import { initDatabase } from './init';
import { authors, categories, tags, libraries } from './schema';
import { db } from '../config/database';

export async function resetDatabase() {
  console.log('🧹 Clearing all data from K10 Hub database...');

  // Disable foreign keys temporarily during wipe
  await client.execute('PRAGMA foreign_keys = OFF;');

  const tablesToWipe = [
    'author_applications',
    'project_hardware',
    'project_libraries',
    'project_tags',
    'firmware_versions',
    'tutorials',
    'projects',
    'users',
    'authors',
    'categories',
    'tags',
    'libraries',
  ];

  for (const table of tablesToWipe) {
    try {
      await client.execute(`DELETE FROM "${table}";`);
      console.log(`  Cleared ${table}`);
    } catch (err) {
      console.warn(`  Could not wipe ${table}:`, err);
    }
  }

  // Reset auto-increment sequences
  try {
    await client.execute('DELETE FROM sqlite_sequence;');
  } catch {
    // sqlite_sequence might be empty or not present
  }

  await client.execute('PRAGMA foreign_keys = ON;');

  console.log('🔨 Re-initializing table structures...');
  await initDatabase();

  console.log('🌱 Seeding fresh initial lookup tables...');

  // 1. Authors
  await db.insert(authors).values([
    {
      slug: 'k10-hub-team',
      name: 'K10 Hub Team',
      bio: 'Official K10 Hub project team — curated projects for the UNIHIKER K10.',
      githubUrl: 'https://github.com/k10hub',
    },
    {
      slug: 'mukesh-sankhla',
      name: 'Mukesh Sankhla',
      bio: 'Maker, educator and the creator of K10 Hub.',
      githubUrl: 'https://github.com/mukeshsankhla',
      websiteUrl: 'https://mukeshsankhla.github.io',
      socialPlatform: 'linkedin',
      linkedinUrl: 'https://www.linkedin.com/in/mukeshsankhla/',
    },
  ]);

  // 2. Categories
  await db.insert(categories).values([
    {
      slug: 'fundamentals',
      name: 'Fundamentals',
      description: 'Core electronics — GPIO, LEDs, buttons and basic hardware interaction.',
      iconName: 'cpu',
      color: '#1D4ED8',
      sortOrder: 1,
    },
    {
      slug: 'sensors-io',
      name: 'Sensors & I/O',
      description: 'Explore the K10 sensors, display, camera, audio and connectivity.',
      iconName: 'activity',
      color: '#047857',
      sortOrder: 2,
    },
    {
      slug: 'ai-vision',
      name: 'AI & Vision',
      description: 'Computer vision, face detection, recognition and AI applications.',
      iconName: 'eye',
      color: '#6D28D9',
      sortOrder: 3,
    },
    {
      slug: 'community',
      name: 'Community',
      description: 'Projects built by makers, developers and educators around the world.',
      iconName: 'users',
      color: '#B45309',
      sortOrder: 4,
    },
  ]);

  // 3. Tags
  await db.insert(tags).values([
    { slug: 'led', name: 'LED' },
    { slug: 'gpio', name: 'GPIO' },
    { slug: 'button', name: 'Button' },
    { slug: 'display', name: 'Display' },
    { slug: 'camera', name: 'Camera' },
    { slug: 'wifi', name: 'Wi-Fi' },
    { slug: 'bluetooth', name: 'Bluetooth' },
    { slug: 'audio', name: 'Audio' },
    { slug: 'sensor', name: 'Sensor' },
    { slug: 'accelerometer', name: 'Accelerometer' },
    { slug: 'face-detection', name: 'Face Detection' },
    { slug: 'face-recognition', name: 'Face Recognition' },
    { slug: 'computer-vision', name: 'Computer Vision' },
    { slug: 'arduino', name: 'Arduino' },
    { slug: 'micropython', name: 'MicroPython' },
    { slug: 'tts', name: 'Text-to-Speech' },
    { slug: 'asr', name: 'Speech Recognition' },
    { slug: 'iot', name: 'IoT' },
    { slug: 'rgb', name: 'RGB' },
    { slug: 'beginners', name: 'Beginners' },
  ]);

  // 4. Libraries
  await db.insert(libraries).values([
    {
      slug: 'unihiker-k10-arduino',
      name: 'UNIHIKER K10 Arduino Library',
      description: 'Official Arduino library for the UNIHIKER K10.',
      repositoryUrl: 'https://github.com/DFRobot/UNIHIKER-K10',
    },
    {
      slug: 'lvgl',
      name: 'LVGL',
      version: '8.3.x',
      description: 'Light and Versatile Graphics Library.',
      repositoryUrl: 'https://github.com/lvgl/lvgl',
    },
  ]);

  console.log('✨ Fresh reset complete! 0 dummy users, 0 dummy projects, 0 dummy tutorials.');
}

if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Reset failed:', err);
      process.exit(1);
    });
}
