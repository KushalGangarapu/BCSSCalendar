import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

// Middleware to ensure every device has a tracking cookie
export const trackDevice = (req: Request, res: Response, next: NextFunction) => {
    let deviceId = req.cookies?.deviceId;

    if (!deviceId) {
        deviceId = uuidv4();
        // Set cookie for future requests (10 years)
        res.cookie('deviceId', deviceId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000
        });

        // Ensure req.cookies exists
        if (!req.cookies) req.cookies = {};

        // Mutate req.cookies so the rateLimiter downstream can reliably read it immediately
        req.cookies.deviceId = deviceId;
    }

    next();
};

export const loginRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each device to 5 login requests per hour
    message: { error: 'Too many login attempts from this device, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        return req.cookies?.deviceId || req.ip || 'unknown_ip'; // Fallback to IP if cookie assignment failed
    }
});
