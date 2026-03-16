import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { addWeeks, addMonths } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'America/Vancouver';

export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await prisma.event.findMany({
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
    const { title, date, description, clubId, recurring } = req.body;

    try {
        // Basic validation
        if (!title || !date || !clubId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // The frontend sends the date in ISO string format (which is UTC).
        // It's saved in the database as UTC.
        const baseDate = new Date(date);
        const newEvents = [];

        // Depending on recurrence, generate future instances (e.g. for the next 4 months)
        let instances = 1;
        if (recurring === 'weekly') instances = 16;      // roughly 4 months
        else if (recurring === 'biweekly') instances = 8;
        else if (recurring === 'monthly') instances = 4;

        for (let i = 0; i < instances; i++) {
            let eventDate = baseDate;
            if (recurring === 'weekly') eventDate = addWeeks(baseDate, i);
            else if (recurring === 'biweekly') eventDate = addWeeks(baseDate, i * 2);
            else if (recurring === 'monthly') eventDate = addMonths(baseDate, i);

            newEvents.push({
                title,
                date: eventDate,
                description,
                clubId,
                recurring,
            });
        }

        // Bulk insert the generated events
        await prisma.event.createMany({
            data: newEvents,
        });

        res.status(201).json({ message: 'Event(s) created successfully', count: newEvents.length });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.event.delete({
            where: { id: id as string },
        });
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
