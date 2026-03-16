import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        // Attach the user to the request object, for example req.user = payload;
        (req as any).user = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
