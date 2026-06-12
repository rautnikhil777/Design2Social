const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Creative = require('../models/Creative');

const router = express.Router();

router.post('/save', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { prompt, type, quote, template } = req.body;

    if (!prompt || !type || !template) {
      return res.status(400).json({ message: 'prompt, type, template are required' });
    }

    const creative = await Creative.create({ userId, prompt, type, quote: quote || '', template });
    res.json({ creative });
  } catch (e) {
    res.status(500).json({ message: 'Save failed' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const items = await Creative.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ items });
  } catch (e) {
    res.status(500).json({ message: 'History failed' });
  }
});

module.exports = router;

