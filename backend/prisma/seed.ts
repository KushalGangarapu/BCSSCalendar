import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({});

async function main() {
    // 1. Create default admin user
    const hashedPassword = await bcrypt.hash('burnabycentral', 10);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
        },
    });

    // 2. Create some default clubs
    const clubs = [
        {
            name: 'Key Club',
            category: 'Volunteering',
            description: 'The oldest and largest service program for high school students.',
            instagram: 'https://instagram.com/bcsskeyclub',
        },
        {
            name: 'Computer Science Club',
            category: 'Academics',
            description: 'Learn to code, build projects, and prepare for hackathons.',
            discord: 'https://discord.gg/example',
        },
        {
            name: 'Debate Team',
            category: 'Arts & Speaking',
            description: 'Discuss current events and improve public speaking skills.',
        },
    ];

    for (const club of clubs) {
        await prisma.club.upsert({
            where: { name: club.name },
            update: {},
            create: club,
        });
    }

    // 3. Initialize metrics
    const metrics = await prisma.metrics.findFirst();
    if (!metrics) {
        await prisma.metrics.create({
            data: {
                activeUsers: 153,
                portalSignups: 42,
            },
        });
    }

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
