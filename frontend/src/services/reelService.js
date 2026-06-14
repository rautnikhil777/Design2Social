import { apiClient } from './apiClient.js';


// NEW REEL FEATURE
export async function generateReel({ prompt, caption }) {
  const res = await apiClient.post('/api/reel/generate', { prompt, caption });
  return res.data;
}

export async function uploadReel({ videoUrl }) {
  const res = await apiClient.post('/api/reel/upload', { videoUrl });
  return res.data;
}

export async function publishReel({ videoUrl, caption }) {
  const res = await apiClient.post('/api/reel/publish', { videoUrl, caption });
  return res.data;
}

