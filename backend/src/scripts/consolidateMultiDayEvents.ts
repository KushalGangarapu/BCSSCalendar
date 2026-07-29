import { prisma } from '../prismaClient';
import { clearDashboardCache } from '../utils/cache';

async function main() {
    console.log('Consolidating multi-day events with date & endDate...');

    // List of multi-day event spans to consolidate
    const multiDaySpans = [
        {
            title: 'Spring Vacation',
            startDateStr: '2026-03-16T00:00:00-07:00',
            endDateStr: '2026-03-27T23:59:59-07:00',
            tags: ['School & Leadership'],
        },
        {
            title: 'Cultural Appreciation Week',
            startDateStr: '2026-04-13T00:00:00-07:00',
            endDateStr: '2026-04-17T23:59:59-07:00',
            tags: ['Culture & Community'],
        },
        {
            title: 'Numeracy 10/Literacy 10/Literacy 12 Assessment Week',
            startDateStr: '2026-04-20T00:00:00-07:00',
            endDateStr: '2026-04-24T23:59:59-07:00',
            tags: ['Academics & STEM'],
        },
        {
            title: 'Whistler Music Fest',
            startDateStr: '2026-05-01T00:00:00-07:00',
            endDateStr: '2026-05-02T23:59:59-07:00',
            tags: ['Arts & Media'],
        },
        {
            title: 'Mental Health Week',
            startDateStr: '2026-05-04T00:00:00-07:00',
            endDateStr: '2026-05-08T23:59:59-07:00',
            tags: ['Culture & Community'],
        },
        {
            title: 'Dance Company Auditions',
            startDateStr: '2026-05-19T00:00:00-07:00',
            endDateStr: '2026-05-21T23:59:59-07:00',
            tags: ['Arts & Media'],
        },
        {
            title: 'Burnaby Central Pride Week',
            startDateStr: '2026-06-08T00:00:00-07:00',
            endDateStr: '2026-06-12T23:59:59-07:00',
            tags: ['Culture & Community'],
        },
        {
            title: 'Alternate Schedule Week',
            startDateStr: '2026-06-22T00:00:00-07:00',
            endDateStr: '2026-06-25T23:59:59-07:00',
            tags: ['School & Leadership'],
        },
    ];

    const club = await prisma.club.findFirst({ where: { name: 'Burnaby Central Secondary' } });
    if (!club) {
        console.error('Club Burnaby Central Secondary not found.');
        return;
    }

    for (const span of multiDaySpans) {
        // Delete individual daily records for this title
        await prisma.event.deleteMany({
            where: {
                title: span.title,
                clubId: club.id,
            }
        });

        // Create a single consolidated multi-day event
        await prisma.event.create({
            data: {
                title: span.title,
                date: new Date(span.startDateStr),
                endDate: new Date(span.endDateStr),
                clubId: club.id,
                tags: span.tags,
            }
        });
        console.log(`Consolidated multi-day event: ${span.title} (${span.startDateStr.split('T')[0]} to ${span.endDateStr.split('T')[0]})`);
    }

    clearDashboardCache();
    console.log('Successfully updated multi-day events!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
