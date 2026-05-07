import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
    { name: 'Academics & STEM', color: '#3b82f6' },
    { name: 'Arts & Media', color: '#ec4899' },
    { name: 'Athletics', color: '#f97316' },
    { name: 'Volunteering', color: '#10b981' },
    { name: 'Hobbies & Interests', color: '#8b5cf6' },
    { name: 'School & Leadership', color: '#eab308' },
    { name: 'Culture & Community', color: '#14b8a6' },
    { name: 'Business & Entrepreneurship', color: '#4f46e5' }
];

const clubCategoryMap: Record<string, string> = {
    'art club': 'Arts & Media',
    'badminton club': 'Athletics',
    'bcss stream keepers': 'Volunteering',
    'black excellence': 'Culture & Community',
    'bollywood club (formerly bhangra)': 'Arts & Media',
    'burnaby central robotics club': 'Academics & STEM',
    'business club': 'Business & Entrepreneurship',
    'central debate club': 'Academics & STEM',
    'central sports council': 'Athletics',
    'central\'s muslim student association': 'Culture & Community',
    'chess club': 'Hobbies & Interests',
    'community club': 'Volunteering',
    'computing club': 'Academics & STEM',
    'connect media': 'Business & Entrepreneurship',
    'craft club': 'Hobbies & Interests',
    'crochet club': 'Hobbies & Interests',
    'emgirls': 'Business & Entrepreneurship',
    'entrepreneurship club': 'Business & Entrepreneurship',
    'environment club': 'Volunteering',
    'film club': 'Arts & Media',
    'good guys': 'Volunteering',
    'grad council': 'School & Leadership',
    'improv club': 'Arts & Media',
    'interac club': 'Volunteering',
    'international connection': 'Culture & Community',
    'k-pop club': 'Arts & Media',
    'literacture club': 'Academics & STEM',
    'math club': 'Academics & STEM',
    'math  club': 'Academics & STEM', // Accounts for double space in CSV
    'peace 4 youth': 'Culture & Community',
    'rubik cube club': 'Hobbies & Interests',
    'rugby club': 'Athletics',
    'social justice club': 'Culture & Community',
    'sogi': 'Culture & Community',
    'stem club': 'Academics & STEM',
    'student government': 'School & Leadership',
    'ultimate club': 'Athletics',
    'university challenge club': 'Academics & STEM',
    'wheels of change': 'Volunteering',
    'world in student hands club (wish)': 'Volunteering',
    'biology club': 'Academics & STEM',
    'd&d club': 'Hobbies & Interests',
    'bright minds': 'Academics & STEM',
    'key club': 'Volunteering',
    'computer science club': 'Academics & STEM',
    'debate team': 'Academics & STEM',
};

async function main() {
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: { color: cat.color },
            create: { name: cat.name, color: cat.color }
        });
    }

    const dbClubs = await prisma.club.findMany();
    let updated = 0;

    for (const club of dbClubs) {
        let nameLower = club.name.toLowerCase().trim();
        let targetCategory = clubCategoryMap[nameLower];

        if (!targetCategory) {
            targetCategory = 'Hobbies & Interests'; // Default fallback
            console.log(`Unmapped club: ${club.name}`);
        }

        await prisma.club.update({
            where: { id: club.id },
            data: { category: targetCategory }
        });
        updated++;
    }
    console.log(`Updated ${updated} clubs with their new categories.`);
}

main().catch(console.error).finally(async () => { await prisma.$disconnect(); });
