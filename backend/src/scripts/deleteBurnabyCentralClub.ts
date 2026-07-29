import { prisma } from '../prismaClient';
import { clearDashboardCache } from '../utils/cache';

async function main() {
    console.log('Removing Burnaby Central Secondary club and converting events to general school events...');

    const club = await prisma.club.findFirst({ where: { name: 'Burnaby Central Secondary' } });
    if (club) {
        // Reassign all associated events to have clubId = null
        const updatedEvents = await prisma.event.updateMany({
            where: { clubId: club.id },
            data: { clubId: null },
        });
        console.log(`Updated ${updatedEvents.count} events to have clubId = null (General School Events).`);

        // Delete the club record
        await prisma.club.delete({ where: { id: club.id } });
        console.log(`Deleted club record for "Burnaby Central Secondary".`);
    } else {
        console.log('Club "Burnaby Central Secondary" not found.');
    }

    clearDashboardCache();
    console.log('Successfully completed cleanup!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
