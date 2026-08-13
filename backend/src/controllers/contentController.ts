import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { clearCache, getCache, setCache } from '../utils/cache';

export const getClubs = async (req: Request, res: Response) => {
    try {
        const cached = getCache('clubs');
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }
        const clubs = await prisma.club.findMany({ orderBy: { name: 'asc' } });
        setCache('clubs', clubs);
        res.setHeader('X-Cache', 'MISS');
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
};

export const getClubById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const cacheKey = `club_${id}`;
        const cached = getCache(cacheKey);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }
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
        setCache(cacheKey, club);
        res.setHeader('X-Cache', 'MISS');
        res.json(club);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch club details' });
    }
};

export const createClub = async (req: Request, res: Response) => {
    try {
        const { name, category, description, instagram, discord, imageUrl, isFeatured } = req.body;
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
            data: { 
                name, 
                category, 
                description, 
                instagram: instagram || null, 
                discord: discord || null, 
                imageUrl: imageUrl || null,
                isFeatured: Boolean(isFeatured)
            },
        });
        clearCache();
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
        const { name, category, description, instagram, discord, imageUrl, isFeatured } = req.body;

        if (category) {
            // Ensure category exists
            await prisma.category.upsert({
                where: { name: category },
                update: {},
                create: { name: category }
            });
        }

        const updateData: any = {
            name: name as string,
            category: category as string,
            description: description as string,
            instagram: (instagram as string) || null,
            discord: (discord as string) || null,
            imageUrl: (imageUrl as string) || null,
        };
        if (typeof isFeatured === 'boolean') {
            updateData.isFeatured = isFeatured;
        }

        const club = await prisma.club.update({
            where: { id },
            data: updateData,
        });
        clearCache();
        res.json(club);
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Club not found' });
        res.status(500).json({ error: 'Failed to update club' });
    }
};

export const toggleClubFeatured = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const currentClub = await prisma.club.findUnique({ where: { id } });
        if (!currentClub) {
            return res.status(404).json({ error: 'Club not found' });
        }

        const updatedClub = await prisma.club.update({
            where: { id },
            data: { isFeatured: !currentClub.isFeatured }
        });

        clearCache();
        res.json(updatedClub);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle featured status' });
    }
};

export const deleteClub = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        // Delete associated events first
        await prisma.event.deleteMany({ where: { clubId: id as string } });
        await prisma.club.delete({ where: { id } });
        clearCache();
        res.json({ message: 'Club deleted' });
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Club not found' });
        res.status(500).json({ error: 'Failed to delete club' });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        const cached = getCache('categories');
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }
        const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
        setCache('categories', categories);
        res.setHeader('X-Cache', 'MISS');
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
        clearCache();

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
        clearCache();

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category color' });
    }
};

export const getMetrics = async (req: Request, res: Response) => {
    try {
        const cached = getCache('metrics', 10000);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }
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
        const result = {
            pageVisits: metrics?.activeUsers || 0,
            clubCount,
            eventCount,
        };
        setCache('metrics', result);
        res.setHeader('X-Cache', 'MISS');
        res.json(result);
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
        const cached = getCache('dashboard');
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            res.json(cached);
            return;
        }

        const now = Date.now();
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

        setCache('dashboard', dashboardData);
        res.setHeader('X-Cache', 'MISS');
        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

export const fetchFullBootstrapPayload = async () => {
    const now = new Date();
    const [events, clubs, categories, metricsRecord, clubCount, eventCount] = await Promise.all([
        prisma.event.findMany({ include: { club: true }, orderBy: { date: 'asc' } }),
        prisma.club.findMany({ orderBy: { name: 'asc' } }),
        prisma.category.findMany({ orderBy: { name: 'asc' } }),
        prisma.metrics.findFirst(),
        prisma.club.count(),
        prisma.event.count({
            where: {
                OR: [{ date: { gte: now } }, { endDate: { gte: now } }]
            }
        })
    ]);

    return {
        events,
        clubs,
        categories,
        metrics: {
            pageVisits: metricsRecord?.activeUsers || 0,
            clubCount,
            eventCount
        },
        version: Date.now()
    };
};

export const getBootstrapData = async (req: Request, res: Response) => {
    try {
        const cached = getCache('bootstrap');
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }

        const bootstrapData = await fetchFullBootstrapPayload();
        setCache('bootstrap', bootstrapData);
        res.setHeader('X-Cache', 'MISS');
        res.json(bootstrapData);
    } catch (error) {
        console.error('Error fetching bootstrap data:', error);
        res.status(500).json({ error: 'Failed to fetch bootstrap data' });
    }
};

