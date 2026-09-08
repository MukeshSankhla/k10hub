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
    // ─── Projects ───────────────────────────────────────────────────────────────
    console.log('  Creating projects...');
    await database_1.db.insert(schema_1.projects).values([
        {
            slug: 'led-blink',
            title: 'LED Blink',
            shortDescription: 'Your first K10 project — blink the onboard RGB LED and learn the basics of the Arduino sketch structure.',
            description: `# LED Blink\n\nThe classic first project for any hardware platform. Control the K10 RGB LED.\n\n## What you will learn\n- Arduino sketch structure\n- Digital output control\n- RGB LED color mixing`,
            categoryId: fundamentalsCat?.id,
            authorId: teamAuthor?.id,
            difficulty: 'beginner',
            estimatedMinutes: 10,
            isPublished: true,
            isFeatured: true,
            isOfficial: true,
            exampleCode: '#include <K10.h>\n\nvoid setup() {\n  K10.begin();\n}\n\nvoid loop() {\n  K10.setRGB(255, 0, 0);\n  delay(500);\n  K10.setRGB(0, 255, 0);\n  delay(500);\n  K10.setRGB(0, 0, 255);\n  delay(500);\n}',
            coverImageUrl: '/images/Hero.png',
            publishedAt: Math.floor(Date.now() / 1000),
        },
        {
            slug: 'push-button',
            title: 'Push Button Interaction',
            shortDescription: 'Use the K10 physical button to trigger display output and LED feedback.',
            description: `# Push Button Interaction\n\nRead the physical button and respond with display and LED feedback.`,
            categoryId: fundamentalsCat?.id,
            authorId: teamAuthor?.id,
            difficulty: 'beginner',
            estimatedMinutes: 15,
            isPublished: true,
            isFeatured: true,
            isOfficial: true,
            coverImageUrl: '/images/IOs.png',
            publishedAt: Math.floor(Date.now() / 1000),
        },
        {
            slug: 'face-detection',
            title: 'Face Detection',
            shortDescription: 'Detect human faces in real time using the K10 camera and onboard AI — no cloud, no IDE setup required.',
            description: `# Face Detection\n\nUse the K10 built-in camera and ESP32-S3 neural acceleration to detect faces in real time.`,
            categoryId: aiCat?.id,
            authorId: teamAuthor?.id,
            difficulty: 'advanced',
            estimatedMinutes: 45,
            isPublished: true,
            isFeatured: true,
            isOfficial: true,
            coverImageUrl: '/images/Example.png',
            publishedAt: Math.floor(Date.now() / 1000),
        },
    ]).onConflictDoNothing();
    // ─── Hardware for all projects ───────────────────────────────────────────────
    const allProjects = await database_1.db.query.projects.findMany({
        where: (p, { eq }) => eq(p.isPublished, true),
    });
    if (allProjects.length > 0) {
        console.log('  Adding hardware requirements...');
        await database_1.db.insert(schema_1.projectHardware).values(allProjects.map((p) => ({
            projectId: p.id,
            name: 'UNIHIKER K10',
            quantity: 1,
            isRequired: true,
            purchaseUrl: 'https://www.dfrobot.com/product-2671.html',
        }))).onConflictDoNothing();
    }
    console.log('✅ Database seeded successfully!');
    process.exit(0);
}
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map