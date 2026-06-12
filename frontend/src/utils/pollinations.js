export function buildPollinationsImageUrl(prompt, options = {}) {
  const normalizedPrompt = String(prompt || '').trim();

  if (!normalizedPrompt) {
    throw new Error('Prompt is required');
  }

  const {
    width = 1024,
    height = 1024,
    safe = true,
    seed = Date.now(),
    model = 'flux'
  } = options;

  const query = new URLSearchParams({
    width: String(width),
    height: String(height),
    safe: String(safe),
    seed: String(seed),
    model
  });

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    normalizedPrompt
  )}?${query.toString()}`;
}