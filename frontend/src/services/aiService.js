import { apiClient } from './apiClient';

export async function generateAIImage(prompt) {
  const res = await apiClient.post('/api/ai/generate', { prompt });
  return res.data;
}


