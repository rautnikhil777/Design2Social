const sharp = require('sharp');

function parseHexColor(input, fallback = '#0d6efd') {
  const s = String(input || '').trim();
  if (!s) return fallback;
  const m = s.match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return fallback;
  return `#${m[1].toLowerCase()}`;
}

function hexToRgb(hex) {
  const h = parseHexColor(hex);
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return { r, g, b };
}

function normalizeText(s = '') {
  return String(s).replace(/\s+/g, ' ').trim();
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

function escapeXml(unsafe) {
  return String(unsafe)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&apos;');
}

async function composeBrandedImage({
  backgroundBuffer,
  logoBuffer,
  companyName,
  quote,
  brandColor,
  width = 1080,
  height = 1350
}) {
  const safeCompany = normalizeText(companyName);
  const safeQuote = normalizeText(quote);
  const safeBrand = parseHexColor(brandColor);
  const { r, g, b } = hexToRgb(safeBrand);

  // Resize background to target size
  const canvas = sharp(backgroundBuffer).resize(width, height, { fit: 'cover' });

  // Make logo a PNG buffer for consistent alpha compositing
  const logoSize = Math.round(Math.min(width, height) * 0.12);
  const logoPng = await sharp(logoBuffer)
    .rotate()
    .resize(logoSize, logoSize, { fit: 'contain' })
    .png()
    .toBuffer();

  // Brand banner + text as SVG (reliable programmatic rendering)
  const bannerHeight = Math.round(height * 0.22);
  const bannerTop = height - bannerHeight;
  const bannerOpacity = 0.86;

  const svgText = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgb(${r},${g},${b})" stop-opacity="${bannerOpacity}" />
        <stop offset="1" stop-color="rgb(${r},${g},${b})" stop-opacity="${bannerOpacity * 0.75}" />
      </linearGradient>
    </defs>

    <rect x="0" y="${bannerTop}" width="${width}" height="${bannerHeight}" fill="url(#grad)"/>

    <text x="${Math.round(width * 0.08)}" y="${Math.round(bannerTop + bannerHeight * 0.52)}"
      font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(width * 0.045)}" font-weight="700" fill="#ffffff">${escapeXml(
        safeCompany || 'Company Name'
      )}</text>

    <text x="${Math.round(width * 0.08)}" y="${Math.round(bannerTop + bannerHeight * 0.78)}"
      font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(width * 0.032)}" font-weight="500" fill="#ffffff">${escapeXml(
        safeQuote || 'Your quote here'
      )}</text>
  </svg>`;

  const output = await canvas
    .composite([
      { input: logoPng, left: Math.round(width * 0.06), top: Math.round(height * 0.06), blend: 'over' },
      { input: Buffer.from(svgText), left: 0, top: 0 }
    ])
    .png()
    .toBuffer();

  return output;
}

module.exports = {
  composeBrandedImage,
  fetchAsBuffer
};

