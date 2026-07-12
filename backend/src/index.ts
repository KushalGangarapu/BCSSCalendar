import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import compression from 'compression';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: FRONTEND_URL,
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
