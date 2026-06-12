const path = require('path');
const fs = require('fs');

function normalize(s = '') {
  return String(s).toLowerCase();
}

function pickTemplateSet(prompt) {
  const p = normalize(prompt);
  const hasDiwali = /(diwali|happy diwali|diwali special)/.test(p);
  const hasClinic = /(clinic|doctor|hospital|appointment|skin|dental)/.test(p);
  const hasRestaurant = /(restaurant|pizza|burger|cafe|coffee|menu)/.test(p);
  const hasShop = /(shop|sale|discount|offer|store)/.test(p);

  if (hasDiwali) return 'diwali';
  if (hasClinic) return 'clinic';
  if (hasRestaurant) return 'restaurant';
  if (hasShop) return 'shop';
  return 'general';
}

function existingFiles(baseDir, files) {
  return files.filter((f) => fs.existsSync(path.join(baseDir, f)));
}

function sample3(arr) {
  const out = [];
  for (let i = 0; i < arr.length && out.length < 3; i++) out.push(arr[i]);
  while (out.length < 3) out.push(out[out.length - 1] || arr[0] || '');
  return out.slice(0, 3);
}

function generateOptions({ prompt, businessType }) {
  const templatesDir = process.env.TEMPLATES_DIR || 'templates';

  // Exact businessType → template folders
  const normalized = String(businessType || '').trim().toLowerCase();
  let set;
  if (normalized === 'clinic') set = 'clinic';
  else if (normalized === 'doctor') set = 'doctor';
  else if (normalized === 'restaurant') set = 'restaurant';
  else if (normalized === 'shop') set = 'shop';
  else set = 'general';

  const flyerBase = path.join(__dirname, '..', '..', templatesDir, set);
  const reelBase = path.join(__dirname, '..', '..', templatesDir, 'reels');

  const flyerCandidates = ['flyer1.png', 'flyer2.png', 'flyer3.png'];
  const reelCandidates = ['reel1.jpg', 'reel2.jpg', 'reel3.jpg'];

  const flyerExisting = existingFiles(flyerBase, flyerCandidates);
  const reelExisting = existingFiles(reelBase, reelCandidates);

  const baseURL = process.env.PUBLIC_BASE_URL || 'http://localhost:4000';

  const flyers = sample3(flyerExisting).map((file) => ({
    template: `${baseURL}/templates/${set}/${file}`,
    type: 'Flyer',
    quote: ''
  }));

  const reels = sample3(reelExisting).map((file) => ({
    template: `${baseURL}/templates/reels/${file}`,
    type: 'Reel',
    quote: ''
  }));

  return { set, flyers, reels };
}


module.exports = { generateOptions };

