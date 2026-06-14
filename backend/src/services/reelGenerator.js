// NEW REEL FEATURE
// Generates a Reel/Video from a prompt using Pollinations video API.

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

function fallbackCaptionFromPrompt(prompt) {
  const p = String(prompt || '').trim();
  if (!p) return '';
  // Keep simple; front-end can pass caption. This is just a default.
  return p.slice(0, 120);
}

async function generateReelFromPrompt({ prompt, caption }) {
  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Pollinations API key');
  }

  // Pollinations has experimental endpoints. Use a best-effort video generation URL.
  // If the upstream returns JSON (queue/rate-limit/errors), we surface it safely.
  const upstreamTimeoutMs = 60_000;

  const upstreamUrl = `https://gen.pollinations.ai/video/${encodeURIComponent(
    prompt
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
    throw new Error(message);
  }

  if (!upstreamRes.ok) {
    const text = await upstreamRes.text().catch(() => '');
    throw new Error(text ? text.slice(0, 2000) : `HTTP ${upstreamRes.status}`);
  }

  // Requirement: Return video URL.
  // Pollinations returns bytes; Cloudinary upload needs a file/URL.
  // To avoid changing existing image upload logic, we will return a data URL.
  const videoBuffer = await upstreamRes.arrayBuffer().then((ab) => Buffer.from(ab));

  // Determine a reasonable mime type
  const mime = contentType && contentType.includes('/') ? contentType : 'video/mp4';
  const base64 = videoBuffer.toString('base64');
  const videoUrl = `data:${mime};base64,${base64}`;

  return {
    videoUrl,
    generatedCaption: caption || fallbackCaptionFromPrompt(prompt)
  };
}

module.exports = {
  generateReelFromPrompt
};

