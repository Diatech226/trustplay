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

// Connexion à MongoDB
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL est manquant dans votre environnement. Merci de le renseigner.');
  process.exit(1);
}

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log('MongoDB is connected'))
  .catch((err) => {
    console.error('Impossible de se connecter à MongoDB. Vérifiez DATABASE_URL et les droits réseau.', err.message);
    process.exit(1);
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
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
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
app.get('/api/health', (_req, res) => {
  res.json({ success: true });
});
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

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}!`));
