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

// ✅ FIXED CORS FOR PRODUCTION + LOCAL BOTH
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://design2-social.vercel.app'
  ],
  credentials: true
}));

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

app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/creative', creativeRoutes);
app.use('/api/publish', publishRoutes);

module.exports = app;