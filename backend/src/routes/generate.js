const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const generator = require('../services/templateGenerator');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { prompt, businessType } = req.body;
    if (!prompt) return res.status(400).json({ message: 'prompt is required' });

    const result = generator.generateOptions({ prompt, businessType });
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: 'Generate failed' });
  }
});

module.exports = router;

