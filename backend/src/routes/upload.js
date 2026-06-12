const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

const uploadDir = path.resolve(
  process.cwd(),
  process.env.UPLOAD_DIR || 'uploads'
);
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.png';
    const fname = `logo_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, fname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  }
});

router.post('/', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!req.file) return res.status(400).json({ message: 'logo is required' });

    const logoRelPath = path.posix.join('/uploads', req.file.filename);
    const absoluteFilePath = req.file.path;

    if (!absoluteFilePath || !fs.existsSync(absoluteFilePath)) {
      return res.status(500).json({
        success: false,
        message: 'Upload succeeded but file not found on disk'
      });
    }

    await User.findByIdAndUpdate(userId, { logo: logoRelPath });

    const baseUrl = `http://localhost:${process.env.PORT || 4000}`;

    // log absolute path for verification
    console.log('[upload] absolute file path:', absoluteFilePath);

    return res.status(200).json({
      success: true,
      logo: logoRelPath,
      fullUrl: `${baseUrl}${logoRelPath}`
    });
  } catch (e) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;

