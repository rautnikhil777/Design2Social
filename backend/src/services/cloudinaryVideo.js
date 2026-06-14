// NEW REEL FEATURE
const { URL } = require('url');

async function fetchAsBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to fetch asset: ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function dataUrlToBuffer(dataUrl) {
  const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error('Invalid dataUrl');
  const mime = m[1];
  const b64 = m[2];
  return {
    mime,
    buffer: Buffer.from(b64, 'base64')
  };
}

async function uploadVideoToCloudinary({ videoUrl }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary env vars (CLOUDINARY_CLOUD_NAME / CLOUDINARY_UPLOAD_PRESET)');
  }

  // NOTE: Use Cloudinary video endpoint with resource_type: 'video'
  // This is separate from existing image upload logic.
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

  let fileBuffer;
  let mime = 'video/mp4';
  let filename = `reel_${Date.now()}.mp4`;

  if (String(videoUrl || '').startsWith('data:')) {
    const d = dataUrlToBuffer(videoUrl);
    fileBuffer = d.buffer;
    mime = d.mime || mime;
  } else {
    // If it's a remote URL, fetch it.
    fileBuffer = await fetchAsBuffer(videoUrl);
  }

  const FormData = global.FormData || require('form-data');
  const form = new FormData();

  // In Node fetch mode, Cloudinary expects a file stream.
  // form-data can wrap a buffer.
  form.append('file', fileBuffer, { filename, contentType: mime });
  form.append('upload_preset', uploadPreset);
  form.append('resource_type', 'video');

  const res = await fetch(endpoint, {
    method: 'POST',
    body: form
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed: ${text ? text.slice(0, 2000) : res.status}`);
  }

  const json = await res.json();

  return {
    videoUrl: json?.secure_url,
    publicId: json?.public_id,
    createdAt: json?.created_at
  };
}

module.exports = {
  uploadVideoToCloudinary
};

