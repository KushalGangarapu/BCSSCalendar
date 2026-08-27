import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { addWeeks, addMonths } from 'date-fns';
import { clearCache, getCache, setCache } from '../utils/cache';

const VALID_RECURRING = ['weekly', 'biweekly', 'monthly'] as const;
type Recurring = (typeof VALID_RECURRING)[number];

const isRecurring = (value: unknown): value is Recurring =>
    typeof value === 'string' && (VALID_RECURRING as readonly string[]).includes(value);

/**
 * GET /api/events
 * Query params:
 *   - range: 'upcoming' | 'all'  (default: 'all')
 *
 * With range=all (default) every event is returned, INCLUDING past ones.
 * This is the contract the public Master Calendar relies on so users can
 * browse previous events. range=upcoming is used by the home dashboard and
 * admin dashboard so those surfaces only show what's ahead or still live.
 */
export const getEvents = async (req: Request, res: Response) => {
    try {
        const range = typeof req.query.range === 'string' ? req.query.range : 'all';
        const cacheKey = `events_${range}`;
        const cached = getCache(cacheKey);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        const where = range === 'upcoming'
            ? { OR: [{ date: { gte: oneHourAgo } }, { endDate: { gte: now } }] }
            : {};

        const events = await prisma.event.findMany({
            where,
            include: { club: true },
            orderBy: { date: 'asc' },
        });
        setCache(cacheKey, events);
        res.setHeader('X-Cache', 'MISS');
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    const { title, date, endDate, description, clubId, recurring, tags } = req.body ?? {};

    if (!title || !date) {
        res.status(400).json({ error: 'Missing required fields: title and date' });
        return;
    }

    if (recurring !== undefined && recurring !== null && !isRecurring(recurring)) {
        res.status(400).json({ error: 'Invalid recurring value' });
        return;
    }

    // Confirm the club exists if clubId is provided.
    if (clubId) {
        const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true } });
        if (!club) {
            res.status(404).json({ error: 'Hosting club not found' });
            return;
        }
    }

    try {
        const baseDate = new Date(date);
        if (isNaN(baseDate.getTime())) {
            res.status(400).json({ error: 'Invalid date' });
            return;
        }

        const baseEndDate = endDate ? new Date(endDate) : null;
        if (endDate && isNaN(baseEndDate!.getTime())) {
            res.status(400).json({ error: 'Invalid endDate' });
            return;
        }

        const recurringValue = isRecurring(recurring) ? recurring : null;

        // Calculate repeatUntil (recurrence end date) vs same-day occurrence duration
        let repeatUntil: Date | null = null;
        let occurrenceDurationMs: number | null = null;

        const { recurrenceEndDate } = req.body ?? {};

        if (recurringValue) {
            if (recurrenceEndDate) {
                const parsedUntil = new Date(recurrenceEndDate);
                if (!isNaN(parsedUntil.getTime())) repeatUntil = parsedUntil;
            }

            if (baseEndDate) {
                const diffMs = baseEndDate.getTime() - baseDate.getTime();
                if (diffMs > 24 * 60 * 60 * 1000 && !repeatUntil) {
                    // Multi-day end date provided for recurring event -> treat as recurrence end date
                    repeatUntil = baseEndDate;
                } else if (diffMs > 0) {
                    occurrenceDurationMs = diffMs;
                }
            }

            // Default to the end of the current academic school year (June 30th) if no repeatUntil is set
            if (!repeatUntil) {
                const endYear = baseDate.getMonth() >= 6 ? baseDate.getFullYear() + 1 : baseDate.getFullYear();
                repeatUntil = new Date(endYear, 5, 30, 23, 59, 59, 999);
            }
        } else if (baseEndDate) {
            occurrenceDurationMs = Math.max(0, baseEndDate.getTime() - baseDate.getTime());
        }

        const newEvents = [];
        let i = 0;
        const maxInstances = recurringValue === 'weekly' ? 52 : (recurringValue === 'biweekly' ? 26 : (recurringValue === 'monthly' ? 24 : 1));

        while (i < maxInstances) {
            const eventDate = recurringValue === 'weekly'
                ? addWeeks(baseDate, i)
                : recurringValue === 'biweekly'
                    ? addWeeks(baseDate, i * 2)
                    : recurringValue === 'monthly'
                        ? addMonths(baseDate, i)
                        : baseDate;

            if (repeatUntil && eventDate > repeatUntil && i > 0) {
                break;
            }

            const occurrenceEndDate = occurrenceDurationMs !== null
                ? new Date(eventDate.getTime() + occurrenceDurationMs)
                : null;

            newEvents.push({
                title,
                date: eventDate,
                endDate: occurrenceEndDate,
                description: description ?? null,
                clubId: clubId || null,
                recurring: recurringValue,
                tags: Array.isArray(tags) ? tags : [],
            });

            i++;
            if (!recurringValue) break;
        }

        await prisma.event.createMany({ data: newEvents });
        clearCache();

        res.status(201).json({ message: 'Event(s) created successfully', count: newEvents.length });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { allFuture } = req.query;

    try {
        const event = await prisma.event.findUnique({ where: { id: id as string } });
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        if (allFuture === 'true' && event.recurring) {
            await prisma.event.deleteMany({
                where: {
                    title: event.title,
                    clubId: event.clubId,
                    recurring: event.recurring,
                    date: { gte: event.date }
                }
            });
        } else {
            await prisma.event.delete({ where: { id: id as string } });
        }
        clearCache();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const cacheKey = `event_${id}`;
        const cached = getCache(cacheKey);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }

        const event = await prisma.event.findUnique({
            where: { id: id as string },
            include: { club: true }
        });
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        let recurrenceEndDate: Date | null = null;
        if (event.recurring) {
            const lastEvent = await prisma.event.findFirst({
                where: {
                    title: event.title,
                    clubId: event.clubId,
                    recurring: event.recurring,
                    date: { gte: event.date }
                },
                orderBy: { date: 'desc' }
            });
            if (lastEvent) {
                recurrenceEndDate = lastEvent.endDate || lastEvent.date;
            }
        }

        const eventData = {
            ...event,
            recurrenceEndDate
        };

        setCache(cacheKey, eventData);
        res.setHeader('X-Cache', 'MISS');
        res.json(eventData);
    } catch (error) {
        console.error('Error fetching event by id:', error);
        res.status(500).json({ error: 'Failed to fetch event details' });
    }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { allFuture } = req.query;
    const { title, date, endDate, recurrenceEndDate, description, clubId, recurring, tags } = req.body ?? {};

    if (!title || !date) {
        res.status(400).json({ error: 'Missing required fields: title and date' });
        return;
    }

    if (recurring !== undefined && recurring !== null && !isRecurring(recurring)) {
        res.status(400).json({ error: 'Invalid recurring value' });
        return;
    }

    if (clubId) {
        const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true } });
        if (!club) {
            res.status(404).json({ error: 'Hosting club not found' });
            return;
        }
    }

    try {
        const newDate = new Date(date);
        if (isNaN(newDate.getTime())) {
            res.status(400).json({ error: 'Invalid date' });
            return;
        }

        const newEndDate = endDate ? new Date(endDate) : null;
        if (endDate && isNaN(newEndDate!.getTime())) {
            res.status(400).json({ error: 'Invalid endDate' });
            return;
        }

        const originalEvent = await prisma.event.findUnique({ where: { id: id as string } });
        if (!originalEvent) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        const recurringValue = isRecurring(recurring) ? recurring : null;

        if (allFuture === 'true' && originalEvent.recurring) {
            // Find all future events in the series starting from this event's original date
            const futureEvents = await prisma.event.findMany({
                where: {
                    title: originalEvent.title,
                    clubId: originalEvent.clubId,
                    recurring: originalEvent.recurring,
                    date: { gte: originalEvent.date }
                },
                orderBy: { date: 'asc' }
            });

            // Parse recurrence cutoff date if provided
            let repeatUntil: Date | null = null;
            if (recurrenceEndDate) {
                const parsedUntil = new Date(recurrenceEndDate);
                if (!isNaN(parsedUntil.getTime())) repeatUntil = parsedUntil;
            }

            const duration = newEndDate ? Math.max(0, newEndDate.getTime() - newDate.getTime()) : null;
            const offset = newDate.getTime() - originalEvent.date.getTime();

            // If recurrence was cancelled (changed to one-time)
            if (!recurringValue) {
                const toDeleteIds = futureEvents.filter(ev => ev.id !== originalEvent.id).map(ev => ev.id);
                await prisma.$transaction([
                    prisma.event.update({
                        where: { id: originalEvent.id },
                        data: {
                            title,
                            date: newDate,
                            endDate: duration !== null ? new Date(newDate.getTime() + duration) : null,
                            description: description ?? null,
                            clubId: clubId || null,
                            recurring: null,
                            tags: Array.isArray(tags) ? tags : [],
                        }
                    }),
                    ...(toDeleteIds.length > 0 ? [prisma.event.deleteMany({ where: { id: { in: toDeleteIds } } })] : [])
                ]);
            } else {
                // Updating recurring series
                const updates: any[] = [];
                const toDeleteIds: string[] = [];
                let latestEventDate = newDate;

                for (const ev of futureEvents) {
                    const shiftedDate = new Date(ev.date.getTime() + offset);
                    
                    // If cutoff date is set and this shifted instance is past the cutoff (and it's not the initial event)
                    if (repeatUntil && shiftedDate > repeatUntil && ev.id !== originalEvent.id) {
                        toDeleteIds.push(ev.id);
                    } else {
                        const shiftedEndDate = duration !== null ? new Date(shiftedDate.getTime() + duration) : null;
                        updates.push(
                            prisma.event.update({
                                where: { id: ev.id },
                                data: {
                                    title,
                                    date: shiftedDate,
                                    endDate: shiftedEndDate,
                                    description: description ?? null,
                                    clubId: clubId || null,
                                    recurring: recurringValue,
                                    tags: Array.isArray(tags) ? tags : [],
                                }
                            })
                        );
                        if (shiftedDate > latestEventDate) {
                            latestEventDate = shiftedDate;
                        }
                    }
                }

                // If repeatUntil was extended further than existing series, generate missing occurrences
                const newCreatedOccurrences = [];
                if (repeatUntil && repeatUntil > latestEventDate) {
                    let nextInstanceIndex = 1;
                    const maxInstances = recurringValue === 'weekly' ? 52 : (recurringValue === 'biweekly' ? 26 : 24);
                    
                    while (nextInstanceIndex < maxInstances) {
                        const candidateDate = recurringValue === 'weekly'
                            ? addWeeks(newDate, nextInstanceIndex)
                            : recurringValue === 'biweekly'
                                ? addWeeks(newDate, nextInstanceIndex * 2)
                                : addMonths(newDate, nextInstanceIndex);

                        if (candidateDate > repeatUntil) {
                            break;
                        }

                        if (candidateDate > latestEventDate) {
                            newCreatedOccurrences.push({
                                title,
                                date: candidateDate,
                                endDate: duration !== null ? new Date(candidateDate.getTime() + duration) : null,
                                description: description ?? null,
                                clubId: clubId || null,
                                recurring: recurringValue,
                                tags: Array.isArray(tags) ? tags : [],
                            });
                        }
                        nextInstanceIndex++;
                    }
                }

                const transactionOps: any[] = [...updates];
                if (toDeleteIds.length > 0) {
                    transactionOps.push(prisma.event.deleteMany({ where: { id: { in: toDeleteIds } } }));
                }
                if (newCreatedOccurrences.length > 0) {
                    transactionOps.push(prisma.event.createMany({ data: newCreatedOccurrences }));
                }

                await prisma.$transaction(transactionOps);
            }
        } else {
            // If it was part of a recurring series and we only edit this instance,
            // set recurring to null to decouple it from future cascading edits/deletions.
            const updatedRecurring = (originalEvent.recurring && allFuture !== 'true') ? null : recurringValue;

            await prisma.event.update({
                where: { id: id as string },
                data: {
                    title,
                    date: newDate,
                    endDate: newEndDate,
                    description: description ?? null,
                    clubId: clubId || null,
                    recurring: updatedRecurring,
                    tags: Array.isArray(tags) ? tags : [],
                }
            });
        }

        clearCache();
        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
};

export const getEventIcs = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const event = await prisma.event.findUnique({
            where: { id: id as string },
            include: { club: true }
        });
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        const formatToUtcBasic = (d: Date): string => {
            const y = d.getUTCFullYear();
            const m = String(d.getUTCMonth() + 1).padStart(2, '0');
            const day = String(d.getUTCDate()).padStart(2, '0');
            const h = String(d.getUTCHours()).padStart(2, '0');
            const min = String(d.getUTCMinutes()).padStart(2, '0');
            const s = String(d.getUTCSeconds()).padStart(2, '0');
            return `${y}${m}${day}T${h}${min}${s}Z`;
        };

        const getFallbackEndDate = (d: Date): Date => {
            const fallback = new Date(d);
            fallback.setUTCHours(fallback.getUTCHours() + 1);
            return fallback;
        };

        const start = formatToUtcBasic(event.date);
        const end = formatToUtcBasic(event.endDate || getFallbackEndDate(event.date));
        const stamp = formatToUtcBasic(new Date());
        const cleanTitle = event.title.replace(/[,;]/g, '\\$&');
        const cleanDesc = (event.description || '').replace(/\n/g, '\\n').replace(/[,;]/g, '\\$&') + `\\n\\nHosted by: ${event.club?.name || 'School Event'}`;

        const icsLines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//BCSS Calendar//Event//EN',
            'BEGIN:VEVENT',
            `UID:${event.id}`,
            `DTSTAMP:${stamp}`,
            `DTSTART:${start}`,
            `DTEND:${end}`
        ];

        if (event.recurring) {
            const lastEvent = await prisma.event.findFirst({
                where: {
                    title: event.title,
                    clubId: event.clubId,
                    recurring: event.recurring,
                    date: { gte: event.date }
                },
                orderBy: { date: 'desc' }
            });

            let freq = 'WEEKLY';
            let interval = '';
            if (event.recurring === 'weekly') {
                freq = 'WEEKLY';
            } else if (event.recurring === 'biweekly') {
                freq = 'WEEKLY';
                interval = ';INTERVAL=2';
            } else if (event.recurring === 'monthly') {
                freq = 'MONTHLY';
            }

            let untilStr = '';
            if (lastEvent) {
                const untilDate = lastEvent.endDate || getFallbackEndDate(lastEvent.date);
                untilStr = `;UNTIL=${formatToUtcBasic(untilDate)}`;
            }

            icsLines.push(`RRULE:FREQ=${freq}${interval}${untilStr}`);
        }

        icsLines.push(
            `SUMMARY:${cleanTitle}`,
            `DESCRIPTION:${cleanDesc}`,
            'END:VEVENT',
            'END:VCALENDAR'
        );

        const icsContent = icsLines.join('\r\n');

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics"`);
        res.send(icsContent);
    } catch (error) {
        console.error('Error exporting event to ICS:', error);
        res.status(500).json({ error: 'Failed to generate calendar file' });
    }
};

