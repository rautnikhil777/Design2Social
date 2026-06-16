async function fetchAsBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to fetch asset: ${url}`);
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const arrayBuffer = await res.arrayBuffer();

  return {
    mime: contentType.split(';')[0],
    buffer: Buffer.from(arrayBuffer)
  };
}

function dataUrlToBuffer(dataUrl) {
  const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error('Invalid dataUrl');

  return {
    mime: m[1],
    buffer: Buffer.from(m[2], 'base64')
  };
}

function mimeToExtension(mime) {
  const map = {
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/octet-stream': 'bin'
  };

  return map[mime] || 'bin';
}

function getCloudinaryResourceType(mime) {
  if (String(mime).startsWith('video/')) return 'video';
  if (String(mime).startsWith('image/')) return 'image';
  return 'raw';
}

async function uploadVideoToCloudinary({ videoUrl }) {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.VITE_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD;

  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.VITE_CLOUDINARY_API_KEY;

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ||
    process.env.VITE_CLOUDINARY_API_SECRET;

  const uploadPreset =
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    process.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
    process.env.CLOUDINARY_PRESET;

  console.log('[CLOUDINARY] config present:', {
    CLOUDINARY_CLOUD_NAME: Boolean(cloudName),
    CLOUDINARY_API_KEY: Boolean(apiKey),
    CLOUDINARY_API_SECRET: Boolean(apiSecret)
  });

  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary env vars (CLOUDINARY_CLOUD_NAME / CLOUDINARY_UPLOAD_PRESET)');
  }

  let fileBuffer;
  let mime = 'video/mp4';

  if (String(videoUrl || '').startsWith('data:')) {
    const d = dataUrlToBuffer(videoUrl);
    fileBuffer = d.buffer;
    mime = d.mime || mime;
  } else {
    const remote = await fetchAsBuffer(videoUrl);
    fileBuffer = remote.buffer;
    mime = remote.mime || mime;
  }

  const resourceType = getCloudinaryResourceType(mime);
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const ext = mimeToExtension(mime);
  const filename = `reel_${Date.now()}.${ext}`;

  console.log('[CLOUDINARY] upload mime:', mime);
  console.log('[CLOUDINARY] upload resource_type:', resourceType);
  console.log('[CLOUDINARY] upload filename:', filename);
  console.log('[CLOUDINARY] upload bytes:', fileBuffer.length);

  const form = new FormData();
  const blob = new Blob([fileBuffer], { type: mime });

  form.append('file', blob, filename);
  form.append('upload_preset', uploadPreset);

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
    createdAt: json?.created_at,
    resourceType: json?.resource_type,
    format: json?.format,
    mime
  };
}

module.exports = {
  uploadVideoToCloudinary
};