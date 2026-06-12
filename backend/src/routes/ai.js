const express = require('express');

const router = express.Router();

function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Upstream request timed out after ${ms}ms`));
    }, ms);
    // NOTE: rejection clears automatically via clearTimeout
  });
}

async function fetchWithTimeout(url, options, timeoutMs) {
  return await Promise.race([
    fetch(url, options),
    timeoutPromise(timeoutMs)
  ]);
}

router.post('/generate', async (req, res) => {
  const upstreamTimeoutMs = 30_000;

  try {
    const { prompt } = req.body || {};
    const normalizedPrompt = String(prompt || '').trim();

    if (!normalizedPrompt) {
      return res.status(400).json({ message: 'prompt is required' });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Missing Pollinations API key' });
    }

    // Pollinations image endpoint returns image bytes.
    const upstreamUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(
      normalizedPrompt
    )}?model=flux`;

    const upstreamRes = await fetchWithTimeout(
      upstreamUrl,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      },
      upstreamTimeoutMs
    );

    const contentType = upstreamRes.headers.get('content-type') || '';

    // If upstream returns JSON (queue/rate-limit/errors), don't treat it as an image.
    if (contentType.includes('application/json')) {
      const json = await upstreamRes.json().catch(() => null);
      const message =
        json?.error || json?.message || 'Pollinations returned an error';

      return res.status(upstreamRes.status || 502).json({
        message,
        upstream: {
          contentType: contentType || undefined
        },
        details: json
      });
    }

    if (!upstreamRes.ok) {
      // Try to read as text for better debugging.
      const text = await upstreamRes.text().catch(() => '');
      return res.status(upstreamRes.status || 502).json({
        message: 'Pollinations request failed',
        error: text ? text.slice(0, 2000) : undefined
      });
    }

    // Stream-safe approach: read as arrayBuffer into a Buffer.
    const arrayBuffer = await upstreamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType || 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(buffer);
  } catch (e) {
    const isTimeout = /timed out/i.test(e?.message || '');
    return res.status(isTimeout ? 504 : 500).json({
      message: 'AI image generation error',
      error: e?.message || 'unknown'
    });
  }
});

module.exports = router;

