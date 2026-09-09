"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const init_1 = require("./init");
const schema_1 = require("./schema");
async function seed() {
    console.log('🌱 Seeding K10 Hub database...');
    // Ensure tables exist first
    await (0, init_1.initDatabase)();
    // ─── Authors ────────────────────────────────────────────────────────────────
    console.log('  Creating authors...');
    await database_1.db.insert(schema_1.authors).values([
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
        },
    ]).onConflictDoNothing();
    // ─── Categories ─────────────────────────────────────────────────────────────
    console.log('  Creating categories...');
    await database_1.db.insert(schema_1.categories).values([
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
    ]).onConflictDoNothing();
    // ─── Tags ───────────────────────────────────────────────────────────────────
    console.log('  Creating tags...');
    await database_1.db.insert(schema_1.tags).values([
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
    ]).onConflictDoNothing();
    // ─── Libraries ──────────────────────────────────────────────────────────────
    console.log('  Creating libraries...');
    await database_1.db.insert(schema_1.libraries).values([
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
    ]).onConflictDoNothing();
    // ─── Get inserted IDs ───────────────────────────────────────────────────────
    const teamAuthor = await database_1.db.query.authors.findFirst({
        where: (a, { eq }) => eq(a.slug, 'k10-hub-team'),
    });
    const fundamentalsCat = await database_1.db.query.categories.findFirst({
        where: (c, { eq }) => eq(c.slug, 'fundamentals'),
    });
    const aiCat = await database_1.db.query.categories.findFirst({
        where: (c, { eq }) => eq(c.slug, 'ai-vision'),
    });
    // ─── Projects (clean - no dummy projects) ───────────────────────────────────
    console.log('  Skipping dummy projects (clean app)...');
    console.log('✅ Database seeded successfully!');
    process.exit(0);
}
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map