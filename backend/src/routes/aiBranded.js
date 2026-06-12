const express = require('express');

const router = express.Router();

function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Upstream request timed out after ${ms}ms`));
    }, ms);
  });
}

async function fetchWithTimeout(url, options, timeoutMs) {
  return await Promise.race([fetch(url, options), timeoutPromise(timeoutMs)]);
}

async function fetchAsBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to fetch asset: ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

router.post('/generate-branded', async (req, res) => {
  const upstreamTimeoutMs = 60_000;

  try {
    const { prompt, companyName, quote, brandColor, logoUrl } = req.body || {};

    const normalizedPrompt = String(prompt || '').trim();
    if (!normalizedPrompt) return res.status(400).json({ message: 'prompt is required' });
    if (!logoUrl) return res.status(400).json({ message: 'logoUrl is required' });

    const apiKey = process.env.POLLINATIONS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Missing Pollinations API key' });
    }

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

    if (contentType.includes('application/json')) {
      const json = await upstreamRes.json().catch(() => null);
      const message = json?.error || json?.message || 'Pollinations returned an error';
      return res.status(upstreamRes.status || 502).json({
        message,
        upstream: { contentType: contentType || undefined },
        details: json
      });
    }

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text().catch(() => '');
      return res.status(upstreamRes.status || 502).json({
        message: 'Pollinations request failed',
        error: text ? text.slice(0, 2000) : undefined
      });
    }

    const bgArrayBuffer = await upstreamRes.arrayBuffer();
    const backgroundBuffer = Buffer.from(bgArrayBuffer);

    const { composeBrandedImage } = require('../services/brandImageComposerFixed');
    const logoBuffer = await fetchAsBuffer(logoUrl);

    const outputBuffer = await composeBrandedImage({
      backgroundBuffer,
      logoBuffer,
      companyName,
      quote,
      brandColor
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(outputBuffer);
  } catch (e) {
    const isTimeout = /timed out/i.test(e?.message || '');
    return res.status(isTimeout ? 504 : 500).json({
      message: 'Branded AI image generation error',
      error: e?.message || 'unknown'
    });
  }
});

module.exports = router;

