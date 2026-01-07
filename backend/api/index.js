import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import postsRoutes from './routes/posts.route.js';
import commentRoutes from './routes/comment.route.js';
import uploadRoutes from './routes/upload.route.js';
import mediaRoutes from './routes/media.route.js';
import clientRoutes from './routes/clients.route.js';
import projectRoutes from './routes/projects.route.js';
import campaignRoutes from './routes/campaigns.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { absoluteUploadPath } from './controllers/upload.controller.js';
import cors from 'cors';
import compression from 'compression';
import analyticsRoutes from './routes/analytics.route.js';
import seoRoutes from './routes/seo.route.js';
import eventsRoutes from './routes/events.route.js';
import settingsRoutes from './routes/settings.route.js';
import adminUsersRoutes from './routes/adminUsers.route.js';
import rubricsRoutes from './routes/rubrics.route.js';
import debugRoutes from './routes/debug.route.js';

const databaseUrl = process.env.DATABASE_URL;
const dbState = {
  ready: false,
  error: null,
};

const resolveDatabaseHost = (value) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.host || url.hostname || null;
  } catch (error) {
    return null;
  }
};

const maskValue = (value) => {
  if (!value) return 'unknown';
  if (value.length <= 4) return '***';
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
};

const databaseHost = resolveDatabaseHost(databaseUrl);

if (!databaseUrl) {
  console.error('DATABASE_URL est manquant : le serveur démarre sans base, routes DB indisponibles.');
  dbState.error = new Error('DATABASE_URL missing');
} else {
  mongoose
    .connect(databaseUrl)
    .then(() => console.log('MongoDB is connected'))
    .catch((err) => {
      dbState.error = err;
      console.error(
        'Impossible de se connecter à MongoDB. Vérifiez DATABASE_URL et les droits réseau.',
        err.message
      );
    });
}

mongoose.connection.on('connected', () => {
  dbState.ready = true;
  dbState.error = null;
});
mongoose.connection.on('disconnected', () => {
  dbState.ready = false;
  if (!dbState.error) {
    dbState.error = new Error('MongoDB disconnected');
  }
});
mongoose.connection.on('error', (err) => {
  dbState.ready = false;
  dbState.error = err;
});

const __dirname = path.resolve();
const app = express();
app.set('trust proxy', true);

const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const vercelPreviewRegex = /^https:\/\/trust-.*\.vercel\.app$/;
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
  defaultDevOrigins.forEach((origin) => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (vercelPreviewRegex.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = isOriginAllowed(origin);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[CORS] origin=${origin || 'none'} allowed=${allowed}`);
    }
    return callback(null, allowed);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middlewares
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(
  compression({
    level: 6,
    filter: (req, res) => {
      if (req.headers['x-no-compress']) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

const sanitizeObject = (value) => {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item));
  }
  return Object.entries(value).reduce((acc, [key, val]) => {
    const cleanedKey = key.replace(/\$/g, '').replace(/\./g, '');
    acc[cleanedKey] = sanitizeObject(val);
    return acc;
  }, {});
};

app.use((req, _res, next) => {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  next();
});

const authRateState = new Map();
const authRateLimiter = (req, res, next) => {
  const windowMs = 15 * 60 * 1000;
  const max = 20;
  const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const entry = authRateState.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  authRateState.set(key, entry);
  if (entry.count > max) {
    return res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' });
  }
  return next();
};

app.use('/api/auth', authRateLimiter);

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Light caching for public GET endpoints
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.startsWith('/api/')) {
    const maxAge = req.path.startsWith('/api/uploads') ? 60 * 60 * 24 * 30 : 120;
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: dbState.ready ? 'ok' : 'degraded',
    db: {
      ready: dbState.ready,
    },
    message: dbState.ready ? 'API ready' : 'API running without database connection',
  });
});
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  if (!dbState.ready) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Try again later.',
      dbReady: false,
    });
  }
  return next();
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminUsersRoutes);
app.use('/api/rubrics', rubricsRoutes);
app.use('/api/debug', debugRoutes);
app.use('/', seoRoutes);

// Serve uploaded assets
if (!fs.existsSync(absoluteUploadPath)) {
  fs.mkdirSync(absoluteUploadPath, { recursive: true });
}

app.use(
  '/uploads',
  express.static(absoluteUploadPath, {
    maxAge: '30d',
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  })
);

// Servir le frontend
app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  });
});

const resolvePort = (value) => {
  if (value === undefined || value === null || value === '') return 3000;
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) {
    console.warn(`PORT invalide "${value}". Utilisation du port 3000.`);
    return 3000;
  }
  return parsed;
};

// Lancer le serveur
const PORT = resolvePort(process.env.PORT);
const maskedDbHost = maskValue(databaseHost);
const corsSummary = allowedOrigins.length === 0 ? '(none)' : allowedOrigins.join(',');
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const apiPublicUrl = process.env.API_PUBLIC_URL || '';
const missingRequired = ['DATABASE_URL', 'JWT_SECRET'].filter((key) => !process.env[key]);

if (missingRequired.length > 0) {
  console.error(`[BOOT] Missing required env: ${missingRequired.join(', ')}`);
}

console.log(
  `[BOOT] PORT=${PORT} DB_HOST=${maskedDbHost} CORS_ORIGIN=${corsSummary} UPLOAD_DIR=${uploadDir} API_PUBLIC_URL=${apiPublicUrl}`
);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}!`));
