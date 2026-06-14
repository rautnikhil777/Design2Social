const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const reelController = require('../controllers/reelController');

const router = express.Router();

// NEW REEL FEATURE
router.post('/generate', authMiddleware, reelController.generateReel);
router.post('/upload', authMiddleware, reelController.uploadReel);
router.post('/publish', authMiddleware, reelController.publishReel);

module.exports = router;

