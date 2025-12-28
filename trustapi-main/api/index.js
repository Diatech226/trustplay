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

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
const resolveCorsOrigin = (origin) => {
  if (allowedOrigins.length === 0) {
    return origin || '*';
  }
  if (!origin) {
    return null;
  }
  return allowedOrigins.includes(origin) ? origin : null;
};
const corsOptions = {
  origin: (origin, callback) => {
    const resolved = resolveCorsOrigin(origin);
    if (resolved) {
      return callback(null, true);
    }
    if (!origin && allowedOrigins.length === 0) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middlewares
app.use(express.json());
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
const corsSummary = allowedOrigins.length ? allowedOrigins.join(',') : '*';

console.log(`[BOOT] PORT=${PORT} DB_HOST=${maskedDbHost} CORS_ORIGIN=${corsSummary}`);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}!`));
