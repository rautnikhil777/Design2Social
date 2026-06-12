const fs = require('fs');
const path = require('path');

const templatesRoot = path.join(process.cwd(), 'backend', 'templates');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>');
}

// NOTE:
// sharp/canvas are not available in this environment.
// To unblock the UI and static serving, we generate SVG markup and save it
// with .png/.jpg filenames. Most browsers will still render it in <img>.
// If you require true binary PNG/JPG, we will need to add an image library.
function writeTemplateFile(filePath, svgMarkup, encoding = 'utf8') {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, svgMarkup, encoding);
}

function makeFlyerSvg({ width, height, bg, title, quote, styleText }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" rx="48" fill="url(#g)"/>
  <rect x="60" y="70" width="880" height="90" rx="22" fill="rgba(0,0,0,0.55)"/>

  <text x="500" y="130" text-anchor="middle" font-family="Arial" font-size="46" fill="#fff" font-weight="700">${esc(title)}</text>

  <g transform="translate(60,190)">
    <rect width="880" height="440" rx="36" fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.08)"/>

    <rect x="40" y="40" width="170" height="170" rx="28" fill="rgba(0,0,0,0.08)"/>
    <rect x="60" y="60" width="130" height="130" rx="26" fill="${bg}"/>

    <text x="125" y="140" text-anchor="middle" font-family="Arial" font-size="44" fill="#fff" font-weight="900">LOGO</text>

    <text x="260" y="120" font-family="Arial" font-size="34" fill="#212529" font-weight="700">${esc(quote)}</text>
    <text x="260" y="220" font-family="Arial" font-size="26" fill="#495057">${esc(styleText)}</text>

    <rect x="260" y="260" width="540" height="110" rx="22" fill="${bg}"/>
    <text x="530" y="325" text-anchor="middle" font-family="Arial" font-size="34" fill="#fff" font-weight="800">DESIGN2SOCIAL</text>
  </g>

  <text x="60" y="675" font-family="Arial" font-size="18" fill="rgba(0,0,0,0.55)">Tap to Generate • Brand • Preview • Save</text>
</svg>`;
}

function makeReelSvg({ width, height, bg, title, sub }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="url(#g)" rx="40"/>
  <rect x="40" y="40" width="880" height="460" rx="30" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)"/>

  <text x="480" y="190" text-anchor="middle" font-family="Arial" font-size="56" fill="#fff" font-weight="800">${esc(title)}</text>
  <text x="480" y="270" text-anchor="middle" font-family="Arial" font-size="28" fill="rgba(255,255,255,0.9)">${esc(sub)}</text>

  <g transform="translate(380,330)">
    <rect width="200" height="120" rx="26" fill="${bg}"/>
    <polygon points="95,35 95,85 55,60" fill="#fff"/>
    <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="20" fill="#fff">PLAY</text>
  </g>

  <text x="70" y="485" font-family="Arial" font-size="22" fill="rgba(255,255,255,0.75)">design2social • reels thumbnails</text>
</svg>`;
}

function main() {
  const flyers = [
    ['clinic', 'flyer1.png', '#0dcaf0', 'Clinic Pulse', 'Next Week Specials', 'IG: @clinicpulse'],
    ['clinic', 'flyer2.png', '#ffc107', 'Smile & Care', 'Book Your Appointment', 'Call Today'],
    ['clinic', 'flyer3.png', '#fd7e14', 'D2S Dental', 'New Patient Offer', 'Limited Slots'],

    ['doctor', 'flyer1.png', '#20c997', 'Dr. Aria Health', 'Same-Day Consults', 'Walk-ins Welcome'],
    ['doctor', 'flyer2.png', '#6610f2', 'CardioCare', 'Heart Check Month', 'Free Screening'],

    ['restaurant', 'flyer1.png', '#dc3545', 'Bite & Bloom', '2-for-1 Lunch', 'Fresh Garden Bowls'],
    ['restaurant', 'flyer2.png', '#198754', 'Green Spoon', 'Chef’s Special', 'Seasonal Menu'],

    ['shop', 'flyer1.png', '#0d6efd', 'ShopSmart', '50% Off Weekend', 'Limited Time'],
    ['shop', 'flyer2.png', '#343a40', 'Tech Corner', 'New Arrivals', 'Free Delivery'],
  ];

  for (const [folder, file, color, title, quote, styleText] of flyers) {
    const outPath = path.join(templatesRoot, folder, file);
    const svg = makeFlyerSvg({
      width: 1000,
      height: 700,
      bg: color,
      title,
      quote,
      styleText
    });
    writeTemplateFile(outPath, svg);
  }

  const reels = [
    ['reels', 'reel1.jpg', '#0dcaf0', 'Reel: Clinic Shots', 'Swipe for Offers'],
    ['reels', 'reel2.jpg', '#dc3545', 'Reel: Chef Moments', 'Order Now'],
    ['reels', 'reel3.jpg', '#6610f2', 'Reel: Shop Drops', 'Limited Edition'],
  ];

  for (const [folder, file, color, title, sub] of reels) {
    const outPath = path.join(templatesRoot, folder, file);
    const svg = makeReelSvg({ width: 960, height: 540, bg: color, title, sub });
    writeTemplateFile(outPath, svg);
  }

  console.log('Generated template assets under', templatesRoot);
}

main();

