import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { clearDashboardCache, getCachedDashboard, setCachedDashboard } from '../utils/cache';

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
        const { name, category, description, instagram, discord, imageUrl } = req.body;
        if (!name || !category || !description) {
            return res.status(400).json({ error: 'Name, category, and description are required' });
        }

        // Ensure category exists
        await prisma.category.upsert({
            where: { name: category },
            update: {},
            create: { name: category }
        });

        const club = await prisma.club.create({
            data: { name, category, description, instagram, discord, imageUrl: imageUrl || null },
        });
        clearDashboardCache();
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
        const { name, category, description, instagram, discord, imageUrl } = req.body;

        if (category) {
            // Ensure category exists
            await prisma.category.upsert({
                where: { name: category },
                update: {},
                create: { name: category }
            });
        }

        const club = await prisma.club.update({
            where: { id },
            data: {
                name: name as string,
                category: category as string,
                description: description as string,
                instagram: (instagram as string) || null,
                discord: (discord as string) || null,
                imageUrl: (imageUrl as string) || null,
            },
        });
        clearDashboardCache();
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
        clearDashboardCache();
        res.json({ message: 'Club deleted' });
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Club not found' });
        res.status(500).json({ error: 'Failed to delete club' });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
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
        await prisma.category.delete({ where: { name: categoryName } });
        clearDashboardCache();

        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
};

export const updateCategoryColor = async (req: Request, res: Response) => {
    try {
        const categoryName = decodeURIComponent(req.params.name as string);
        const { color } = req.body;

        if (!color) {
            return res.status(400).json({ error: 'Color is required' });
        }

        const category = await prisma.category.update({
            where: { name: categoryName },
            data: { color }
        });
        clearDashboardCache();

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category color' });
    }
};

export const getMetrics = async (req: Request, res: Response) => {
    try {
        const metrics = await prisma.metrics.findFirst();
        const clubCount = await prisma.club.count();
        const now = new Date();
        const eventCount = await prisma.event.count({
            where: {
                OR: [
                    { date: { gte: now } },
                    { endDate: { gte: now } },
                ],
            },
        });
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

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const now = Date.now();
        const cached = getCachedDashboard(now);
        if (cached) {
            res.json(cached);
            return;
        }

        const oneHourAgo = new Date(now - 60 * 60 * 1000);
        const today = new Date(now);

        const [metrics, clubs, events, categories] = await Promise.all([
            // 1. Metrics
            Promise.all([
                prisma.metrics.findFirst(),
                prisma.club.count(),
                prisma.event.count({
                    where: {
                        OR: [
                            { date: { gte: today } },
                            { endDate: { gte: today } },
                        ],
                    },
                }),
            ]).then(([m, cc, ec]) => ({
                pageVisits: m?.activeUsers || 0,
                clubCount: cc,
                eventCount: ec,
            })),

            // 2. Clubs (featured)
            prisma.club.findMany({
                orderBy: { name: 'asc' },
                take: 3,
            }),

            // 3. Upcoming Events
            prisma.event.findMany({
                where: {
                    OR: [
                        { date: { gte: oneHourAgo } },
                        { endDate: { gte: today } },
                    ],
                },
                include: { club: true },
                orderBy: { date: 'asc' },
                take: 10,
            }),

            // 4. Categories
            prisma.category.findMany({
                orderBy: { name: 'asc' },
            }),
        ]);

        const dashboardData = {
            metrics,
            clubs,
            events,
            categories,
        };

        setCachedDashboard(dashboardData, now);

        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};
