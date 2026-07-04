import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    try {
        (req as any).user = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
