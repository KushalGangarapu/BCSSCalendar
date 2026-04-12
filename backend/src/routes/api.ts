import express from 'express';
import { login, logout, verifySession } from '../controllers/authController';
import { getEvents, createEvent, deleteEvent, getEventById } from '../controllers/eventsController';
import { getClubs, createClub, updateClub, deleteClub, getCategories, deleteCategory, getMetrics, incrementVisits, incrementSignups, getClubById } from '../controllers/contentController';
import { requireAuth } from '../middleware/authMiddleware';
import { trackDevice, loginRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Auth routes
router.post('/auth/login', trackDevice, loginRateLimiter, login);
router.post('/auth/logout', logout);
router.get('/auth/verify', verifySession);

// Public content routes
router.get('/clubs', getClubs);
router.get('/categories', getCategories);
router.get('/clubs/:id', getClubById);
router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.get('/metrics', getMetrics);
router.post('/metrics/visit', incrementVisits);
router.post('/metrics/signup', incrementSignups);

// Protected Admin routes
router.post('/events', requireAuth, createEvent);
router.delete('/events/:id', requireAuth, deleteEvent);
router.post('/clubs', requireAuth, createClub);
router.put('/clubs/:id', requireAuth, updateClub);
router.delete('/clubs/:id', requireAuth, deleteClub);
router.delete('/categories/:name', requireAuth, deleteCategory);

export default router;
