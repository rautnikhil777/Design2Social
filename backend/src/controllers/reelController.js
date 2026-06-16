// NEW REEL FEATURE
const reelGenerator = require('../services/reelGenerator');
const cloudinaryVideo = require('../services/cloudinaryVideo');
const zapierVideo = require('../services/zapierVideo');

async function safeError(res, status, message, error) {
  return res.status(status).json({
    message,
    error: error?.message || error || undefined
  });
}

const reelController = {
  async generateReel(req, res) {
    try {
      const { prompt, caption } = req.body || {};
      const normalizedPrompt = String(prompt || '').trim();
      if (!normalizedPrompt) {
        return res.status(400).json({ message: 'prompt is required' });
      }

      const { videoUrl, generatedCaption } = await reelGenerator.generateReelFromPrompt({
        prompt: normalizedPrompt,
        caption
      });

      return res.json({ videoUrl, caption: generatedCaption || caption || '' });
    } catch (e) {
      console.error('[REEL][controller] generateReel failed');
      console.error('[REEL][controller] message:', e?.message);
      console.error('[REEL][controller] stack:', e?.stack);
      console.error('[REEL][controller] error:', e);
      return safeError(res, 500, 'Reel generation failed', e);
    }
  },

  async uploadReel(req, res) {
    try {
      const { videoUrl } = req.body || {};
      if (!videoUrl || typeof videoUrl !== 'string') {
        return res.status(400).json({ message: 'videoUrl is required' });
      }

      const upload = await cloudinaryVideo.uploadVideoToCloudinary({ videoUrl });

      return res.json({
        videoUrl: upload.videoUrl,
        publicId: upload.publicId,
        createdAt: upload.createdAt
      });
    } catch (e) {
      console.error('[REEL][controller] uploadReel failed');
      console.error('[REEL][controller] message:', e?.message);
      console.error('[REEL][controller] stack:', e?.stack);
      console.error('[REEL][controller] error:', e);
      return safeError(res, 500, 'Reel upload failed', e);
    }
  },

  async publishReel(req, res) {
    try {
      const { videoUrl, caption } = req.body || {};
      if (!videoUrl || typeof videoUrl !== 'string') {
        return res.status(400).json({ message: 'videoUrl is required' });
      }

      // Backend retry if upload fails (per requirement).
      // Note: this controller assumes `videoUrl` is already uploaded secure_url.
      // If caller passes non-secure URLs, retry logic can still help by re-uploading.
      const maxAttempts = 3;
      let lastErr = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await zapierVideo.publishToZapier({
            type: 'reel',
            videoUrl,
            caption: caption || ''
          });

          return res.json({ success: true, result });
        } catch (e) {
          lastErr = e;

          // Exponential-ish backoff
          const waitMs = 800 * attempt;
          await new Promise((r) => setTimeout(r, waitMs));
        }
      }

      return safeError(res, 502, 'Reel publish failed after retries', lastErr);
    } catch (e) {
      console.error('[REEL][controller] publishReel failed');
      console.error('[REEL][controller] message:', e?.message);
      console.error('[REEL][controller] stack:', e?.stack);
      console.error('[REEL][controller] error:', e);
      return safeError(res, 500, 'Reel publish failed', e);
    }
  }
};

module.exports = reelController;

