import { prisma } from '../prismaClient';
import { clearDashboardCache } from '../utils/cache';

async function main() {
    console.log('Seeding 2026 School Events from Calendar Images...');

    // 1. Ensure Category "School & Leadership" exists
    await prisma.category.upsert({
        where: { name: 'School & Leadership' },
        update: {},
        create: { name: 'School & Leadership', color: '#eab308' }
    });

    // 2. Ensure Club "Burnaby Central Secondary" exists
    const club = await prisma.club.upsert({
        where: { name: 'Burnaby Central Secondary' },
        update: {},
        create: {
            name: 'Burnaby Central Secondary',
            category: 'School & Leadership',
            description: 'Official school-wide calendar events, holidays, schedules, and academic deadlines for Burnaby Central Secondary School.',
            instagram: 'https://instagram.com/burnabycentral',
        }
    });

    const clubId = club.id;

    // Define all events from the 4 photos for 2026
    const rawEvents: Array<{ title: string; dateStr: string; tags: string[]; description?: string }> = [
        // --- MARCH 2026 ---
        { title: 'Emergency Drill', dateStr: '2026-03-02T00:00:00-08:00', tags: ['School & Leadership'] },
        { title: 'Valedictorian Announced', dateStr: '2026-03-02T12:15:00-08:00', tags: ['School & Leadership'] },
        { title: 'PAC MEETING', dateStr: '2026-03-02T19:00:00-08:00', tags: ['School & Leadership'] },
        { title: 'Grade 9 Immunizations', dateStr: '2026-03-03T00:00:00-08:00', tags: ['School & Leadership'] },
        { title: 'Math Contest', dateStr: '2026-03-04T00:00:00-08:00', tags: ['Academics & STEM'] },
        { title: 'Teacher Conference Sign Up Online CLOSES', dateStr: '2026-03-05T15:00:00-08:00', tags: ['School & Leadership'] },
        { title: 'Missing Grad Composite Photos', dateStr: '2026-03-06T09:00:00-08:00', tags: ['School & Leadership'] },
        { title: 'International Lunch Meeting', dateStr: '2026-03-06T12:15:00-08:00', tags: ['Culture & Community'] },
        { title: 'Grade 8 Semester 2 ADST Rotation 1 ENDS', dateStr: '2026-03-09T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Grade 8 Semester 2 ADST Rotation 2 BEGINS', dateStr: '2026-03-10T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Semester 2 AP Courses: Exam Ordering Deadline', dateStr: '2026-03-12T12:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Last Day Before Spring Break', dateStr: '2026-03-13T00:00:00-07:00', tags: ['School & Leadership'] },
        // Spring Vacation March 16-20 & March 23-27
        { title: 'Spring Vacation', dateStr: '2026-03-16T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Spring Vacation', dateStr: '2026-03-17T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Spring Vacation', dateStr: '2026-03-18T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Spring Vacation', dateStr: '2026-03-19T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Spring Vacation', dateStr: '2026-03-20T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Spring Vacation', dateStr: '2026-03-23T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Spring Vacation', dateStr: '2026-03-24T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Spring Vacation', dateStr: '2026-03-25T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Spring Vacation', dateStr: '2026-03-26T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Spring Vacation', dateStr: '2026-03-27T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'School Reopens After Spring Break', dateStr: '2026-03-30T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'International Transgender Day of Visibility', dateStr: '2026-03-31T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Math Contest', dateStr: '2026-03-31T00:00:00-07:00', tags: ['Academics & STEM'] },

        // --- APRIL 2026 ---
        { title: 'Math Contest', dateStr: '2026-04-01T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Grad Group Photo', dateStr: '2026-04-02T10:45:00-07:00', tags: ['School & Leadership'] },
        { title: 'Good Friday', dateStr: '2026-04-03T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Easter Monday', dateStr: '2026-04-06T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'District Band Night', dateStr: '2026-04-07T00:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'International Day of Pink', dateStr: '2026-04-08T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Math Contest', dateStr: '2026-04-09T00:00:00-07:00', tags: ['Academics & STEM'] },
        // Cultural Appreciation Week April 13-17
        { title: 'Cultural Appreciation Week', dateStr: '2026-04-13T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Last Day of Term 3', dateStr: '2026-04-13T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Cultural Appreciation Week', dateStr: '2026-04-14T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Emergency Drill', dateStr: '2026-04-14T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'First Day of Term 4', dateStr: '2026-04-14T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Vaisakhi', dateStr: '2026-04-14T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Cultural Appreciation Week', dateStr: '2026-04-15T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'PERIOD 10 CANCELED TODAY: STAFF MEETING @ 2:30', dateStr: '2026-04-15T14:30:00-07:00', tags: ['School & Leadership'] },
        { title: 'Cultural Appreciation Week', dateStr: '2026-04-16T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Cultural Appreciation Week', dateStr: '2026-04-17T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'School Leaving Ceremony: Grade 12 Grad Form #2 Due', dateStr: '2026-04-18T12:00:00-07:00', tags: ['School & Leadership'] },
        // Numeracy 10/Literacy 10/Literacy 12 Assessment Week April 20-24
        { title: 'Numeracy 10/Literacy 10/Literacy 12 Assessment Week', dateStr: '2026-04-20T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Numeracy 10/Literacy 10/Literacy 12 Assessment Week', dateStr: '2026-04-21T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Earth Day', dateStr: '2026-04-22T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Math Contest', dateStr: '2026-04-22T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Numeracy 10/Literacy 10/Literacy 12 Assessment Week', dateStr: '2026-04-22T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Numeracy 10/Literacy 10/Literacy 12 Assessment Week', dateStr: '2026-04-23T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Numeracy 10/Literacy 10/Literacy 12 Assessment Week', dateStr: '2026-04-24T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Pro-D Day', dateStr: '2026-04-27T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'International Day of Mourning', dateStr: '2026-04-28T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Math Contest', dateStr: '2026-04-29T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Semester 2 (Term 3) Report Cards Posted Online', dateStr: '2026-04-30T15:00:00-07:00', tags: ['School & Leadership'] },

        // --- MAY 2026 ---
        { title: 'Whistler Music Fest', dateStr: '2026-05-01T00:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'ELL Testing for AIPs', dateStr: '2026-05-01T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Math Contest', dateStr: '2026-05-01T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Whistler Music Fest', dateStr: '2026-05-02T00:00:00-07:00', tags: ['Arts & Media'] },
        // Mental Health Week May 4-8
        { title: 'Mental Health Week', dateStr: '2026-05-04T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'District Choir Ensemble Night', dateStr: '2026-05-04T00:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'PAC MEETING', dateStr: '2026-05-04T19:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Mental Health Week', dateStr: '2026-05-05T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Mental Health Week', dateStr: '2026-05-06T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Grade 8 Semester 2 ADST Rotation 2 Ends', dateStr: '2026-05-06T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Mental Health Week', dateStr: '2026-05-07T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Grade 8 Semester 2 ADST Rotation 3 STARTS', dateStr: '2026-05-07T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'AP Art Portfolios Due', dateStr: '2026-05-07T12:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Mental Health Week', dateStr: '2026-05-08T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'AP EXAM: CHINESE LANGUAGE & CULTURE', dateStr: '2026-05-08T07:30:00-07:00', tags: ['Academics & STEM'] },
        { title: 'AP EXAM: AP MACROECONOMICS EXAM', dateStr: '2026-05-08T11:30:00-07:00', tags: ['Academics & STEM'] },
        { title: 'AP EXAM: AP CALCULUS AB/BC EXAM', dateStr: '2026-05-11T07:30:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Emergency Drill', dateStr: '2026-05-12T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'AP EXAM: AP PSYCHOLOGY', dateStr: '2026-05-12T11:30:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Math Contest', dateStr: '2026-05-13T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'AP EXAM: AP COMPUTER SCIENCE PRINCIPLES', dateStr: '2026-05-14T11:30:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Pro-D Day', dateStr: '2026-05-15T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'AP EXAM: AP COMPUTER SCIENCE A', dateStr: '2026-05-15T11:30:00-07:00', tags: ['Academics & STEM'] },
        { title: 'International Day Against Homophobia, Transphobia and Biphobia', dateStr: '2026-05-17T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Victoria Day', dateStr: '2026-05-18T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Dance Company Auditions', dateStr: '2026-05-19T00:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'Choose Your Ride', dateStr: '2026-05-19T12:15:00-07:00', tags: ['School & Leadership'] },
        { title: 'Dance Company Auditions', dateStr: '2026-05-20T00:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'PERIOD 6 CANCELED TODAY: STAFF MEETING @ 8:00', dateStr: '2026-05-20T08:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Dance Company Auditions', dateStr: '2026-05-21T00:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'ELL Year End Testing', dateStr: '2026-05-21T00:00:00-07:00', tags: ['Academics & STEM'] },
        { title: 'Grad Gown Assembly & Distribution', dateStr: '2026-05-21T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'School Leaving Ceremony', dateStr: '2026-05-23T13:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Eid Al-Adha', dateStr: '2026-05-26T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Theatre Production & Art Gallery', dateStr: '2026-05-26T19:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'Theatre Production & Art Gallery', dateStr: '2026-05-27T19:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'Wildcat for a Day', dateStr: '2026-05-28T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Theatre Production & Art Gallery', dateStr: '2026-05-28T19:00:00-07:00', tags: ['Arts & Media'] },

        // --- JUNE 2026 ---
        { title: 'PAC MEETING', dateStr: '2026-06-01T19:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Grassroots', dateStr: '2026-06-05T12:00:00-07:00', tags: ['Arts & Media'] },
        // Burnaby Central Pride Week June 8-12
        { title: 'Burnaby Central Pride Week', dateStr: '2026-06-08T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Burnaby Central Pride Week', dateStr: '2026-06-09T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Spring Band Concert', dateStr: '2026-06-09T19:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'Burnaby Central Pride Week', dateStr: '2026-06-10T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Dance Showcase', dateStr: '2026-06-10T19:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'Burnaby Central Pride Week', dateStr: '2026-06-11T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'International Lunch Meeting', dateStr: '2026-06-11T12:15:00-07:00', tags: ['Culture & Community'] },
        { title: 'Spring Choir Concert', dateStr: '2026-06-11T19:00:00-07:00', tags: ['Arts & Media'] },
        { title: 'Burnaby Central Pride Week', dateStr: '2026-06-12T00:00:00-07:00', tags: ['Culture & Community'] },
        { title: 'Locker Clean Out', dateStr: '2026-06-16T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Yearbook Distribution', dateStr: '2026-06-16T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Grad Breakfast', dateStr: '2026-06-16T09:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Athletics Award Ceremony', dateStr: '2026-06-16T16:00:00-07:00', tags: ['Athletics'] },
        { title: 'Grade 8 Semester 2 ADST Rotation 3 Ends', dateStr: '2026-06-19T00:00:00-07:00', tags: ['Academics & STEM'] },
        // Alternate Schedule Week June 22-25
        { title: 'Alternate Schedule Week', dateStr: '2026-06-22T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Celebration of Excellence', dateStr: '2026-06-22T09:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Grad Dinner & Dance', dateStr: '2026-06-22T17:30:00-07:00', tags: ['School & Leadership'] },
        { title: 'Alternate Schedule Week', dateStr: '2026-06-23T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Coaches Luncheon', dateStr: '2026-06-23T00:00:00-07:00', tags: ['Athletics'] },
        { title: 'Alternate Schedule Week', dateStr: '2026-06-24T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Alternate Schedule Week', dateStr: '2026-06-25T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Last Day of School', dateStr: '2026-06-25T00:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Semester 2 (Term 4) Final Report Cards Posted Online', dateStr: '2026-06-25T15:00:00-07:00', tags: ['School & Leadership'] },
        { title: 'Administrative Day', dateStr: '2026-06-26T00:00:00-07:00', tags: ['School & Leadership'] },
    ];

    let createdCount = 0;
    for (const item of rawEvents) {
        const date = new Date(item.dateStr);

        // Check if an event with exact title & date already exists to prevent duplicate insertion
        const existing = await prisma.event.findFirst({
            where: {
                title: item.title,
                date: date,
                clubId: clubId,
            }
        });

        if (!existing) {
            await prisma.event.create({
                data: {
                    title: item.title,
                    date: date,
                    clubId: clubId,
                    tags: item.tags,
                    description: item.description ?? null,
                }
            });
            createdCount++;
        }
    }

    clearDashboardCache();
    console.log(`Successfully seeded ${createdCount} events for 2026 into the database!`);
}

main()
    .catch((e) => {
        console.error('Error seeding 2026 events:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
