// NEW REEL FEATURE
// Generates a Reel/Video from a prompt using Pollinations API.

function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Upstream request timed out after ${ms}ms`));
    }, ms);
  });
}

async function fetchWithTimeout(url, options, timeoutMs) {
  return await Promise.race([
    fetch(url, options),
    timeoutPromise(timeoutMs)
  ]);
}

function fallbackCaptionFromPrompt(prompt) {
  const p = String(prompt || '').trim();
  if (!p) return '';
  return p.slice(0, 120);
}

function buildPollinationsVideoUrl(prompt) {
  const params = new URLSearchParams({
    model: 'veo',
    duration: '5'
  });

  return `https://gen.pollinations.ai/video/${encodeURIComponent(prompt)}?${params.toString()}`;
}

async function readErrorBody(res) {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();

  try {
    if (contentType.includes('application/json')) {
      const json = await res.json();

      if (typeof json === 'string') return json;
      if (json?.error && typeof json.error === 'string') return json.error;
      if (json?.message && typeof json.message === 'string') return json.message;
      if (json?.error?.message) return json.error.message;
      if (json?.details) return typeof json.details === 'string' ? json.details : JSON.stringify(json.details);
      return JSON.stringify(json);
    }

    const text = await res.text();
    return text ? text.slice(0, 2000) : `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

async function generateReelFromPrompt({ prompt, caption }) {
  try {
    console.log('[REEL] generation start');

    const cleanPrompt = String(prompt || '').trim();
    if (!cleanPrompt) {
      throw new Error('Prompt is required');
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Pollinations API key');
    }

    const upstreamTimeoutMs = 120_000;
    const upstreamUrl = buildPollinationsVideoUrl(cleanPrompt);

    console.log('[REEL] upstream URL:', upstreamUrl);

    const upstreamRes = await fetchWithTimeout(
      upstreamUrl,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      },
      upstreamTimeoutMs
    );

    console.log('[REEL] Pollinations response received');
    console.log('[REEL] upstream status:', upstreamRes.status);

    const contentType = (upstreamRes.headers.get('content-type') || '').toLowerCase();
    console.log('[REEL] upstream content-type:', contentType);

    if (!upstreamRes.ok) {
      const message = await readErrorBody(upstreamRes);
      throw new Error(`Pollinations request failed (${upstreamRes.status}): ${message}`);
    }

    if (contentType.includes('application/json')) {
      const message = await readErrorBody(upstreamRes);
      throw new Error(`Pollinations returned JSON instead of video: ${message}`);
    }

    if (!contentType.startsWith('video/')) {
      throw new Error(
        `Pollinations did not return a video. Received content-type: ${contentType || 'unknown'}`
      );
    }

    const videoBuffer = Buffer.from(await upstreamRes.arrayBuffer());

    if (!videoBuffer.length) {
      throw new Error('Pollinations returned an empty video file');
    }

    console.log('[REEL] video bytes:', videoBuffer.length);

    const base64 = videoBuffer.toString('base64');
    const tempDataUrl = `data:${contentType};base64,${base64}`;

    const { uploadVideoToCloudinary } = require('./cloudinaryVideo');

    console.log('[REEL] Cloudinary upload start');
    const upload = await uploadVideoToCloudinary({ videoUrl: tempDataUrl });
    console.log('[REEL] Cloudinary upload success URL:', upload?.videoUrl);

    if (!upload?.videoUrl) {
      throw new Error('Cloudinary did not return a hosted video URL');
    }

    if (upload?.resourceType && upload.resourceType !== 'video') {
      throw new Error(
        `Uploaded asset is not a video. Cloudinary resource_type: ${upload.resourceType}`
      );
    }

    return {
      videoUrl: upload.videoUrl,
      generatedCaption: caption || fallbackCaptionFromPrompt(cleanPrompt)
    };
  } catch (e) {
    console.error('[REEL] generateReelFromPrompt failed');
    console.error('[REEL] message:', e?.message);
    console.error('[REEL] stack:', e?.stack);
    console.error('[REEL] error:', e);
    throw e;
  }
}

module.exports = {
  generateReelFromPrompt
};