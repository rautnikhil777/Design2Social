export async function generateAIImage(prompt) {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  const controller = new AbortController();
  const timeoutMs = 30_000;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetch(`${baseURL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal
    });

    const contentType = res.headers.get('content-type') || '';

    // Robustly detect JSON errors before treating as an image blob.
    if (contentType.includes('application/json')) {
      let json = null;
      try {
        json = await res.json();
      } catch {
        // ignore
      }
      const message =
        json?.error || json?.message ||
        'Pollinations queue/rate-limit or server error';
      throw new Error(message);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text ? text.slice(0, 2000) : `HTTP ${res.status}`);
    }

    const blob = await res.blob();

    // Ensure we have an image-like blob; otherwise, try to surface JSON/text.
    if (!blob || blob.size === 0) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Empty image response');
    }

    const objectUrl = URL.createObjectURL(blob);
    return { imageUrl: objectUrl };
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('AI image request timed out (30s)');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateBrandedAIImage({
  prompt,
  companyName,
  quote,
  brandColor,
  logoUrl
}) {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  const controller = new AbortController();
  const timeoutMs = 60_000;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetch(`${baseURL}/api/ai/generate-branded`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        companyName,
        quote,
        brandColor,
        logoUrl
      }),
      signal: controller.signal
    });

    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      let json = null;
      try {
        json = await res.json();
      } catch {
        // ignore
      }
      const message =
        json?.error || json?.message || 'Branded AI generation failed';
      throw new Error(message);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text ? text.slice(0, 2000) : `HTTP ${res.status}`);
    }

    const blob = await res.blob();

    if (!blob || blob.size === 0) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Empty branded image response');
    }

    const objectUrl = URL.createObjectURL(blob);
    return { imageUrl: objectUrl };
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Branded AI image request timed out (60s)');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}



