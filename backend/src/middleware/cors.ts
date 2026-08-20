import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
