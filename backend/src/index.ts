import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import compression from 'compression';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = rawFrontendUrl.split(',').map(url => url.trim().replace(/\/$/, ''));

// Middleware
app.use(compression({
    filter: (req, res) => {
        if (req.headers.accept?.includes('text/event-stream') || req.path?.includes('/sync/stream') || req.originalUrl?.includes('/sync/stream')) {
            return false;
        }
        return compression.filter(req, res);
    }
}));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(normalized) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true, // Crucial for accepting HttpOnly cookies from the frontend
}));

// Routes
app.use('/api', apiRoutes);

// Basic health check
app.get('/', (req, res) => {
    res.send('BCSS Calendar API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
