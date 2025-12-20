import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import postsRoutes from './routes/posts.route.js';
import commentRoutes from './routes/comment.route.js';
import uploadRoutes from './routes/upload.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { absoluteUploadPath } from './controllers/upload.controller.js';
import cors from 'cors';

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

// Middlewares
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
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

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/uploads', uploadRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ success: true });
});

// Serve uploaded assets
if (!fs.existsSync(absoluteUploadPath)) {
  fs.mkdirSync(absoluteUploadPath, { recursive: true });
}

app.use('/uploads', express.static(absoluteUploadPath));

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
