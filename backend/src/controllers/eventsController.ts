import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { addWeeks, addMonths } from 'date-fns';
import { clearDashboardCache } from '../utils/cache';

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

    // clubId is required by the schema (NOT NULL). Reject early instead of letting Prisma throw.
    if (!clubId) {
        res.status(400).json({ error: 'Hosting club is required' });
        return;
    }

    // Confirm the club exists so we get a clean 404 instead of a FK violation.
    const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true } });
    if (!club) {
        res.status(404).json({ error: 'Hosting club not found' });
        return;
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

        const endDateOffset = baseEndDate ? baseEndDate.getTime() - baseDate.getTime() : null;
        const recurringValue = isRecurring(recurring) ? recurring : null;

        let instances = 1;
        if (recurringValue === 'weekly') instances = 16;
        else if (recurringValue === 'biweekly') instances = 8;
        else if (recurringValue === 'monthly') instances = 4;

        const newEvents = Array.from({ length: instances }, (_, i) => {
            const eventDate = recurringValue === 'weekly'
                ? addWeeks(baseDate, i)
                : recurringValue === 'biweekly'
                    ? addWeeks(baseDate, i * 2)
                    : recurringValue === 'monthly'
                        ? addMonths(baseDate, i)
                        : baseDate;

            return {
                title,
                date: eventDate,
                endDate: endDateOffset !== null ? new Date(eventDate.getTime() + endDateOffset) : null,
                description: description ?? null,
                clubId,
                recurring: recurringValue,
                tags: Array.isArray(tags) ? tags : [],
            };
        });

        await prisma.event.createMany({ data: newEvents });
        clearDashboardCache();

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
        clearDashboardCache();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

export const getEventById = async (req: Request, res: Response) => {
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
        res.json(event);
    } catch (error) {
        console.error('Error fetching event by id:', error);
        res.status(500).json({ error: 'Failed to fetch event details' });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { allFuture } = req.query;
    const { title, date, endDate, description, clubId, recurring, tags } = req.body ?? {};

    if (!title || !date) {
        res.status(400).json({ error: 'Missing required fields: title and date' });
        return;
    }

    if (recurring !== undefined && recurring !== null && !isRecurring(recurring)) {
        res.status(400).json({ error: 'Invalid recurring value' });
        return;
    }

    if (!clubId) {
        res.status(400).json({ error: 'Hosting club is required' });
        return;
    }

    const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true } });
    if (!club) {
        res.status(404).json({ error: 'Hosting club not found' });
        return;
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
                }
            });

            const duration = newEndDate ? (newEndDate.getTime() - newDate.getTime()) : null;
            const offset = newDate.getTime() - originalEvent.date.getTime();

            await prisma.$transaction(
                futureEvents.map(ev => {
                    const shiftedDate = new Date(ev.date.getTime() + offset);
                    const shiftedEndDate = duration !== null ? new Date(shiftedDate.getTime() + duration) : null;

                    return prisma.event.update({
                        where: { id: ev.id },
                        data: {
                            title,
                            date: shiftedDate,
                            endDate: shiftedEndDate,
                            description: description ?? null,
                            clubId,
                            recurring: recurringValue,
                            tags: Array.isArray(tags) ? tags : [],
                        }
                    });
                })
            );
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
                    clubId,
                    recurring: updatedRecurring,
                    tags: Array.isArray(tags) ? tags : [],
                }
            });
        }

        clearDashboardCache();
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

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//BCSS Calendar//Event//EN',
            'BEGIN:VEVENT',
            `UID:${event.id}`,
            `DTSTAMP:${stamp}`,
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:${cleanTitle}`,
            `DESCRIPTION:${cleanDesc}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics"`);
        res.send(icsContent);
    } catch (error) {
        console.error('Error exporting event to ICS:', error);
        res.status(500).json({ error: 'Failed to generate calendar file' });
    }
};

