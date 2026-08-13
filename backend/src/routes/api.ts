import express from 'express';
import { login, logout, verifySession } from '../controllers/authController';
import { getEvents, createEvent, deleteEvent, getEventById, updateEvent, getEventIcs } from '../controllers/eventsController';
import { getClubs, createClub, updateClub, deleteClub, getCategories, deleteCategory, updateCategoryColor, getMetrics, incrementVisits, incrementSignups, getClubById, getDashboardData, getBootstrapData, toggleClubFeatured } from '../controllers/contentController';
import { requireAuth } from '../middleware/authMiddleware';
import { trackDevice, loginRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Auth routes
router.post('/auth/login', trackDevice, loginRateLimiter, login);
router.post('/auth/logout', logout);
router.get('/auth/verify', verifySession);

import { handleSyncStream } from '../utils/syncManager';

// Public content routes
router.get('/bootstrap', getBootstrapData);
router.get('/sync/stream', (req, res) => handleSyncStream(res));
router.get('/dashboard', getDashboardData);
router.get('/clubs', getClubs);
router.get('/categories', getCategories);
router.get('/clubs/:id', getClubById);
router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.get('/events/:id/ics', getEventIcs);
router.get('/metrics', getMetrics);
router.post('/metrics/visit', incrementVisits);
router.post('/metrics/signup', incrementSignups);

// Protected Admin routes
router.post('/events', requireAuth, createEvent);
router.put('/events/:id', requireAuth, updateEvent);
router.delete('/events/:id', requireAuth, deleteEvent);
router.post('/clubs', requireAuth, createClub);
router.put('/clubs/:id', requireAuth, updateClub);
router.put('/clubs/:id/feature', requireAuth, toggleClubFeatured);
router.delete('/clubs/:id', requireAuth, deleteClub);
router.delete('/categories/:name', requireAuth, deleteCategory);
router.put('/categories/:name/color', requireAuth, updateCategoryColor);

export default router;
