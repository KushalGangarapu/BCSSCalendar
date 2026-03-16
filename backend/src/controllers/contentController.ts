import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getClubs = async (req: Request, res: Response) => {
    try {
        const clubs = await prisma.club.findMany({ orderBy: { name: 'asc' } });
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
};

export const getClubById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const club = await prisma.club.findUnique({
            where: { id },
            include: {
                events: {
                    where: { date: { gte: new Date() } },
                    orderBy: { date: 'asc' },
                },
            },
        });
        if (!club) {
            res.status(404).json({ error: 'Club not found' });
            return;
        }
        res.json(club);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch club details' });
    }
};

export const createClub = async (req: Request, res: Response) => {
    try {
        const { name, category, description, instagram, discord } = req.body;
        if (!name || !category || !description) {
            return res.status(400).json({ error: 'Name, category, and description are required' });
        }
        const club = await prisma.club.create({
            data: { name, category, description, instagram, discord },
        });
        res.status(201).json(club);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'A club with that name already exists' });
        }
        res.status(500).json({ error: 'Failed to create club' });
    }
};

export const updateClub = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, category, description, instagram, discord } = req.body;
        const club = await prisma.club.update({
            where: { id },
            data: {
                name: name as string,
                category: category as string,
                description: description as string,
                instagram: (instagram as string) || null,
                discord: (discord as string) || null,
            },
        });
        res.json(club);
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Club not found' });
        res.status(500).json({ error: 'Failed to update club' });
    }
};

export const deleteClub = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        // Delete associated events first
        await prisma.event.deleteMany({ where: { clubId: id as string } });
        await prisma.club.delete({ where: { id } });
        res.json({ message: 'Club deleted' });
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Club not found' });
        res.status(500).json({ error: 'Failed to delete club' });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        const clubs = await prisma.club.findMany({ select: { category: true } });
        const categories = [...new Set(clubs.map(c => c.category))].sort();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const categoryName = decodeURIComponent(req.params.name as string);
        const clubs = await prisma.club.findMany({ where: { category: categoryName } });
        const clubIds = clubs.map(c => c.id);

        await prisma.event.deleteMany({ where: { clubId: { in: clubIds } } });
        await prisma.club.deleteMany({ where: { category: categoryName } });

        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
};

export const getMetrics = async (req: Request, res: Response) => {
    try {
        const metrics = await prisma.metrics.findFirst();
        const clubCount = await prisma.club.count();
        const eventCount = await prisma.event.count();
        res.json({
            pageVisits: metrics?.activeUsers || 0,
            clubCount,
            eventCount,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
};

export const incrementVisits = async (req: Request, res: Response) => {
    try {
        const metrics = await prisma.metrics.findFirst();
        if (!metrics) {
            await prisma.metrics.create({ data: { activeUsers: 1, portalSignups: 0 } });
        } else {
            await prisma.metrics.update({
                where: { id: metrics.id },
                data: { activeUsers: { increment: 1 } },
            });
        }
        res.json({ message: 'Visits incremented' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update metrics' });
    }
};

export const incrementSignups = async (req: Request, res: Response) => {
    try {
        const metrics = await prisma.metrics.findFirst();
        if (!metrics) {
            await prisma.metrics.create({ data: { activeUsers: 0, portalSignups: 1 } });
        } else {
            await prisma.metrics.update({
                where: { id: metrics.id },
                data: { portalSignups: { increment: 1 } },
            });
        }
        res.json({ message: 'Signups incremented' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update metrics' });
    }
};
