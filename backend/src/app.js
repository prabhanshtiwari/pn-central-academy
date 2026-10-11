import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '..');
const projectRoot = path.resolve(backendRoot, '..');
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://www.pncentralacademy.com', 'https://pncentralacademy.com', 'https://res.cloudinary.com'],
      fontSrc: ["'self'", 'data:'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      frameSrc: ["'self'", 'https://www.youtube-nocookie.com', 'https://www.youtube.com'],
      connectSrc: ["'self'", ...allowedOrigins],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads/gallery', express.static(path.join(backendRoot, 'uploads', 'gallery'), { maxAge: '7d', immutable: true, fallthrough: false }));
app.use('/api', publicRoutes);
app.use('/api/admin', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('Pragma', 'no-cache');
  next();
}, adminRoutes);

if (process.env.SERVE_CLIENT === 'true') {
  const dist = path.join(projectRoot, 'frontend', 'dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist, { maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0, index: false }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
      res.sendFile(path.join(dist, 'index.html'));
    });
  }
}

app.use((error, req, res, next) => {
  if (error?.name === 'MulterError') {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ success: false, message: error.code === 'LIMIT_FILE_SIZE' ? 'The uploaded file exceeds the allowed size limit.' : error.message });
  }
  if (/Only JPG, PNG|Only PDF/i.test(error?.message || '')) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next(error);
});
app.use(notFound);
app.use(errorHandler);
export default app;
