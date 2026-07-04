import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';
import { jwtSecret, isProduction } from '../config';

export const login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } });

        // Always run a compare (against a dummy hash) so unknown usernames still take ~same time,
        // reducing trivial username enumeration via response timing.
        const dummyHash = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8pP2K6VZqC.b1kPZ.b1kPZ.b1kPZ.';
        const isMatch = user
            ? await bcrypt.compare(password, user.password)
            : await bcrypt.compare(password, dummyHash);

        if (!user || !isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            jwtSecret,
            { expiresIn: '30d', algorithm: 'HS256' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({ message: 'Logged in successfully', username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = (_req: Request, res: Response): void => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
    res.json({ message: 'Logged out successfully' });
};

export const verifySession = (req: Request, res: Response): void => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    try {
        const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
        if (typeof decoded === 'object' && decoded) {
            res.json({ user: { id: decoded.id, username: decoded.username } });
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
