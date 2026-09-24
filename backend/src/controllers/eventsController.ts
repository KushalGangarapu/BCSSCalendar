import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { addWeeks, addMonths, addDays, format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { clearCache, getCache, setCache } from '../utils/cache';

const VALID_RECURRING = ['weekly', 'biweekly', 'monthly'] as const;
type Recurring = (typeof VALID_RECURRING)[number];

const isRecurring = (value: unknown): value is Recurring =>
    typeof value === 'string' && (VALID_RECURRING as readonly string[]).includes(value);

// School events always follow the school's wall clock, not the server's.
// BC adopted permanent UTC-7 ("Pacific Time", PCT) on Mar 8, 2026 — no more
// DST changes. We pin a FIXED offset zone rather than 'America/Vancouver'
// because runtimes with stale tzdata still apply Vancouver's old DST rules
// and would be an hour off for Nov 2026–Mar 2027 dates.
// ('Etc/GMT+7' is POSIX-style: the sign is inverted, so +7 means UTC-7.)
const SCHOOL_TZ = 'Etc/GMT+7';

const addOccurrences = (base: Date, count: number, freq: Recurring): Date => {
    const zoned = toZonedTime(base, SCHOOL_TZ);
    const shifted = freq === 'weekly'
        ? addWeeks(zoned, count)
        : freq === 'biweekly'
            ? addWeeks(zoned, count * 2)
            : addMonths(zoned, count);
    return fromZonedTime(shifted, SCHOOL_TZ);
};

// End of the current academic school year (June 30th), in school-local time.
const schoolYearEnd = (base: Date): Date => {
    const zoned = toZonedTime(base, SCHOOL_TZ);
    const endYear = zoned.getMonth() >= 6 ? zoned.getFullYear() + 1 : zoned.getFullYear();
    return fromZonedTime(`${endYear}-06-30T23:59:59.999`, SCHOOL_TZ);
};

// Wall-clock milliseconds of `d` in school time, as a host-independent number.
// toZonedTime gives Vancouver's civil fields; parsing them back as UTC yields a
// value that can be diffed/shifted without the host timezone interfering.
const schoolWallMs = (d: Date): number =>
    new Date(`${format(toZonedTime(d, SCHOOL_TZ), "yyyy-MM-dd'T'HH:mm:ss.SSS")}Z`).getTime();

// Inverse of schoolWallMs: a school wall-clock timestamp -> real instant.
const schoolWallToInstant = (ms: number): Date =>
    fromZonedTime(new Date(ms).toISOString().replace('Z', ''), SCHOOL_TZ);

// A bare 'yyyy-MM-dd' recurrence cutoff means "through that school day" — parse
// it as Vancouver end-of-day. new Date('yyyy-MM-dd') would read UTC midnight,
// which lands the previous afternoon in Vancouver and silently drops the last
// occurrence.
const parseRecurrenceEnd = (value: unknown): Date | null => {
    if (typeof value !== 'string' || !value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return fromZonedTime(`${value}T23:59:59.999`, SCHOOL_TZ);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
};

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
                const parsedUntil = parseRecurrenceEnd(recurrenceEndDate);
                if (parsedUntil) repeatUntil = parsedUntil;
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
                repeatUntil = schoolYearEnd(baseDate);
            }
        } else if (baseEndDate) {
            occurrenceDurationMs = Math.max(0, baseEndDate.getTime() - baseDate.getTime());
        }

        const newEvents = [];
        let i = 0;
        const maxInstances = recurringValue === 'weekly' ? 52 : (recurringValue === 'biweekly' ? 26 : (recurringValue === 'monthly' ? 24 : 1));

        while (i < maxInstances) {
            const eventDate = recurringValue ? addOccurrences(baseDate, i, recurringValue) : baseDate;

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
                const parsedUntil = parseRecurrenceEnd(recurrenceEndDate);
                if (parsedUntil) repeatUntil = parsedUntil;
            }

            const duration = newEndDate ? Math.max(0, newEndDate.getTime() - newDate.getTime()) : null;
            // Shift occurrences by the wall-clock delta in school time so each
            // keeps its local time even when the move crosses a DST boundary —
            // a fixed instant delta would drift an hour past Nov 1 / Mar 8.
            const offset = schoolWallMs(newDate) - schoolWallMs(originalEvent.date);

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

                // Changing the cadence (e.g. weekly -> monthly) invalidates the spacing
                // of every existing occurrence — keep only the edited event and
                // regenerate the rest on the new cadence below.
                const cadenceChanged = recurringValue !== originalEvent.recurring;

                for (const ev of futureEvents) {
                    if (cadenceChanged && ev.id !== originalEvent.id) {
                        toDeleteIds.push(ev.id);
                        continue;
                    }
                    const shiftedDate = schoolWallToInstant(schoolWallMs(ev.date) + offset);

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

                if (cadenceChanged && !repeatUntil) {
                    repeatUntil = schoolYearEnd(newDate);
                }

                // Generate occurrences: a cadence change rebuilds the whole series forward
                // from the edited date; otherwise only extend when the cutoff was pushed out.
                const newCreatedOccurrences = [];
                if (repeatUntil && (cadenceChanged || repeatUntil > latestEventDate)) {
                    let nextInstanceIndex = 1;
                    const maxInstances = recurringValue === 'weekly' ? 52 : (recurringValue === 'biweekly' ? 26 : 24);

                    while (nextInstanceIndex < maxInstances) {
                        const candidateDate = addOccurrences(newDate, nextInstanceIndex, recurringValue);

                        if (candidateDate > repeatUntil) {
                            break;
                        }

                        if (cadenceChanged || candidateDate > latestEventDate) {
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

            // Turning a one-off event into a recurring series must actually create the
            // occurrences — previously the flag was saved but no instances were generated.
            const spawned: any[] = [];
            if (updatedRecurring && !originalEvent.recurring) {
                let repeatUntil: Date | null = null;
                if (recurrenceEndDate) {
                    const parsedUntil = parseRecurrenceEnd(recurrenceEndDate);
                    if (parsedUntil) repeatUntil = parsedUntil;
                }
                if (!repeatUntil) repeatUntil = schoolYearEnd(newDate);

                const duration = newEndDate ? Math.max(0, newEndDate.getTime() - newDate.getTime()) : null;
                const maxInstances = updatedRecurring === 'weekly' ? 52 : (updatedRecurring === 'biweekly' ? 26 : 24);
                for (let i = 1; i < maxInstances; i++) {
                    const occurrenceDate = addOccurrences(newDate, i, updatedRecurring);
                    if (occurrenceDate > repeatUntil) break;
                    spawned.push({
                        title,
                        date: occurrenceDate,
                        endDate: duration !== null ? new Date(occurrenceDate.getTime() + duration) : null,
                        description: description ?? null,
                        clubId: clubId || null,
                        recurring: updatedRecurring,
                        tags: Array.isArray(tags) ? tags : [],
                    });
                }
            }

            await prisma.$transaction([
                prisma.event.update({
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
                }),
                ...(spawned.length > 0 ? [prisma.event.createMany({ data: spawned })] : []),
            ]);
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

        // All-day events are exported as floating VALUE=DATE so calendar apps
        // pin them to the school's calendar day regardless of the device timezone
        const isAllDay = (() => {
            const s = toZonedTime(event.date, SCHOOL_TZ);
            if (s.getHours() !== 0 || s.getMinutes() !== 0) return false;
            if (!event.endDate) return true;
            const e = toZonedTime(event.endDate, SCHOOL_TZ);
            return (e.getHours() === 0 && e.getMinutes() === 0) || (e.getHours() === 23 && e.getMinutes() === 59);
        })();

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
            `DTSTAMP:${stamp}`
        ];

        if (isAllDay) {
            const startDay = toZonedTime(event.date, SCHOOL_TZ);
            // VALUE=DATE DTEND is exclusive — the day after the last day
            const endDay = event.endDate ? toZonedTime(event.endDate, SCHOOL_TZ) : startDay;
            icsLines.push(
                `DTSTART;VALUE=DATE:${format(startDay, 'yyyyMMdd')}`,
                `DTEND;VALUE=DATE:${format(addDays(endDay, 1), 'yyyyMMdd')}`
            );
        } else {
            icsLines.push(`DTSTART:${start}`, `DTEND:${end}`);
        }

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
                // UNTIL value type must match DTSTART — DATE for all-day, DATE-TIME(UTC) otherwise
                if (isAllDay) {
                    untilStr = `;UNTIL=${format(toZonedTime(lastEvent.date, SCHOOL_TZ), 'yyyyMMdd')}`;
                } else {
                    const untilDate = lastEvent.endDate || getFallbackEndDate(lastEvent.date);
                    untilStr = `;UNTIL=${formatToUtcBasic(untilDate)}`;
                }
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

