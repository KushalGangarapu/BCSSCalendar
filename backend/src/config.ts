const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start in production with a guessable secret.');
}

export const jwtSecret = JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export const isProduction = process.env.NODE_ENV === 'production';

export const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const port = parseInt(process.env.PORT || '3001', 10);
