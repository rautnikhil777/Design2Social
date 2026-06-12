require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const generateRoutes = require('./routes/generate');
const uploadRoutes = require('./routes/upload');
const creativeRoutes = require('./routes/creative');
const publishRoutes = require('./routes/publish');

const app = express();

// ---- CORS (production-ready, env-driven) ----
// Supported env vars:
// - CORS_ORIGIN: single allowed origin (e.g. https://design2-social.vercel.app)
// - CORS_ORIGINS: comma-separated allowed origins (e.g. http://localhost:5173,https://design2-social.vercel.app)
// - Also always allow localhost for dev if present.
const envOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const devOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const allowedOrigins = Array.from(new Set([...devOrigins, ...envOrigins]));

const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  origin: (origin, callback) => {
    // For same-origin requests (no Origin header), allow.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  }
};

// Handle CORS preflight explicitly to avoid Render/Vercel preflight mismatches.
app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors(corsOptions)(req, res, () => res.sendStatus(204));
  }
  return next();
});

app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

const path = require('path');

// Serve templates + uploads for MVP
app.use('/templates', express.static(path.resolve(process.cwd(), process.env.TEMPLATES_DIR || 'templates')));
app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'))
);

app.get('/health', (req, res) => res.json({ ok: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/creative', creativeRoutes);
app.use('/api/publish', publishRoutes);

module.exports = app;


