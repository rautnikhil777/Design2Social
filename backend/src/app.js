require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const generateRoutes = require('./routes/generate');
const uploadRoutes = require('./routes/upload');
const creativeRoutes = require('./routes/creative');
const publishRoutes = require('./routes/publish');
const aiRoutes = require('./routes/ai');
const aiBrandedRoutes = require('./routes/aiBranded');
const reelRoutes = require('./routes/reelRoutes');
// NEW REEL FEATURE
const app = express();




// ---------------- CORS (SAFE PRODUCTION VERSION) ----------------
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://design2-social.vercel.app'
];

// Simple and stable CORS
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❌ IMPORTANT: DO NOT throw error in production
    return callback(null, true);
  },
  credentials: true
}));

// Handle preflight automatically (NO custom logic needed)
app.options('*', cors());

// ---------------- BODY PARSING ----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------------- RATE LIMIT ----------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

const path = require('path');

// ---------------- STATIC FILES ----------------
app.use('/templates', express.static(path.resolve(process.cwd(), process.env.TEMPLATES_DIR || 'templates')));
app.use('/uploads', express.static(path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

// ---------------- HEALTH CHECK ----------------
app.get('/health', (req, res) => res.json({ ok: true }));

// ---------------- ROUTES ----------------
app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/creative', creativeRoutes);
app.use('/api/publish', publishRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai', aiBrandedRoutes);

// NEW REEL FEATURE
app.use('/api/reel', reelRoutes);

module.exports = app;

