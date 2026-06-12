const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Publish = require('../models/Publish');
const Creative = require('../models/Creative');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { creativeId } = req.body;

    if (!creativeId) return res.status(400).json({ message: 'creativeId is required' });

    const creative = await Creative.findOne({ _id: creativeId, userId });
    if (!creative) return res.status(404).json({ message: 'Creative not found' });

    const platforms = ['Instagram', 'Facebook', 'Twitter'];
    const records = await Promise.all(
      platforms.map((platform) =>
        Publish.create({ userId, creativeId, platform, status: 'Success', time: new Date() })
      )
    );

    res.json({ results: records.map((r) => ({ platform: r.platform, status: r.status })) });
  } catch (e) {
    res.status(500).json({ message: 'Publish failed' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const items = await Publish.find({ userId }).sort({ time: -1 }).limit(100);
    res.json({ items });
  } catch (e) {
    res.status(500).json({ message: 'History failed' });
  }
});

module.exports = router;

